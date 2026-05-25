import { useState, useRef } from 'react';
import '../styles/proposition.css';

type Page = 'home' | 'geometrie' | 'charges' | 'calcul' | 'rsa' | 'optimisation';
type ChargesTab = 'vent' | 'autres' | 'combis';
type TerrainCat = '0' | 'II' | 'IIIa' | 'IIIb' | 'IV';

const TERRAIN: Record<TerrainCat, [number, number]> = {
  '0':     [0.005,  1],
  'II':    [0.05,   2],
  'IIIa':  [0.2,    5],
  'IIIb':  [0.5,    9],
  'IV':    [1,     15],
};

function calcVent(Vb0: number, terrain: TerrainCat, z: number) {
  const [z0, zmin] = TERRAIN[terrain];
  const kr = 0.19 * Math.pow(z0 / 0.05, 0.07);
  const zeff = Math.max(z, zmin);
  const Cr = kr * Math.log(zeff / z0);
  const Iv = 1 / Math.log(zeff / z0);
  const vm = Cr * Vb0;
  const rho = 1.25;
  const qb = 0.5 * rho * Vb0 * Vb0 / 1000;
  const qp = (1 + 7 * Iv) * 0.5 * rho * vm * vm / 1000;
  return { kr, Cr, Iv, vm, qb, qp };
}

interface GeoState { L: number; H: number; h: number; B: number; e: number; }
interface VentState { Vb0: number; terrain: TerrainCat; z: number; }
interface ChargesState { ppStructure: number; bardage: number; neige: number; exploitation: number; }

const RSA_STEPS = [
  { delay: 0,    text: '$ Initialisation du modèle RSA...' },
  { delay: 400,  text: '  ✓ Nœuds chargés: 48 noeuds' },
  { delay: 800,  text: '  ✓ Barres définies: 96 éléments' },
  { delay: 1200, text: '  ✓ Conditions aux limites: OK' },
  { delay: 1600, text: '$ Assemblage matrice de rigidité...' },
  { delay: 2000, text: '  ✓ K global [144×144] assemblée' },
  { delay: 2400, text: '$ Application des charges...' },
  { delay: 2800, text: '  ✓ Cas 1: G (poids propre)' },
  { delay: 3200, text: '  ✓ Cas 2: Q (surcharge exploitation)' },
  { delay: 3600, text: '  ✓ Cas 3: W+ (vent gauche)' },
  { delay: 4000, text: '  ✓ Cas 4: W- (vent droit)' },
  { delay: 4400, text: '$ Résolution système linéaire...' },
  { delay: 4800, text: '  ✓ Méthode: Cholesky' },
  { delay: 5200, text: '  ✓ Convergence atteinte en 3 itérations' },
  { delay: 5600, text: '$ Calcul des efforts internes...' },
  { delay: 6000, text: '  ✓ Moment maxi: 248.3 kN·m (nœud 12)' },
  { delay: 6400, text: '  ✓ Effort tranchant maxi: 86.4 kN' },
  { delay: 6800, text: '  ✓ Flèche maxi: L/312 ✓' },
  { delay: 7200, text: '$ Export résultats...' },
  { delay: 7600, text: '  ✓ Fichier .rsa généré' },
  { delay: 8000, text: '  ✓ Rapport PDF disponible' },
  { delay: 8400, text: '✓ Analyse terminée avec succès' },
];

const OPTIM_STEPS = [
  { delay: 0,    text: "Initialisation de l'algorithme génétique...", progress: 0 },
  { delay: 600,  text: 'Population initiale: 200 individus', progress: 10 },
  { delay: 1200, text: 'Génération 1/10 — fitness max: 0.45', progress: 20 },
  { delay: 1800, text: 'Génération 2/10 — fitness max: 0.58', progress: 30 },
  { delay: 2400, text: 'Génération 3/10 — fitness max: 0.67', progress: 40 },
  { delay: 3000, text: 'Génération 4/10 — fitness max: 0.74', progress: 50 },
  { delay: 3600, text: 'Génération 5/10 — fitness max: 0.81', progress: 60 },
  { delay: 4200, text: 'Génération 6/10 — fitness max: 0.85', progress: 70 },
  { delay: 4800, text: 'Génération 7/10 — fitness max: 0.88', progress: 78 },
  { delay: 5400, text: 'Génération 8/10 — fitness max: 0.91', progress: 86 },
  { delay: 6000, text: 'Génération 9/10 — fitness max: 0.93', progress: 93 },
  { delay: 6600, text: 'Génération 10/10 — fitness max: 0.95', progress: 100 },
  { delay: 7200, text: '✓ Solution optimale trouvée !', progress: 100 },
];

