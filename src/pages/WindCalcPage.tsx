import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  TERRAIN_TABLE,
  ec1Core,
  cpeMurs,
  cpeToit,
  calcForces,
  type TerrainCat,
  type CoreResult,
  type WallCpe,
  type RoofCpe,
  type ForcePair,
} from '../services/ec1';
import WindSchemas from '../components/WindSchemas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Inputs {
  d: number;
  b: number;
  h: number;
  apct: number;
  cat: TerrainCat;
  vb0: number;
  C0: number;
  Cdir: number;
  Csea: number;
  rho: number;
  CsCd1: number;
  CsCd2: number;
  Cp1: number;
  Cp2: number;
}

interface CalcResult {
  inputs: Inputs;
  P: CoreResult;
  cm1: WallCpe;
  cm2: WallCpe;
  ct: RoofCpe;
  fmW1: Record<'A' | 'B' | 'C' | 'D' | 'E', ForcePair>;
  fmW2: Record<'A' | 'B' | 'C' | 'D' | 'E', ForcePair>;
  ftW1: Record<'F' | 'G' | 'H' | 'I' | 'J', ForcePair>;
  ftW2: Record<'F' | 'G' | 'H' | 'I' | 'J', ForcePair>;
}

const DEFAULTS: Inputs = {
  d: 172,
  b: 36,
  h: 9,
  apct: 15,
  cat: 'IIIb',
  vb0: 24,
  C0: 1,
  Cdir: 1,
  Csea: 1,
  rho: 1.225,
  CsCd1: 0.81,
  CsCd2: 0.77,
  Cp1: 0.2,
  Cp2: -0.3,
};

