import { useState } from 'react';

type Status = '—' | 'OK' | 'NOK';

interface Check {
  label: string;
  value: string;
  limit: string;
  status: Status;
}

const INITIAL_CHECKS: Check[] = [
  { label: 'Résistance flexion',    value: '—', limit: '1.00', status: '—' },
  { label: 'Résistance cisaillement', value: '—', limit: '1.00', status: '—' },
  { label: 'Flambement',            value: '—', limit: '1.00', status: '—' },
  { label: 'Déversement',           value: '—', limit: '1.00', status: '—' },
  { label: 'Déflexion (L/200)',     value: '—', limit: '100 mm', status: '—' },
];

const RESULTS: Check[] = [
  { label: 'Résistance flexion',    value: '0.82', limit: '1.00', status: 'OK' },
  { label: 'Résistance cisaillement', value: '0.41', limit: '1.00', status: 'OK' },
  { label: 'Flambement',            value: '0.91', limit: '1.00', status: 'OK' },
  { label: 'Déversement',           value: '0.76', limit: '1.00', status: 'OK' },
  { label: 'Déflexion (L/200)',     value: '87 mm', limit: '100 mm', status: 'OK' },
];

function statusTag(s: Status) {
  if (s === 'OK')  return <span className="mod-tag mod-tag-green">OK</span>;
  if (s === 'NOK') return <span className="mod-tag mod-tag-red">NOK</span>;
  return <span className="mod-tag mod-tag-amber">—</span>;
}

export default function CalculPage() {
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setChecks(RESULTS);
      setRunning(false);
    }, 1800);
  };

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Calcul</span></div>
      <div className="mod-title">Module Calcul Structurel</div>
      <div className="mod-sub">// Eurocode 3 — Vérification des sections en acier</div>

      <div className="mod-alert mod-alert-warn">
        Renseignez les modules <strong>Géométrie</strong> et <strong>Charges</strong> avant de lancer le calcul.
      </div>

      <div className="mod-grid-2">
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Sections des profilés</div>

          <div className="mod-field">
            <label className="mod-field-label">Poteau — Profil IPE/HEA</label>
            <select className="mod-field-select">
              <option>HEA 200</option>
              <option>HEA 220</option>
              <option selected>HEA 240</option>
              <option>HEA 260</option>
              <option>HEA 280</option>
              <option>HEB 200</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Traverse — Profil IPE/HEA</label>
            <select className="mod-field-select">
              <option>IPE 270</option>
              <option selected>IPE 300</option>
              <option>IPE 330</option>
              <option>IPE 360</option>
              <option>HEA 200</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Nuance d'acier</label>
            <select className="mod-field-select">
              <option>S235</option>
              <option selected>S275</option>
              <option>S355</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Longueur de flambement (poteau)</label>
            <input type="number" className="mod-field-input" defaultValue={6.0} step={0.5} />
            <div className="mod-field-unit">mètres</div>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Longueur de déversement (traverse)</label>
            <input type="number" className="mod-field-input" defaultValue={5.0} step={0.5} />
            <div className="mod-field-unit">mètres</div>
          </div>

          <div className="mod-btn-group">
            <button className="mod-btn mod-btn-primary" onClick={run} disabled={running}>
              {running ? '⟳ Calcul en cours…' : 'Lancer le Calcul'}
            </button>
          </div>
        </div>

        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Vérifications EC3</div>
          <table className="mod-table">
            <thead>
              <tr>
                <th>Vérification</th>
                <th>Valeur</th>
                <th>Limite</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td className="mod-val-accent">{c.value}</td>
                  <td>{c.limit}</td>
                  <td>{statusTag(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {checks[0].status !== '—' && (
        <div className="mod-result">
          <div className="mod-result-header">∑ Résultats de la vérification EC3</div>
          <div className="mod-grid-4">
            <div className="mod-metric">
              <div className="mod-metric-label">Flexion max</div>
              <div className="mod-metric-value" style={{ color: 'var(--em)' }}>0.82</div>
              <div className="mod-metric-unit">≤ 1.00 ✓</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Flambement</div>
              <div className="mod-metric-value" style={{ color: 'var(--am)' }}>0.91</div>
              <div className="mod-metric-unit">≤ 1.00 ✓</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Déflexion</div>
              <div className="mod-metric-value" style={{ color: 'var(--em)' }}>87 mm</div>
              <div className="mod-metric-unit">≤ 100 mm ✓</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Statut global</div>
              <div className="mod-metric-value" style={{ color: 'var(--em)', fontSize: 14 }}>VÉRIFIÉ</div>
              <div className="mod-metric-unit">Toutes OK</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