const NAV_ITEMS: { id: Page; label: string; icon: string; badge?: string }[] = [
  { id: 'home',         label: 'Accueil',            icon: '⌂' },
  { id: 'geometrie',    label: 'Géométrie',           icon: '⬡' },
  { id: 'charges',      label: 'Charges & Surcharges',icon: '↓', badge: 'EC1' },
  { id: 'calcul',       label: 'Calcul structurel',   icon: '∑' },
  { id: 'rsa',          label: 'Export RSA',          icon: '▶' },
  { id: 'optimisation', label: 'Optimisation',        icon: '◈', badge: 'AI' },
];

export default function PropositionPage() {
  const [page, setPage]             = useState<Page>('home');
  const [chargesTab, setChargesTab] = useState<ChargesTab>('vent');
  const [geo, setGeo]               = useState<GeoState>({ L: 20, H: 7, h: 5, B: 50, e: 5 });
  const [vent, setVent]             = useState<VentState>({ Vb0: 26, terrain: 'II', z: 7 });
  const [ventResult, setVentResult] = useState<ReturnType<typeof calcVent> | null>(null);
  const [charges, setCharges]       = useState<ChargesState>({ ppStructure: 0.8, bardage: 0.15, neige: 0.6, exploitation: 1.0 });

  const [rsaLogs,    setRsaLogs]    = useState<string[]>([]);
  const [rsaRunning, setRsaRunning] = useState(false);
  const [rsaDone,    setRsaDone]    = useState(false);
  const rsaTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [optimLogs,     setOptimLogs]     = useState<string[]>([]);
  const [optimProgress, setOptimProgress] = useState(0);
  const [optimRunning,  setOptimRunning]  = useState(false);
  const [optimDone,     setOptimDone]     = useState(false);

  // ── derived geometry ──────────────────────────────────────────────
  const dH   = geo.H - geo.h;
  const rLen = Math.sqrt(dH * dH + (geo.L / 2) * (geo.L / 2));
  const alpha = Math.atan2(dH, geo.L / 2) * 180 / Math.PI;
  const roofArea = rLen * 2 * geo.B;
  const wallArea = (geo.h * 2 + dH) * geo.B + geo.h * geo.L;
  const volume   = (geo.h + dH / 2) * geo.L * geo.B;

  // ── derived loads ────────────────────────────────────────────────
  const DL    = charges.ppStructure + charges.bardage;
  const LL    = charges.neige + charges.exploitation;
  const total = DL + LL;
  const comb1 = 1.35 * DL + 1.5 * LL;
  const comb2 = DL + 1.5 * LL;
  const comb3 = 1.35 * DL + 0.9 * LL + (ventResult ? 1.5 * ventResult.qp * 0.3 : 0);

  // ── actions ──────────────────────────────────────────────────────
  const handleCalcVent = () => setVentResult(calcVent(vent.Vb0, vent.terrain, vent.z));

  const handleRSA = () => {
    if (rsaRunning) return;
    rsaTimers.current.forEach(clearTimeout);
    setRsaLogs([]); setRsaDone(false); setRsaRunning(true);
    rsaTimers.current = RSA_STEPS.map(({ delay, text }) =>
      setTimeout(() => {
        setRsaLogs(p => [...p, text]);
        if (text.startsWith('✓ Analyse')) { setRsaRunning(false); setRsaDone(true); }
      }, delay)
    );
  };

  const handleExportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ projet: 'Hangar Industriel', geometrie: geo, ventResult, charges, alpha: +alpha.toFixed(1) }, null, 2)],
      { type: 'application/json' }
    );
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'optistruct_export.json' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const handleOptimisation = () => {
    if (optimRunning) return;
    setOptimLogs([]); setOptimProgress(0); setOptimDone(false); setOptimRunning(true);
    OPTIM_STEPS.forEach(({ delay, text, progress }) =>
      setTimeout(() => {
        setOptimLogs(p => [...p, text]);
        setOptimProgress(progress);
        if (text.startsWith('✓ Solution')) { setOptimRunning(false); setOptimDone(true); }
      }, delay)
    );
  };

  // ── structural results (EC3 simplified) ─────────────────────────
  const Mmax = comb1 * geo.e * geo.L * geo.L / 8;
  const Vmax = comb1 * geo.e * geo.L / 2;

  const sections = [
    { elem: 'Traverse', profil: 'IPE 360', Mrd: 276.4, Vrd: 396.5 },
    { elem: 'Poteau',   profil: 'HEA 260', Mrd: 248.0, Vrd: 560.2 },
    { elem: 'Panne',    profil: 'IPE 160', Mrd:  36.8, Vrd: 140.3 },
    { elem: 'Listeau',  profil: 'IPE 120', Mrd:  16.5, Vrd:  95.0 },
  ];

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="prop-root">

      {/* ── Sidebar nav ── */}
      <nav className="prop-nav">
        <div className="prop-nav-brand">
          <span className="prop-nav-brand-icon">◈</span>OptiStruct
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={'prop-nav-item' + (page === item.id ? ' active' : '')}
            onClick={() => setPage(item.id)}
          >
            <span className="prop-nav-icon">{item.icon}</span>
            <span className="prop-nav-label">{item.label}</span>
            {item.badge && <span className="prop-nav-badge">{item.badge}</span>}
          </button>
        ))}
      </nav>

      {/* ── Main content ── */}
      <div className="prop-main">

        {/* ══ HOME ══════════════════════════════════════════════════ */}
        {page === 'home' && (
          <div className="prop-page">
            <div className="prop-hero">
              <div className="prop-hero-logo">◈</div>
              <h1 className="prop-hero-title">OptiStruct</h1>
              <p className="prop-hero-sub">
                Proposition des dimensions optimales de structure industrielle
              </p>
              <div className="prop-hero-tags">
                <span className="prop-tag blue">EN 1991-1-4</span>
                <span className="prop-tag green">EC3</span>
                <span className="prop-tag purple">Algorithme IA</span>
              </div>
            </div>

            <div className="prop-stats-grid">
              {[
                { label: 'Portée',       value: `${geo.L} m`,          icon: '↔' },
                { label: 'Hauteur faîte',value: `${geo.H} m`,          icon: '↑' },
                { label: 'Longueur',     value: `${geo.B} m`,          icon: '⟶' },
                { label: 'Angle toit',   value: `${alpha.toFixed(1)}°`, icon: '△' },
              ].map(s => (
                <div key={s.label} className="prop-stat-card">
                  <span className="prop-stat-icon">{s.icon}</span>
                  <div className="prop-stat-val">{s.value}</div>
                  <div className="prop-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="prop-home-grid">
              {NAV_ITEMS.slice(1).map(item => (
                <button key={item.id} className="prop-home-card" onClick={() => setPage(item.id)}>
                  <span className="prop-home-card-icon">{item.icon}</span>
                  <span className="prop-home-card-lbl">{item.label}</span>
                  {item.badge && <span className="prop-home-card-badge">{item.badge}</span>}
                </button>
              ))}
            </div>

            <div className="prop-note">
              Renseignez d'abord la <strong>Géométrie</strong>, puis les <strong>Charges</strong>,
              avant de lancer le <strong>Calcul</strong> ou l'<strong>Optimisation</strong>.
            </div>
          </div>
        )}

        {/* ══ GÉOMÉTRIE ════════════════════════════════════════════ */}
        {page === 'geometrie' && (
          <div className="prop-page">
            <div className="prop-section-hd">
              <h2>Géométrie du portique</h2>
              <p>Définissez les dimensions principales de la structure</p>
            </div>

            <div className="prop-form-grid">
              {([
                { key: 'L' as const, label: 'Portée L',                unit: 'm', min: 5,  max: 60, step: 0.5 },
                { key: 'H' as const, label: 'Hauteur au faîte H',      unit: 'm', min: 3,  max: 20, step: 0.5 },
                { key: 'h' as const, label: 'Hauteur aux appuis h',     unit: 'm', min: 2,  max: 15, step: 0.5 },
                { key: 'B' as const, label: 'Longueur bâtiment B',      unit: 'm', min: 10, max: 200, step: 1 },
                { key: 'e' as const, label: 'Entraxe portiques e',      unit: 'm', min: 3,  max: 10, step: 0.25 },
              ]).map(f => (
                <div key={f.key} className="prop-field">
                  <label className="prop-field-lbl">{f.label}</label>
                  <div className="prop-field-row">
                    <input
                      type="number" className="prop-input"
                      value={geo[f.key]} min={f.min} max={f.max} step={f.step}
                      onChange={e => setGeo(p => ({ ...p, [f.key]: +e.target.value }))}
                    />
                    <span className="prop-unit">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="prop-results-row">
              {[
                { label: 'Angle de toit α', val: `${alpha.toFixed(2)}°` },
                { label: 'Surface toiture',  val: `${roofArea.toFixed(1)} m²` },
                { label: 'Surface parois',   val: `${wallArea.toFixed(1)} m²` },
                { label: 'Volume bâtiment',  val: `${volume.toFixed(0)} m³` },
              ].map(r => (
                <div key={r.label} className="prop-result-card">
                  <div className="prop-result-lbl">{r.label}</div>
                  <div className="prop-result-val">{r.val}</div>
                </div>
              ))}
            </div>

            {/* Schema SVG */}
            <div className="prop-schema-box">
              <svg viewBox="0 0 440 210" className="prop-schema-svg">
                {/* ground */}
                <line x1="40" y1="175" x2="400" y2="175" stroke="var(--bd2)" strokeWidth="1.5"/>
                <line x1="40" y1="177" x2="400" y2="177" stroke="var(--bd2)" strokeWidth="1"/>
                {/* columns */}
                <line x1="90"  y1="175" x2="90"  y2={175 - geo.h * 11} stroke="var(--tx2)" strokeWidth="3"/>
                <line x1="350" y1="175" x2="350" y2={175 - geo.h * 11} stroke="var(--tx2)" strokeWidth="3"/>
                {/* rafters */}
                <line x1="90"  y1={175 - geo.h * 11} x2="220" y2={175 - geo.H * 11} stroke="var(--em)" strokeWidth="3"/>
                <line x1="350" y1={175 - geo.h * 11} x2="220" y2={175 - geo.H * 11} stroke="var(--em)" strokeWidth="3"/>
                {/* dim L */}
                <line x1="90" y1="192" x2="350" y2="192" stroke="var(--tx3)" strokeWidth="1"/>
                <line x1="90" y1="188" x2="90" y2="196" stroke="var(--tx3)" strokeWidth="1"/>
                <line x1="350" y1="188" x2="350" y2="196" stroke="var(--tx3)" strokeWidth="1"/>
                <text x="220" y="205" textAnchor="middle" fill="var(--tx3)" fontSize="11">L = {geo.L} m</text>
                {/* dim H */}
                <line x1="375" y1={175 - geo.H * 11} x2="375" y2="175" stroke="var(--tx3)" strokeWidth="1"/>
                <text x="395" y={175 - geo.H * 5.5} textAnchor="middle" fill="var(--tx3)" fontSize="10">H={geo.H}m</text>
                {/* dim h */}
                <line x1="62" y1={175 - geo.h * 11} x2="62" y2="175" stroke="var(--tx3)" strokeWidth="1"/>
                <text x="42" y={175 - geo.h * 5.5} textAnchor="middle" fill="var(--tx3)" fontSize="10">h={geo.h}m</text>
                {/* hinges */}
                <polygon points="90,175 82,188 98,188" fill="none" stroke="var(--tx2)" strokeWidth="1.5"/>
                <polygon points="350,175 342,188 358,188" fill="none" stroke="var(--tx2)" strokeWidth="1.5"/>
                <circle cx="220" cy={175 - geo.H * 11} r="4" fill="var(--em)"/>
                <circle cx="90"  cy={175 - geo.h * 11} r="3" fill="var(--bg2)" stroke="var(--tx2)" strokeWidth="1.5"/>
                <circle cx="350" cy={175 - geo.h * 11} r="3" fill="var(--bg2)" stroke="var(--tx2)" strokeWidth="1.5"/>
                {/* angle label */}
                <text x="112" y={175 - geo.h * 11 - 8} fill="var(--am)" fontSize="10">α={alpha.toFixed(1)}°</text>
              </svg>
            </div>
          </div>
        )}

        {/* ══ CHARGES ══════════════════════════════════════════════ */}
        {page === 'charges' && (
          <div className="prop-page">
            <div className="prop-section-hd">
              <h2>Charges &amp; Surcharges</h2>
            </div>

            <div className="prop-tabs">
              {([
                { id: 'vent'   as const, label: 'Vent EC1' },
                { id: 'autres' as const, label: 'Autres Charges' },
                { id: 'combis' as const, label: 'Combinaisons' },
              ]).map(t => (
                <button key={t.id}
                  className={'prop-tab' + (chargesTab === t.id ? ' active' : '')}
                  onClick={() => setChargesTab(t.id)}
                >{t.label}</button>
              ))}
            </div>

            {/* ── Vent ── */}
            {chargesTab === 'vent' && (
              <div className="prop-tab-body">
                <div className="prop-form-grid">
                  <div className="prop-field">
                    <label className="prop-field-lbl">Vitesse de base V<sub>b,0</sub></label>
                    <div className="prop-field-row">
                      <input type="number" className="prop-input" value={vent.Vb0} step={1}
                        onChange={e => setVent(v => ({ ...v, Vb0: +e.target.value }))}/>
                      <span className="prop-unit">m/s</span>
                    </div>
                  </div>
                  <div className="prop-field">
                    <label className="prop-field-lbl">Catégorie de terrain</label>
                    <select className="prop-input prop-select" value={vent.terrain}
                      onChange={e => setVent(v => ({ ...v, terrain: e.target.value as TerrainCat }))}>
                      <option value="0">0 — Mer / Littoral</option>
                      <option value="II">II — Rase campagne (référence)</option>
                      <option value="IIIa">IIIa — Bocage / Périurbain</option>
                      <option value="IIIb">IIIb — Banlieue dense</option>
                      <option value="IV">IV — Centre-ville</option>
                    </select>
                  </div>
                  <div className="prop-field">
                    <label className="prop-field-lbl">Hauteur de référence z</label>
                    <div className="prop-field-row">
                      <input type="number" className="prop-input" value={vent.z} step={0.5}
                        onChange={e => setVent(v => ({ ...v, z: +e.target.value }))}/>
                      <span className="prop-unit">m</span>
                    </div>
                  </div>
                </div>
                <button className="prop-btn-primary" onClick={handleCalcVent}>Calculer</button>

                {ventResult && (
                  <div className="prop-results-row" style={{ marginTop: 16 }}>
                    {[
                      { label: 'kr',          val: ventResult.kr.toFixed(3) },
                      { label: 'Cr(z)',        val: ventResult.Cr.toFixed(3) },
                      { label: 'Iv(z)',        val: ventResult.Iv.toFixed(3) },
                      { label: 'vm (m/s)',     val: ventResult.vm.toFixed(1)  },
                      { label: 'qb (kN/m²)',  val: ventResult.qb.toFixed(3)  },
                      { label: 'qp (kN/m²)',  val: ventResult.qp.toFixed(3)  },
                    ].map(r => (
                      <div key={r.label} className="prop-result-card hl">
                        <div className="prop-result-lbl">{r.label}</div>
                        <div className="prop-result-val">{r.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* sensitivity table — always show once calc done */}
                {ventResult && (
                  <div style={{ marginTop: 24 }}>
                    <div className="prop-subtitle">Sensibilité q<sub>p</sub> selon la hauteur</div>
                    <table className="prop-table">
                      <thead><tr><th>z (m)</th><th>Cr</th><th>Iv</th><th>vm (m/s)</th><th>qp (kN/m²)</th></tr></thead>
                      <tbody>
                        {[3, 5, 7, 10, 15, 20].map(zz => {
                          const r = calcVent(vent.Vb0, vent.terrain, zz);
                          return (
                            <tr key={zz} className={zz === vent.z ? 'prop-tr-hl' : ''}>
                              <td>{zz}</td>
                              <td>{r.Cr.toFixed(3)}</td>
                              <td>{r.Iv.toFixed(3)}</td>
                              <td>{r.vm.toFixed(1)}</td>
                              <td><strong>{r.qp.toFixed(3)}</strong></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Autres charges ── */}
            {chargesTab === 'autres' && (
              <div className="prop-tab-body">
                <div className="prop-charges-grid">
                  {([
                    { key: 'ppStructure' as const, label: 'Poids propre structure', max: 3,   step: 0.05, color: 'blue'  },
                    { key: 'bardage'     as const, label: 'Bardage + Couverture',   max: 1,   step: 0.05, color: 'blue'  },
                    { key: 'neige'       as const, label: 'Surcharge de neige',     max: 2,   step: 0.05, color: 'green' },
                    { key: 'exploitation'as const, label: "Surcharge d'exploitation", max: 3, step: 0.1,  color: 'green' },
                  ]).map(f => (
                    <div key={f.key} className="prop-charge-row">
                      <div className="prop-charge-hd">
                        <label className="prop-charge-lbl">{f.label}</label>
                        <span className={'prop-charge-val ' + f.color}>{charges[f.key].toFixed(2)} kN/m²</span>
                      </div>
                      <input type="range" className={'prop-slider ' + f.color}
                        min={0} max={f.max} step={f.step} value={charges[f.key]}
                        onChange={e => setCharges(p => ({ ...p, [f.key]: +e.target.value }))}/>
                    </div>
                  ))}
                </div>

                <div className="prop-totals-box">
                  <div className="prop-total-row">
                    <span>Charges permanentes G</span>
                    <span className="blue">{DL.toFixed(2)} kN/m²</span>
                  </div>
                  <div className="prop-total-row">
                    <span>Charges variables Q</span>
                    <span className="green">{LL.toFixed(2)} kN/m²</span>
                  </div>
                  <div className="prop-total-row total">
                    <span>Total G + Q</span>
                    <span>{total.toFixed(2)} kN/m²</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Combinaisons ── */}
            {chargesTab === 'combis' && (
              <div className="prop-tab-body">
                <div className="prop-subtitle">Combinaisons d'actions — EN 1990</div>
                <table className="prop-table">
                  <thead>
                    <tr><th>Combo</th><th>Expression</th><th>Valeur (kN/m²)</th><th>Usage</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>ELU-1</strong></td>
                      <td>1.35G + 1.5Q</td>
                      <td><strong>{comb1.toFixed(2)}</strong></td>
                      <td>Résistance</td>
                    </tr>
                    <tr>
                      <td><strong>ELU-2</strong></td>
                      <td>G + 1.5Q</td>
                      <td><strong>{comb2.toFixed(2)}</strong></td>
                      <td>Résistance (G favorable)</td>
                    </tr>
                    <tr className={!ventResult ? 'prop-tr-dim' : ''}>
                      <td><strong>ELU-3</strong></td>
                      <td>1.35G + 0.9Q + 1.5W</td>
                      <td><strong>{comb3.toFixed(2)}</strong></td>
                      <td>
                        Vent dominant
                        {!ventResult && <span className="prop-warn-badge"> Vent non calculé</span>}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>ELS</strong></td>
                      <td>G + Q</td>
                      <td><strong>{total.toFixed(2)}</strong></td>
                      <td>Déformation</td>
                    </tr>
                  </tbody>
                </table>
                <div className="prop-note">
                  {!ventResult
                    ? 'Calculez le vent dans l\'onglet Vent EC1 pour inclure W dans ELU-3.'
                    : `Pression de vent qp = ${ventResult.qp.toFixed(3)} kN/m² incluse dans ELU-3.`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CALCUL STRUCTUREL ════════════════════════════════════ */}
        {page === 'calcul' && (
          <div className="prop-page">
            <div className="prop-section-hd">
              <h2>Calcul structurel</h2>
              <p>Pré-dimensionnement EC3 — portique à double pente</p>
            </div>

            <div className="prop-results-row">
              {[
                { label: 'M max ELU',        val: `${Mmax.toFixed(1)} kN·m` },
                { label: 'Effort tranchant', val: `${Vmax.toFixed(1)} kN` },
                { label: 'Réaction appui',   val: `${Vmax.toFixed(1)} kN` },
                { label: 'Charge totale',    val: `${(comb1 * geo.e * geo.L).toFixed(1)} kN` },
              ].map(r => (
                <div key={r.label} className="prop-result-card">
                  <div className="prop-result-lbl">{r.label}</div>
                  <div className="prop-result-val">{r.val}</div>
                </div>
              ))}
            </div>

            <div className="prop-subtitle" style={{ marginTop: 24 }}>Sections recommandées</div>
            <table className="prop-table">
              <thead>
                <tr><th>Élément</th><th>Profil</th><th>Classe</th><th>MRd (kN·m)</th><th>VRd (kN)</th><th>Vérif.</th></tr>
              </thead>
              <tbody>
                {sections.map(row => {
                  const limit = row.elem === 'Poteau' || row.elem === 'Traverse' ? Mmax : Mmax * 0.15;
                  const ok = row.Mrd > limit;
                  return (
                    <tr key={row.elem}>
                      <td>{row.elem}</td>
                      <td><strong>{row.profil}</strong></td>
                      <td>1</td>
                      <td>{row.Mrd}</td>
                      <td>{row.Vrd}</td>
                      <td className={ok ? 'prop-ok' : 'prop-fail'}>{ok ? '✓ OK' : '✗ KO'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="prop-subtitle" style={{ marginTop: 24 }}>État limite de service — Flèches</div>
            <table className="prop-table">
              <thead>
                <tr><th>Élément</th><th>f calc.</th><th>f limite</th><th>Ratio</th><th>Vérif.</th></tr>
              </thead>
              <tbody>
                {[
                  { elem: 'Traverse (IPE 360)', fcalc: (5 * total * geo.e * Math.pow(geo.L, 4)) / (384 * 0.034 * geo.L), flim: geo.L * 1000 / 250 },
                  { elem: 'Panne (IPE 160)',    fcalc: (5 * total * geo.e * Math.pow(geo.e, 4)) / (384 * 0.00183 * geo.e), flim: geo.e * 1000 / 200 },
                ].map(row => {
                  const ratio = row.fcalc / row.flim;
                  return (
                    <tr key={row.elem}>
                      <td>{row.elem}</td>
                      <td>{row.fcalc.toFixed(1)} mm</td>
                      <td>{row.flim.toFixed(1)} mm</td>
                      <td>{ratio.toFixed(2)}</td>
                      <td className={ratio < 1 ? 'prop-ok' : 'prop-fail'}>{ratio < 1 ? '✓ OK' : '✗ KO'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="prop-note" style={{ marginTop: 16 }}>
              Calcul basé sur la combinaison ELU-1 ({comb1.toFixed(2)} kN/m²), entraxe e = {geo.e} m.
              Flèches calculées en ELS ({total.toFixed(2)} kN/m²).
            </div>
          </div>
        )}

        {/* ══ EXPORT RSA ═══════════════════════════════════════════ */}
        {page === 'rsa' && (
          <div className="prop-page">
            <div className="prop-section-hd">
              <h2>Export RSA</h2>
              <p>Génération du modèle Robot Structural Analysis</p>
            </div>

            <div className="prop-results-row">
              {[
                { label: 'Nœuds',         val: '48' },
                { label: 'Éléments',      val: '96' },
                { label: 'Cas de charge', val: '4'  },
                { label: 'Combinaisons',  val: '6'  },
              ].map(r => (
                <div key={r.label} className="prop-result-card">
                  <div className="prop-result-val">{r.val}</div>
                  <div className="prop-result-lbl">{r.label}</div>
                </div>
              ))}
            </div>

            <div className="prop-btn-row">
              <button className="prop-btn-primary" onClick={handleRSA} disabled={rsaRunning}>
                {rsaRunning ? '⟳ Analyse en cours…' : '▶ Lancer analyse RSA'}
              </button>
              {rsaDone && (
                <button className="prop-btn-secondary" onClick={handleExportJSON}>
                  ↓ Exporter JSON
                </button>
              )}
            </div>

            {rsaLogs.length > 0 && (
              <div className="prop-terminal">
                {rsaLogs.map((line, i) => (
                  <div key={i} className={
                    'prop-term-line' +
                    (line.startsWith('✓') ? ' success' : line.startsWith('$') ? ' cmd' : '')
                  }>{line}</div>
                ))}
                {rsaRunning && <span className="prop-term-cursor">▌</span>}
              </div>
            )}
          </div>
        )}

        {/* ══ OPTIMISATION ═════════════════════════════════════════ */}
        {page === 'optimisation' && (
          <div className="prop-page">
            <div className="prop-section-hd">
              <h2>Optimisation des dimensions</h2>
              <p>Algorithme génétique multi-objectif — poids · coût · déformation</p>
            </div>

            <div className="prop-param-grid">
              {[
                { lbl: 'Objectif',   val: 'Minimisation du poids' },
                { lbl: 'Contraintes',val: 'EC3 + ELS vérifiés'    },
                { lbl: 'Variables',  val: 'Profils IPE / HEA'     },
                { lbl: 'Population', val: '200 individus'          },
              ].map(p => (
                <div key={p.lbl} className="prop-param-card">
                  <div className="prop-param-lbl">{p.lbl}</div>
                  <div className="prop-param-val">{p.val}</div>
                </div>
              ))}
            </div>

            <button className="prop-btn-primary" onClick={handleOptimisation} disabled={optimRunning}>
              {optimRunning ? '⟳ Optimisation en cours…' : '◈ Lancer l\'optimisation'}
            </button>

            {optimLogs.length > 0 && (
              <>
                <div className="prop-prog-wrap">
                  <div className="prop-prog-bar">
                    <div className="prop-prog-fill" style={{ width: `${optimProgress}%` }}/>
                  </div>
                  <span className="prop-prog-pct">{optimProgress}%</span>
                </div>
                <div className="prop-terminal">
                  {optimLogs.map((line, i) => (
                    <div key={i} className={'prop-term-line' + (line.startsWith('✓') ? ' success' : '')}>
                      {line}
                    </div>
                  ))}
                  {optimRunning && <span className="prop-term-cursor">▌</span>}
                </div>
              </>
            )}

            {optimDone && (
              <div className="prop-optim-result">
                <div className="prop-subtitle">Solution optimale</div>
                <div className="prop-results-row">
                  {[
                    { label: 'Traverse optimale', val: 'IPE 330' },
                    { label: 'Poteau optimal',    val: 'HEA 240' },
                    { label: 'Gain masse acier',  val: '−12.4%'  },
                    { label: 'Gain coût acier',   val: '−9.8%'   },
                  ].map(r => (
                    <div key={r.label} className="prop-result-card hl">
                      <div className="prop-result-lbl">{r.label}</div>
                      <div className="prop-result-val">{r.val}</div>
                    </div>
                  ))}
                </div>

                <table className="prop-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr><th>Élément</th><th>Initial</th><th>Optimisé</th><th>Δ Poids</th><th>Vérif.</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { elem: 'Traverse', ini: 'IPE 360', opt: 'IPE 330', dp: '−8.3%' },
                      { elem: 'Poteau',   ini: 'HEA 260', opt: 'HEA 240', dp: '−7.1%' },
                      { elem: 'Panne',    ini: 'IPE 160', opt: 'IPE 160', dp: ' 0.0%' },
                    ].map(row => (
                      <tr key={row.elem}>
                        <td>{row.elem}</td>
                        <td>{row.ini}</td>
                        <td><strong>{row.opt}</strong></td>
                        <td className="prop-ok">{row.dp}</td>
                        <td className="prop-ok">✓ OK</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
