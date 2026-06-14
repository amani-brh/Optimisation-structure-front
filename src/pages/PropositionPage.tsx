import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

interface OptPoint {
  l: number;
  L: number;
  ap: number;
  ad: number;
  ht: number;
  qp: number;
  R: number;
  P: number;
  score: number;
}

interface LinReg { m: number; b: number; R2: number; }

interface OptResult {
  pts: OptPoint[];
  best: OptPoint;
  Llist: number[];
  rRL: LinReg; rPL: LinReg;
  rRa: LinReg; rPa: LinReg;
  rRP: LinReg;
}

const TR: Record<string, [number, number]> = {
  '0': [0.005, 1], 'II': [0.05, 2], 'IIIa': [0.2, 5], 'IIIb': [0.5, 9], 'IV': [1, 15],
};

function linReg(xs: number[], ys: number[]): LinReg {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const m = den ? num / den : 0;
  const b = my - m * mx;
  const sst = ys.reduce((a, v) => a + (v - my) ** 2, 0);
  const sse = ys.reduce((a, v, i) => a + (v - (m * xs[i] + b)) ** 2, 0);
  return { m, b, R2: sst ? 1 - sse / sst : 1 };
}

function linSpace(a: number, b: number, n: number): number[] {
  const r: number[] = [];
  for (let i = 0; i < n; i++) r.push(a + (b - a) * i / (n - 1));
  return r;
}

function qual(r: number): string {
  return r >= 0.9 ? 'Excellente ✓' : r >= 0.7 ? 'Bonne' : 'Faible';
}

function fmtReg(r: LinReg, xn: string): string {
  const sign = r.b >= 0 ? '+' : '-';
  return `y=${r.m.toFixed(4)}·${xn}${sign}${Math.abs(r.b).toFixed(4)}`;
}

function cpeMurs(hd: number): Record<string, number> {
  const lo = { A: -1.2, B: -0.8, C: -0.5, D: 0.7, E: -0.3 };
  const hi = { A: -1.2, B: -0.8, C: -0.5, D: 0.8, E: -0.5 };
  if (hd <= 0.25) return lo;
  if (hd >= 1) return hi;
  const t = (hd - 0.25) / 0.75;
  const r: Record<string, number> = {};
  for (const k in lo) r[k] = lo[k as keyof typeof lo] + t * (hi[k as keyof typeof hi] - lo[k as keyof typeof lo]);
  return r;
}

function cpeToit(a: number): Record<string, number> {
  const T: Record<number, Record<string, number>> = {
    5:  { F: -1.7, G: -1.2, H: -0.6, I: -0.6, J:  0.2 },
    15: { F: -0.9, G: -0.8, H: -0.3, I: -0.4, J: -1.0 },
    30: { F: -0.5, G: -0.5, H: -0.2, I: -0.4, J: -0.5 },
    45: { F:  0.0, G:  0.0, H:  0.0, I: -0.2, J: -0.3 },
  };
  const ks = [5, 15, 30, 45];
  if (a <= 5) return T[5];
  if (a >= 45) return T[45];
  for (let i = 0; i < ks.length - 1; i++) {
    if (a <= ks[i + 1]) {
      const t = (a - ks[i]) / (ks[i + 1] - ks[i]);
      const r: Record<string, number> = {};
      for (const k in T[ks[i]]) r[k] = T[ks[i]][k] + t * (T[ks[i + 1]][k] - T[ks[i]][k]);
      return r;
    }
  }
  return T[45];
}

const WEIGHTS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

const scOpts = (xl: string, yl: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { boxWidth: 9, font: { size: 9 } } } },
  scales: {
    x: { title: { display: true, text: xl, color: '#6B85A0', font: { size: 9 } }, grid: { color: 'rgba(26,46,69,.5)' } },
    y: { title: { display: true, text: yl, color: '#6B85A0', font: { size: 9 } }, grid: { color: 'rgba(26,46,69,.5)' }, beginAtZero: false },
  },
});