export default function WindCalcPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [W1on, setW1] = useState(true);
  const [W2on, setW2] = useState(true);
  const [result, setResult] = useState<CalcResult | null>(null);

  const alphaDeg = useMemo(
    () => ((Math.atan(inputs.apct / 100) * 180) / Math.PI).toFixed(4),
    [inputs.apct],
  );

  const upd = <K extends keyof Inputs>(k: K, v: Inputs[K]) =>
    setInputs((s) => ({ ...s, [k]: v }));

  const numInput = (k: keyof Inputs, label: string, step = 1) => (
    <div className="fld" key={k as string}>
      <label>{label}</label>
      <input
        type="number"
        value={inputs[k] as number}
        step={step}
        onChange={(e) =>
          upd(k, (parseFloat(e.target.value) || 0) as Inputs[typeof k])
        }
      />
    </div>
  );

  const run = () => {
    const P = ec1Core(inputs);
    const cm1 = cpeMurs(P.hd1);
    const cm2 = cpeMurs(P.hd2);
    const ct = cpeToit(P.adeg);
    setResult({
      inputs,
      P,
      cm1,
      cm2,
      ct,
      fmW1: calcForces(cm1, inputs.CsCd1, P.qp, inputs.Cp1, inputs.Cp2),
      fmW2: calcForces(cm2, inputs.CsCd2, P.qp, inputs.Cp1, inputs.Cp2),
      ftW1: calcForces(ct, inputs.CsCd1, P.qp, inputs.Cp1, inputs.Cp2),
      ftW2: calcForces(ct, inputs.CsCd2, P.qp, inputs.Cp1, inputs.Cp2),
    });
  };

  return (
    <div className="app">
      {/* ────────── SIDEBAR ────────── */}
      <aside className="sidebar">
        <div className="sbg">
          <div className="sblbl">
            <span className="sbdot" />
            Géométrie
          </div>
          <div className="g2s">
            {numInput('d', 'd — longueur (m)')}
            {numInput('b', 'b — largeur (m)')}
          </div>
          <div className="g2s">
            {numInput('h', 'Hauteur h (m)', 0.5)}
            {numInput('apct', 'Pente α (%)')}
          </div>
          <div className="apill">
            <span className="pct">{inputs.apct} %</span>
            <span className="arr">= arctan({inputs.apct}/100) =</span>
            <span className="deg">{alphaDeg}°</span>
          </div>
        </div>

        <div className="sbg">
          <div className="sblbl">
            <span className="sbdot em" />
            Site & Vent
          </div>
          <div className="fld">
            <label>Catégorie de terrain</label>
            <select
              value={inputs.cat}
              onChange={(e) => upd('cat', e.target.value as TerrainCat)}
            >
              <option value="0">0 — Mer, lacs, côtes exposées</option>
              <option value="II">II — Rase campagne</option>
              <option value="IIIa">IIIa — Campagne, bocage</option>
              <option value="IIIb">IIIb — Zones urbanisées</option>
              <option value="IV">IV — Zones urbaines denses</option>
            </select>
          </div>
          <div className="g2s">
            <div className="fld">
              <label>Région Vb0</label>
              <select
                value={inputs.vb0}
                onChange={(e) => upd('vb0', parseFloat(e.target.value))}
              >
                <option value="22">R1 — 22 m/s</option>
                <option value="24">R2 — 24 m/s</option>
                <option value="26">R3 — 26 m/s</option>
                <option value="28">R4 — 28 m/s</option>
              </select>
            </div>
            {numInput('C0', 'C0 (orograph.)', 0.01)}
          </div>
          <div className="g3s">
            {numInput('Cdir', 'Cdir', 0.01)}
            {numInput('Csea', 'Csea', 0.01)}
            {numInput('rho', 'ρ kg/m³', 0.001)}
          </div>
        </div>

        <div className="sbg">
          <div className="sblbl">
            <span className="sbdot am" />
            Coefficients
          </div>
          <div className="g2s">
            {numInput('CsCd1', 'CsCd pignon', 0.01)}
            {numInput('CsCd2', 'CsCd long pan', 0.01)}
          </div>
          <div className="g2s">
            {numInput('Cp1', 'Cpi surp. (+)', 0.05)}
            {numInput('Cp2', 'Cpi dép. (−)', 0.05)}
          </div>
        </div>

        <div className="sbg">
          <div className="sblbl">
            <span className="sbdot rs" />
            Cas de vent
          </div>
          <div className="wbrow">
            <button
              className={'wb' + (W1on ? ' on' : '')}
              onClick={() => setW1(!W1on)}
            >
              W1 · Pignon 0°
            </button>
            <button
              className={'wb' + (W2on ? ' on' : '')}
              onClick={() => setW2(!W2on)}
            >
              W2 · Long Pan 90°
            </button>
          </div>
          <button className="btnrun" onClick={run}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2.5 1.5l8 4.5-8 4.5V1.5z" fill="#fff" />
            </svg>
            CALCULER
          </button>
        </div>
      </aside>

      {/* ────────── MAIN ────────── */}
      <main className="main-content" style={{ padding: '1.1rem' }}>
        {!result && (
          <div className="empty">
            <div className="emptyic">🌬️</div>
            <h3>Prêt pour le calcul</h3>
            <p>
              Renseignez les paramètres dans la barre latérale puis cliquez
              sur <strong>CALCULER</strong> pour lancer l'analyse EC1.
            </p>
          </div>
        )}

        {result && <Results result={result} W1on={W1on} W2on={W2on} />}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   RESULTS — separated component to keep WindCalcPage tidy
───────────────────────────────────────────────────────────────────── */
interface ResultsProps {
  result: CalcResult;
  W1on: boolean;
  W2on: boolean;
}

function Results({ result, W1on, W2on }: ResultsProps) {
  const { inputs, P, cm1, cm2, ct, fmW1, fmW2, ftW1, ftW2 } = result;
  const wallZones: Array<keyof typeof cm1> = ['A', 'B', 'C', 'D', 'E'];
  const roofZones: Array<keyof typeof ct> = ['F', 'G', 'H', 'I', 'J'];

  return (
    <>
      {/* ─── Parameters card ─── */}
      <div className="card">
        <div className="cardhd">
          <div className="ctitle">
            <span className="cbar" />
            Paramètres calculés
          </div>
          <span className="ctag tc">
            Terrain {inputs.cat} · Vb={P.Vb.toFixed(2)} m/s
          </span>
        </div>
        <div className="mets m6">
          <Metric label="f faîtage" val={P.F.toFixed(3)} unit="m" />
          <Metric label="ht total" val={P.ht.toFixed(3)} unit="m" hi />
          <Metric label="qb" val={P.qb.toFixed(4)} unit="daN/m²" />
          <Metric label="qp(z)" val={P.qp.toFixed(4)} unit="daN/m²" hi />
          <Metric label="e=min(b,2ht)" val={P.e.toFixed(3)} unit="m" />
          <Metric label="h/d W1" val={P.hd1.toFixed(4)} unit="" />
        </div>
      </div>

      <div className="g2">
        {/* ─── Coefficients ─── */}
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar em" />
              Coefficients EC1 §4.5
            </div>
          </div>
          <div className="mets m4" style={{ marginBottom: '.85rem' }}>
            <Metric label="kr" val={P.kr.toFixed(4)} unit="" />
            <Metric label="Cr(z)" val={P.Cr.toFixed(5)} unit="" />
            <Metric label="kl" val={P.kl.toFixed(5)} unit="" />
            <Metric label="Ce(z)" val={P.Ce.toFixed(5)} unit="" />
          </div>
          <div className="codebox">
            <span className="cm">// EN 1991-1-4 §4.5 — Profil logarithmique</span>
            {'\n'}
            kr = 0.19·(z0/0.05)^0.07 ={' '}
            <span className="cv">{P.kr.toFixed(4)}</span>
            {'\n'}
            Cr(z) = kr·ln(Ze/z0) ={' '}
            <span className="cv">{P.Cr.toFixed(5)}</span>
            {'\n'}
            kl = C0·[1−0.0002·(log₁₀z0+3)⁶] ={' '}
            <span className="cv">{P.kl.toFixed(5)}</span>
            {'\n'}
            Ce(z) = [1+7·kl·kr/(C0·Cr)]·(C0·Cr)² ={' '}
            <span className="cg">{P.Ce.toFixed(5)}</span>
            {'\n'}
            qb = ½·ρ·Vb²/10 ={' '}
            <span className="cv">{P.qb.toFixed(4)}</span> daN/m²
            {'\n'}
            qp(z) = qb·Ce(z) ={' '}
            <span className="cg">{P.qp.toFixed(4)}</span> daN/m²
            {'\n'}α = arctan({inputs.apct}/100) ={' '}
            <span className="ca">{P.adeg.toFixed(4)}°</span>
          </div>
        </div>

        {/* ─── Cpe tables ─── */}
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar am" />
              Coefficients de pression Cpe
            </div>
          </div>

          <div className="sech">Murs verticaux — Table 7.1</div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Config</th>
                  {wallZones.map((z) => (
                    <th key={z}>{z}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { lbl: `W1 h/d=${P.hd1.toFixed(3)}`, c: cm1 },
                  { lbl: `W2 h/d=${P.hd2.toFixed(3)}`, c: cm2 },
                ].map(({ lbl, c }) => (
                  <tr key={lbl}>
                    <td className="neu left">{lbl}</td>
                    {wallZones.map((z) => (
                      <td key={z} className={c[z] < 0 ? 'neg' : 'pos'}>
                        {c[z].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="sep" />

          <div className="sech">Toiture 2 versants — Table 7.4a</div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>α</th>
                  {roofZones.map((z) => (
                    <th key={z}>{z}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="neu">{P.adeg.toFixed(2)}°</td>
                  {roofZones.map((z) => (
                    <td key={z} className={ct[z] < 0 ? 'neg' : 'pos'}>
                      {ct[z].toFixed(3)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Schemas (SVG) ─── */}
      <WindSchemas
        b={inputs.b}
        d={inputs.d}
        h={inputs.h}
        adeg={P.adeg}
        ht={P.ht}
        e={P.e}
        fmW1={fmW1}
        fmW2={fmW2}
        ftW1={ftW1}
        ftW2={ftW2}
        Cp1={inputs.Cp1}
        Cp2={inputs.Cp2}
        W1on={W1on}
        W2on={W2on}
      />

      {/* ─── W1 forces ─── */}
      {W1on && (
        <ForcesCard
          title="W1 — Pignon 0° · Forces nettes (daN/m²)"
          tag="W1 · Y+"
          barClass=""
          wallForces={fmW1}
          roofForces={ftW1}
          Cp1={inputs.Cp1}
          Cp2={inputs.Cp2}
          qp={P.qp}
          CsCd={inputs.CsCd1}
        />
      )}

      {W2on && (
        <ForcesCard
          title="W2 — Long Pan 90° · Forces nettes (daN/m²)"
          tag="W2 · X+"
          barClass="vl"
          tagClass="tv"
          wallForces={fmW2}
          roofForces={ftW2}
          Cp1={inputs.Cp1}
          Cp2={inputs.Cp2}
          qp={P.qp}
          CsCd={inputs.CsCd2}
        />
      )}

      {/* ─── Bar chart ─── */}
      <div className="card">
        <div className="cardhd">
          <div className="ctitle">
            <span className="cbar em" />
            Diagramme des forces nettes (daN/m²)
          </div>
        </div>
        <div className="chw">
          <ForcesChart
            wallZones={wallZones}
            roofZones={roofZones}
            cm1={cm1}
            cm2={cm2}
            ct={ct}
            CsCd1={inputs.CsCd1}
            CsCd2={inputs.CsCd2}
            qp={P.qp}
            Cp1={inputs.Cp1}
            Cp2={inputs.Cp2}
            W1on={W1on}
            W2on={W2on}
          />
        </div>
      </div>
    </>
  );
}

/* ─── Small reusable building blocks ─── */
function Metric({
  label,
  val,
  unit,
  hi,
  cls,
}: {
  label: string;
  val: string | number;
  unit?: string;
  hi?: boolean;
  cls?: string;
}) {
  return (
    <div className={'met' + (hi ? ' hi' : '') + (cls ? ' ' + cls : '')}>
      <div className="mlbl">{label}</div>
      <div className="mval">
        {val}
        {unit ? <span className="munit">{unit}</span> : null}
      </div>
    </div>
  );
}

function ForcesCard({
  title,
  tag,
  tagClass = 'tc',
  barClass,
  wallForces,
  roofForces,
  Cp1,
  Cp2,
  qp,
  CsCd,
}: {
  title: string;
  tag: string;
  tagClass?: string;
  barClass: string;
  wallForces: Record<'A' | 'B' | 'C' | 'D' | 'E', ForcePair>;
  roofForces: Record<'F' | 'G' | 'H' | 'I' | 'J', ForcePair>;
  Cp1: number;
  Cp2: number;
  qp: number;
  CsCd: number;
}) {
  const wallZ: Array<keyof typeof wallForces> = ['A', 'B', 'C', 'D', 'E'];
  const roofZ: Array<keyof typeof roofForces> = ['F', 'G', 'H', 'I', 'J'];

  const all = [
    ...Object.values(wallForces),
    ...Object.values(roofForces),
  ].flatMap((x) => [x.f1, x.f2]);

  const fMax = Math.max(...all.map(Math.abs));
  const fMin = Math.min(...all);

  return (
    <div className="card">
      <div className="cardhd">
        <div className="ctitle">
          <span className={'cbar ' + barClass} />
          {title}
        </div>
        <span className={'ctag ' + tagClass}>{tag}</span>
      </div>

      <div className="g2">
        <div>
          <div className="sech">Murs verticaux</div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Cpi=+{Cp1}</th>
                  <th>Cpi={Cp2}</th>
                </tr>
              </thead>
              <tbody>
                {wallZ.map((z) => (
                  <tr key={z}>
                    <td>
                      <strong>{z}</strong>
                    </td>
                    <td className={wallForces[z].f1 < 0 ? 'neg' : 'pos'}>
                      {wallForces[z].f1}
                    </td>
                    <td className={wallForces[z].f2 < 0 ? 'neg' : 'pos'}>
                      {wallForces[z].f2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="sech">Toiture</div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Cpi=+{Cp1}</th>
                  <th>Cpi={Cp2}</th>
                </tr>
              </thead>
              <tbody>
                {roofZ.map((z) => (
                  <tr key={z}>
                    <td>
                      <strong>{z}</strong>
                    </td>
                    <td className={roofForces[z].f1 < 0 ? 'neg' : 'pos'}>
                      {roofForces[z].f1}
                    </td>
                    <td className={roofForces[z].f2 < 0 ? 'neg' : 'pos'}>
                      {roofForces[z].f2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="sep" />
      <div className="mets m4">
        <Metric label="F max" val={fMax.toFixed(2)} unit="daN/m²" hi />
        <Metric
          label="F min"
          val={fMin.toFixed(2)}
          unit="daN/m²"
          cls="rs-ac"
        />
        <Metric label="qp(z)" val={qp.toFixed(3)} unit="daN/m²" />
        <Metric label="CsCd" val={CsCd.toFixed(2)} unit="" />
      </div>
    </div>
  );
}

/* ─── Chart ─── */
function ForcesChart({
  wallZones,
  roofZones,
  cm1,
  cm2,
  ct,
  CsCd1,
  CsCd2,
  qp,
  Cp1,
  Cp2,
  W1on,
  W2on,
}: {
  wallZones: Array<keyof WallCpe>;
  roofZones: Array<keyof RoofCpe>;
  cm1: WallCpe;
  cm2: WallCpe;
  ct: RoofCpe;
  CsCd1: number;
  CsCd2: number;
  qp: number;
  Cp1: number;
  Cp2: number;
  W1on: boolean;
  W2on: boolean;
}) {
  const labels = [...wallZones, ...roofZones];
  const datasets: any[] = [];

  const build = (
    wall: WallCpe,
    roof: RoofCpe,
    CsCd: number,
    label: string,
    c1: string,
    c2: string,
  ) => {
    const d1: number[] = [];
    const d2: number[] = [];
    wallZones.forEach((z) => {
      d1.push(+(CsCd * qp * wall[z] - qp * Cp1).toFixed(3));
      d2.push(+(CsCd * qp * wall[z] - qp * Cp2).toFixed(3));
    });
    roofZones.forEach((z) => {
      d1.push(+(CsCd * qp * roof[z] - qp * Cp1).toFixed(3));
      d2.push(+(CsCd * qp * roof[z] - qp * Cp2).toFixed(3));
    });
    datasets.push({
      label: `${label} Cpi=+${Cp1}`,
      data: d1,
      backgroundColor: c1,
      borderRadius: 3,
    });
    datasets.push({
      label: `${label} Cpi=${Cp2}`,
      data: d2,
      backgroundColor: c2,
      borderRadius: 3,
    });
  };

  if (W1on)
    build(cm1, ct, CsCd1, 'W1', 'rgba(0,212,255,.75)', 'rgba(0,212,255,.3)');
  if (W2on)
    build(cm2, ct, CsCd2, 'W2', 'rgba(180,124,255,.75)', 'rgba(180,124,255,.3)');

  return (
    <Bar
      data={{ labels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { boxWidth: 10, font: { size: 10 } } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6B85A0', font: { size: 10 } },
          },
          y: {
            grid: { color: 'rgba(125,140,170,.18)' },
            ticks: { color: '#6B85A0', font: { size: 10 } },
            title: {
              display: true,
              text: 'Force nette (daN/m²)',
              color: '#6B85A0',
              font: { size: 10 },
            },
          },
        },
      }}
    />
  );
}
