import { useState, useRef } from 'react';

interface Result {
  masseInitiale: number;
  masseOptimisee: number;
  gain: number;
  iterations: number;
  elements: { name: string; initial: string; optimised: string; ratio: number; gain: string }[];
}

const STEPS = [
  'Initialisation de la population',
  'Évaluation des contraintes EC3',
  'Sélection / Croisement',
  'Mutation et diversification',
  'Convergence vers l\'optimum',
  'Résultats finaux',
];

export default function OptimisationPage() {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [liveMsg, setLiveMsg] = useState('');
  const timerRef = useRef<number[]>([]);

  const clear = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const run = () => {
    if (running) return;
    clear();
    setRunning(true);
    setResult(null);
    setProgress(0);
    setActiveStep(-1);
    setLiveMsg('');

    STEPS.forEach((_, i) => {
      const pct = Math.round(((i + 1) / STEPS.length) * 100);
      const t = timerRef.current[timerRef.current.length] = window.setTimeout(() => {
        setActiveStep(i);
        setProgress(pct);
        setLiveMsg(`Étape ${i + 1}/${STEPS.length} — ${STEPS[i]}`);
        if (i === STEPS.length - 1) {
          setRunning(false);
          setResult({
            masseInitiale: 4820,
            masseOptimisee: 3670,
            gain: 23.8,
            iterations: 387,
            elements: [
              { name: 'Poteau G1',  initial: 'HEA 240', optimised: 'HEA 200', ratio: 0.87, gain: '↓ 16%' },
              { name: 'Traverse T1', initial: 'IPE 300', optimised: 'IPE 270', ratio: 0.91, gain: '↓ 12%' },
              { name: 'Poteau G2',  initial: 'HEA 240', optimised: 'HEA 200', ratio: 0.85, gain: '↓ 16%' },
            ],
          });
        }
      }, (i + 1) * 900);
      timerRef.current.push(t);
    });
  };

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Optimisation</span></div>
      <div className="mod-title">Module Optimisation</div>
      <div className="mod-sub">// Algorithmes d'optimisation — Minimisation du poids sous contraintes EC3</div>

      <div className="mod-grid-2">
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Configuration de l'optimisation</div>

          <div className="mod-field">
            <label className="mod-field-label">Méthode d'optimisation</label>
            <select className="mod-field-select">
              <option>Algorithme Génétique (GA)</option>
              <option>Gradient Conjugué</option>
              <option>Essaim de Particules (PSO)</option>
              <option>Recuit Simulé</option>
              <option>Méthode Hybride GA + Gradient</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Fonction objectif</label>
            <select className="mod-field-select">
              <option>Minimiser masse totale (kg)</option>
              <option>Minimiser coût matière (DT)</option>
              <option>Minimiser déflexion maximale</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Variables de conception</label>
            <select className="mod-field-select" multiple style={{ height: 74 }}>
              <option selected>Section poteau (catalogue)</option>
              <option selected>Section traverse (catalogue)</option>
              <option>Pas entre portiques</option>
              <option>Hauteur poteau</option>
            </select>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Contraintes actives</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {[
                'Résistance flexion ≤ 1.0',
                'Flambement ≤ 1.0',
                'Déflexion ≤ L/200',
                'Déversement ≤ 1.0',
              ].map((c, i) => (
                <label key={c} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--tx2)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={i < 3} style={{ accentColor: 'var(--cy)' }} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Nombre d'itérations max</label>
            <input type="number" className="mod-field-input" defaultValue={500} />
          </div>

          <div className="mod-btn-group">
            <button className="mod-btn mod-btn-primary" onClick={run} disabled={running}>
              {running ? '⟳ Optimisation…' : "Lancer l Optimisation"}
            </button>
          </div>
        </div>

        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Progression de l'algorithme</div>

          {STEPS.map((s, i) => (
            <div className="mod-opt-step" key={s}>
              <div className={`mod-step-num${i < activeStep ? ' done' : i === activeStep ? ' active' : ''}`}>
                {i < activeStep ? '✓' : i + 1}
              </div>
              <div className="mod-step-label" style={{ color: i <= activeStep ? 'var(--tx)' : undefined }}>
                {s}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--tx3)', marginBottom: 6 }}>
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="mod-progress-bar">
              <div className="mod-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {liveMsg && (
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--tx3)', marginTop: 10 }}>
              {liveMsg}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mod-result">
          <div className="mod-result-header">◈ Résultats de l'optimisation</div>
          <div className="mod-grid-4" style={{ marginBottom: 16 }}>
            <div className="mod-metric">
              <div className="mod-metric-label">Masse initiale</div>
              <div className="mod-metric-value">{result.masseInitiale.toLocaleString()}</div>
              <div className="mod-metric-unit">kg</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Masse optimisée</div>
              <div className="mod-metric-value" style={{ color: 'var(--em)' }}>
                {result.masseOptimisee.toLocaleString()}
              </div>
              <div className="mod-metric-unit">kg</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Gain</div>
              <div className="mod-metric-value" style={{ color: 'var(--em)' }}>{result.gain}%</div>
              <div className="mod-metric-unit">réduction</div>
            </div>
            <div className="mod-metric">
              <div className="mod-metric-label">Itérations</div>
              <div className="mod-metric-value">{result.iterations}</div>
              <div className="mod-metric-unit">générations</div>
            </div>
          </div>

          <table className="mod-table">
            <thead>
              <tr>
                <th>Élément</th>
                <th>Section initiale</th>
                <th>Section optimisée</th>
                <th>Taux utilisation</th>
                <th>Gain</th>
              </tr>
            </thead>
            <tbody>
              {result.elements.map((e) => (
                <tr key={e.name}>
                  <td>{e.name}</td>
                  <td>{e.initial}</td>
                  <td className="mod-val-accent">{e.optimised}</td>
                  <td>{e.ratio}</td>
                  <td className="mod-val-accent">{e.gain}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mod-btn-group" style={{ marginTop: 14 }}>
            <button className="mod-btn mod-btn-primary">⬇ Exporter les résultats</button>
            <button className="mod-btn mod-btn-outline">Envoyer vers RSA →</button>
          </div>
        </div>
      )}
    </div>
  );
}