export default function PropositionPage() {
  const [result, setResult] = useState<OptResult | null>(null);
  const [formData, setFormData] = useState({
    S: 6192, h: 9, cat: 'IIIb', vb0: 24,
    C0: 1, Cdir: 1, Csea: 1, rho: 1.225,
    CsCd1: 0.81, Cp1: 0.2, Cp2: -0.3,
    lmin: 10, lmax: 25, amin: 10, amax: 30, wR: 0.5,
  });

  const canvasRlRef = useRef<HTMLCanvasElement>(null);
  const canvasRaRef = useRef<HTMLCanvasElement>(null);
  const canvasRPRef = useRef<HTMLCanvasElement>(null);
  const chartRl = useRef<Chart | null>(null);
  const chartRa = useRef<Chart | null>(null);
  const chartRP = useRef<Chart | null>(null);

  useEffect(() => {
    if (!result || !canvasRlRef.current || !canvasRaRef.current || !canvasRPRef.current) return;

    chartRl.current?.destroy();
    chartRa.current?.destroy();
    chartRP.current?.destroy();

    const { pts, best, rRL, rPL, rRa, rPa, rRP } = result;
    const xs_l = pts.map(p => p.l);
    const xs_a = pts.map(p => p.ap);
    const Rs   = pts.map(p => p.R);
    const Ps   = pts.map(p => p.P);

    const ptR = pts.map(p => p === best ? '#FF5370' : 'rgba(0,212,255,.5)');
    const ptP = pts.map(p => p === best ? '#FF5370' : 'rgba(0,229,160,.5)');
    const ll  = linSpace(Math.min(...xs_l), Math.max(...xs_l), 50);
    const al  = linSpace(Math.min(...xs_a), Math.max(...xs_a), 50);
    const rl  = linSpace(Math.min(...Rs),   Math.max(...Rs),   50);

    chartRl.current = new Chart(canvasRlRef.current, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'R', data: pts.map(p => ({ x: p.l, y: p.R })), backgroundColor: ptR, pointRadius: 4 },
          { label: 'P', data: pts.map(p => ({ x: p.l, y: p.P })), backgroundColor: ptP, pointRadius: 4, pointStyle: 'triangle' as const },
          { label: 'Régr.R', data: ll.map(x => ({ x, y: rRL.m * x + rRL.b })), type: 'line' as const, borderColor: '#00D4FF', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0 } as any,
          { label: 'Régr.P', data: ll.map(x => ({ x, y: rPL.m * x + rPL.b })), type: 'line' as const, borderColor: '#00E5A0', borderWidth: 1.5, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0 } as any,
        ],
      },
      options: scOpts('l (m)', 'daN/m²') as any,
    });

    chartRa.current = new Chart(canvasRaRef.current, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'R', data: pts.map(p => ({ x: p.ap, y: p.R })), backgroundColor: ptR, pointRadius: 4 },
          { label: 'P', data: pts.map(p => ({ x: p.ap, y: p.P })), backgroundColor: ptP, pointRadius: 4, pointStyle: 'triangle' as const },
          { label: 'Régr.R', data: al.map(x => ({ x, y: rRa.m * x + rRa.b })), type: 'line' as const, borderColor: '#00D4FF', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0 } as any,
          { label: 'Régr.P', data: al.map(x => ({ x, y: rPa.m * x + rPa.b })), type: 'line' as const, borderColor: '#00E5A0', borderWidth: 1.5, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0 } as any,
        ],
      },
      options: scOpts('α (%)', 'daN/m²') as any,
    });

    chartRP.current = new Chart(canvasRPRef.current, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Points',
            data: pts.map(p => ({ x: p.R, y: p.P })),
            backgroundColor: pts.map(p => p === best ? '#FF5370' : 'rgba(255,184,77,.45)'),
            pointRadius: 4,
          },
          { label: 'P=f(R)', data: rl.map(x => ({ x, y: rRP.m * x + rRP.b })), type: 'line' as const, borderColor: '#FFB84D', borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0 } as any,
        ],
      },
      options: scOpts('R (daN/m²)', 'P (daN/m²)') as any,
    });

    return () => {
      chartRl.current?.destroy();
      chartRa.current?.destroy();
      chartRP.current?.destroy();
    };
  }, [result]);

  const runProposition = () => {
    const { S, h, cat, vb0, C0, Cdir, Csea, rho, CsCd1, Cp1, Cp2, lmin, lmax, amin, amax, wR } = formData;
    const [z0, zmin] = TR[cat] ?? [0.5, 9];
    const Vb = Cdir * Csea * vb0;

    const Lmin_raw = S / lmax;
    const Lmax_raw = S / lmin;
    const L_start  = Math.ceil(Lmin_raw / 6) * 6;
    const L_end    = Math.floor(Lmax_raw / 6) * 6;

    const larr: number[] = [];
    for (let Lv = L_start; Lv <= L_end + 0.001; Lv += 6) {
      const lv = S / Lv;
      if (lv >= lmin - 0.001 && lv <= lmax + 0.001) larr.push(lv);
    }

    if (larr.length === 0) {
      alert(`Aucune valeur de L multiple de 6 m trouvée.\nL varie entre ${Lmin_raw.toFixed(1)} m et ${Lmax_raw.toFixed(1)} m.`);
      return;
    }

    const aParr = linSpace(amin, amax, 5);
    const aDarr = aParr.map(p => (Math.atan(p / 100) * 180) / Math.PI);
    const pts: OptPoint[] = [];

    for (const l of larr) {
      const L = S / l;
      const Lround = Math.round(L / 6) * 6;
      for (let ai = 0; ai < aParr.length; ai++) {
        const ap = aParr[ai];
        const ad = aDarr[ai];
        const F  = (l / 2) * Math.tan((ad * Math.PI) / 180);
        const ht = h + F;
        const z02 = 0.05;
        const kr  = 0.19 * Math.pow(z0 / z02, 0.07);
        const Ze  = Math.max(ht, zmin);
        const Cr  = kr * Math.log(Ze / z0);
        const kl  = C0 * (1 - 0.0002 * Math.pow(Math.log10(z0) + 3, 6));
        const Ce  = (1 + (7 * kl * kr) / (C0 * Cr)) * Math.pow(C0 * Cr, 2);
        const qp  = (0.5 * rho * Math.pow(Vb, 2) * Ce) / 10;

        const wall: number[] = [];
        for (const cm of [cpeMurs(ht / L), cpeMurs(ht / l)]) {
          for (const v of Object.values(cm)) {
            wall.push(CsCd1 * qp * v - qp * Cp1, CsCd1 * qp * v - qp * Cp2);
          }
        }
        const R = Math.max(...wall.map(Math.abs));

        const toit: number[] = [];
        for (const v of Object.values(cpeToit(ad))) {
          toit.push(CsCd1 * qp * v - qp * Cp1, CsCd1 * qp * v - qp * Cp2);
        }
        const Pv = Math.abs(Math.min(...toit));

        pts.push({
          l:     +l.toFixed(2),
          L:     Lround,
          ap:    +ap.toFixed(1),
          ad:    +ad.toFixed(2),
          ht:    +ht.toFixed(3),
          qp:    +qp.toFixed(3),
          R:     +R.toFixed(3),
          P:     +Pv.toFixed(3),
          score: +(wR * R + (1 - wR) * Pv).toFixed(3),
        });
      }
    }

    const best   = pts.reduce((a, b) => (a.score < b.score ? a : b));
    const xs_l   = pts.map(p => p.l);
    const xs_a   = pts.map(p => p.ap);
    const Rs     = pts.map(p => p.R);
    const Ps     = pts.map(p => p.P);
    const Llist  = [...new Set(pts.map(p => p.L))].sort((a, b) => a - b);

    setResult({ pts, best, Llist, rRL: linReg(xs_l, Rs), rPL: linReg(xs_l, Ps), rRa: linReg(xs_a, Rs), rPa: linReg(xs_a, Ps), rRP: linReg(Rs, Ps) });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: isNaN(Number(value)) ? value : Number(value) }));
  };

  return (
    <main className="main-content">
      <div className="proposition-container">

        {/* ── Input card ── */}
        <div className="card">
          <div className="cardhd">
            <div className="ctitle"><span className="cbar" />Proposition Technique — EN 1991-1-4</div>
            <span className="ctag tc">Optimisation géométrie</span>
          </div>

          <div className="prop-inputs">
            <div className="input-group">
              <label>Surface S (m²) — fixe</label>
              <input type="number" name="S" value={formData.S} onChange={handleChange} step="10" />
            </div>
            <div className="input-group">
              <label>Hauteur h (m)</label>
              <input type="number" name="h" value={formData.h} onChange={handleChange} step="0.5" />
            </div>
            <div className="input-group">
              <label>Catégorie terrain</label>
              <select name="cat" value={formData.cat} onChange={handleChange}>
                <option value="0">0 — Mer / côtes</option>
                <option value="II">II — Rase campagne</option>
                <option value="IIIa">IIIa — Bocage dispersé</option>
                <option value="IIIb">IIIb — Zones urbanisées</option>
                <option value="IV">IV — Zones urbaines</option>
              </select>
            </div>
            <div className="input-group">
              <label>Vb0 (m/s)</label>
              <input type="number" name="vb0" value={formData.vb0} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>l min (m)</label>
              <input type="number" name="lmin" value={formData.lmin} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>l max (m)</label>
              <input type="number" name="lmax" value={formData.lmax} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>α min (%)</label>
              <input type="number" name="amin" value={formData.amin} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>α max (%)</label>
              <input type="number" name="amax" value={formData.amax} onChange={handleChange} />
            </div>
          </div>

          <div className="slider-group">
            <div className="slider-header">
              <span>Pondération w(R)</span>
              <span className="slider-val">{formData.wR.toFixed(2)}</span>
            </div>
            <input
              type="range" name="wR" min="0" max="1" step="0.05"
              value={formData.wR} onChange={handleChange}
              style={{ '--pct': `${formData.wR * 100}%` } as React.CSSProperties}
            />
            <div className="slider-labels">
              <span>← Résultante R</span>
              <span>Portance P →</span>
            </div>
          </div>

          <button className="btn-primary" onClick={runProposition}>
            PROPOSITION
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <>
            {/* Banner */}
            <div className="prop-banner">
              <div className="banner-icon">★</div>
              <div className="banner-body">
                <div className="banner-title">
                  Proposition terminée — {result.pts.length} points
                  <span className="banner-badge">
                    L ∈ {'{' + result.Llist.join(', ') + '}'} m (multiples de 6)
                  </span>
                </div>
                <div className="banner-sub">
                  S={formData.S} m² fixe · L multiple de 6 m · l=S/L · Score=w·R+(1−w)·P
                </div>
                <div className="banner-pills">
                  <span className="obp">l*=<strong>{result.best.l}m</strong></span>
                  <span className="obp">L*=<strong>{result.best.L}m ✓×6</strong></span>
                  <span className="obp">α*=<strong>{result.best.ap}% ({result.best.ad}°)</strong></span>
                  <span className="obp">R=<strong>{result.best.R}</strong></span>
                  <span className="obp">P=<strong>{result.best.P}</strong></span>
                </div>
              </div>
            </div>

            {/* Optimal metrics */}
            <div className="card">
              <div className="cardhd">
                <div className="ctitle"><span className="cbar" />Configuration optimale</div>
              </div>
              <div className="opt-metrics">
                {([
                  { l: 'l* optimal',   v: `${result.best.l}`,   u: 'm',      hi: true },
                  { l: 'L*=S/l (×6)', v: `${result.best.L}`,   u: 'm',      hi: true },
                  { l: 'α*',           v: `${result.best.ap}%`, u: '',       hi: true },
                  { l: 'R min',        v: `${result.best.R}`,   u: 'daN/m²', hi: false },
                  { l: 'P min',        v: `${result.best.P}`,   u: 'daN/m²', hi: false },
                ] as const).map(m => (
                  <div key={m.l} className={`met${m.hi ? ' hi' : ''}`}>
                    <div className="mlbl">{m.l}</div>
                    <div className="mval">{m.v}<span className="munit">{m.u}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts row 1: R&P vs l  |  R&P vs α */}
            <div className="charts-grid">
              <div className="card">
                <div className="cardhd">
                  <div className="ctitle"><span className="cbar" />R et P vs l (m)</div>
                </div>
                <div className="chart-wrap"><canvas ref={canvasRlRef} /></div>
                <hr className="sep" />
                <div className="reg-grid">
                  <div className="rc">
                    <div className="rl">R vs l</div>
                    <div className="re">{fmtReg(result.rRL, 'l')}</div>
                    <div className="rr">R²=<strong>{result.rRL.R2.toFixed(4)}</strong> — {qual(result.rRL.R2)}</div>
                  </div>
                  <div className="rc">
                    <div className="rl">P vs l</div>
                    <div className="re">{fmtReg(result.rPL, 'l')}</div>
                    <div className="rr">R²=<strong>{result.rPL.R2.toFixed(4)}</strong> — {qual(result.rPL.R2)}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="cardhd">
                  <div className="ctitle"><span className="cbar am" />R et P vs α (%)</div>
                </div>
                <div className="chart-wrap"><canvas ref={canvasRaRef} /></div>
                <hr className="sep" />
                <div className="reg-grid">
                  <div className="rc">
                    <div className="rl">R vs α</div>
                    <div className="re">{fmtReg(result.rRa, 'α')}</div>
                    <div className="rr">R²=<strong>{result.rRa.R2.toFixed(4)}</strong> — {qual(result.rRa.R2)}</div>
                  </div>
                  <div className="rc">
                    <div className="rl">P vs α</div>
                    <div className="re">{fmtReg(result.rPa, 'α')}</div>
                    <div className="rr">R²=<strong>{result.rPa.R2.toFixed(4)}</strong> — {qual(result.rPa.R2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row 2: Corrélation R↔P  |  Toutes pondérations */}
            <div className="charts-grid">
              <div className="card">
                <div className="cardhd">
                  <div className="ctitle"><span className="cbar vl" />Corrélation R ↔ P</div>
                </div>
                <div className="chart-wrap"><canvas ref={canvasRPRef} /></div>
                <div className="rc" style={{ marginTop: '0.7rem' }}>
                  <div className="rl">P=f(R)</div>
                  <div className="re">{fmtReg(result.rRP, 'R')}</div>
                  <div className="rr">R²=<strong>{result.rRP.R2.toFixed(4)}</strong> — {qual(result.rRP.R2)}</div>
                </div>
              </div>

              <div className="card">
                <div className="cardhd">
                  <div className="ctitle"><span className="cbar em" />Toutes pondérations w</div>
                </div>
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>w(R)</th><th>w(P)</th><th>l*(m)</th><th>L*(m)×6</th>
                        <th>α*</th><th>R*</th><th>P*</th><th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEIGHTS.map(w => {
                        const scores = result.pts.map(p => w * p.R + (1 - w) * p.P);
                        const bi = scores.indexOf(Math.min(...scores));
                        const bp = result.pts[bi];
                        const sc = +scores[bi].toFixed(3);
                        return (
                          <tr key={w}>
                            <td>{w.toFixed(1)}</td>
                            <td>{(1 - w).toFixed(1)}</td>
                            <td><strong>{bp.l}</strong></td>
                            <td><strong>{bp.L}</strong></td>
                            <td>{bp.ap}%</td>
                            <td>{bp.R}</td>
                            <td>{bp.P}</td>
                            <td>{sc}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Full grid table */}
            <div className="card">
              <div className="cardhd">
                <div className="ctitle"><span className="cbar" />Grille l × α</div>
                <span className="ctag ts">{result.pts.length} pts · L∈{'{' + result.Llist.join(',') + '}'} m</span>
              </div>
              <div className="tw">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>l(m)</th><th>L(m)×6</th><th>α%</th><th>α°</th>
                      <th>ht</th><th>qp</th><th>R</th><th>P</th><th>Score</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.pts].sort((a, b) => a.score - b.score).map((p, i) => (
                      <tr key={i} className={p === result.best ? 'opt' : ''}>
                        <td>{p.l}</td>
                        <td>{p.L}</td>
                        <td>{p.ap}%</td>
                        <td>{p.ad}°</td>
                        <td>{p.ht}</td>
                        <td>{p.qp}</td>
                        <td className={p.R > 70 ? 'neg' : ''}>{p.R}</td>
                        <td className={p.P > 70 ? 'neg' : ''}>{p.P}</td>
                        <td>{p.score}</td>
                        <td>{p === result.best ? <span className="ctag tc">★ Opt</span> : null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
