import { useState } from 'react';

type TabId = 'perm' | 'expl' | 'combis';

export default function ChargementPage() {
  const [tab, setTab] = useState<TabId>('perm');
  const [couv, setCouv]   = useState(0.15);
  const [bard, setBard]   = useState(0.10);
  const [charp, setCharp] = useState(0.20);
  const [entr, setEntr]   = useState(0.50);
  const [pous, setPous]   = useState(0.20);
  const [util, setUtil]   = useState(1.00);

  const totalG = couv + bard + charp;
  const totalQ = entr + pous + util;

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Charges &amp; Surcharges</span></div>
      <div className="mod-title">Module Charges &amp; Surcharges</div>
      <div className="mod-sub">// Eurocode 1 — Actions sur les structures — NF EN 1991</div>

      <div className="mod-alert mod-alert-info">
        Calcul selon <strong>NF EN 1991</strong> (Eurocode 1). Utilisez le module{' '}
        <a href="/vent" style={{ color: 'var(--cy)', textDecoration: 'underline' }}>Calcul du vent</a>{' '}
        pour le détail EC1-1-4.
      </div>

      <div className="mod-tabs">
        <div className={`mod-tab${tab === 'perm'   ? ' active' : ''}`} onClick={() => setTab('perm')}>
          ⚖ Charges permanentes G
        </div>
        <div className={`mod-tab${tab === 'expl'   ? ' active' : ''}`} onClick={() => setTab('expl')}>
          🏗 Surcharges d'exploitation Q
        </div>
        <div className={`mod-tab${tab === 'combis' ? ' active' : ''}`} onClick={() => setTab('combis')}>
          🔗 Combinaisons EC0
        </div>
      </div>

      {tab === 'perm' && (
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Charges permanentes G</div>

          {[
            { label: 'Couverture',  val: couv,  set: setCouv,  min: 0.05, max: 0.5,  step: 0.05 },
            { label: 'Bardage',     val: bard,  set: setBard,  min: 0.05, max: 0.4,  step: 0.05 },
          ].map(({ label, val, set, min, max, step }) => (
            <div className="mod-charge-row" key={label}>
              <div className="mod-charge-name">{label}</div>
              <input
                type="range"
                className="mod-charge-slider"
                min={min} max={max} step={step} value={val}
                onChange={e => set(parseFloat(e.target.value))}
              />
              <div className="mod-charge-val">{val.toFixed(2)} kN/m²</div>
            </div>
          ))}

          <div className="mod-total-row">
            <span>Σ G permanentes :</span>
            <span className="mod-total-val">{totalG.toFixed(2)} kN/m²</span>
          </div>
        </div>
      )}

      {tab === 'expl' && (
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Surcharges d'exploitation Q</div>

          {[
            { label: 'Entretien',          val: entr, set: setEntr, min: 0.25, max: 2.0, step: 0.25 },
            { label: 'Poussière ',  val: pous, set: setPous, min: 0.0,  max: 1.0, step: 0.1  },
            { label: 'Charge utile toiture',val: util, set: setUtil, min: 0.25, max: 3.0, step: 0.25 },
          ].map(({ label, val, set, min, max, step }) => (
            <div className="mod-charge-row" key={label}>
              <div className="mod-charge-name">{label}</div>
              <input
                type="range"
                className="mod-charge-slider"
                min={min} max={max} step={step} value={val}
                onChange={e => set(parseFloat(e.target.value))}
              />
              <div className="mod-charge-val">{val.toFixed(2)} kN/m²</div>
            </div>
          ))}

          <div className="mod-total-row">
            <span>Σ Q exploitation :</span>
            <span className="mod-total-val">{totalQ.toFixed(2)} kN/m²</span>
          </div>
        </div>
      )}

      {tab === 'combis' && (
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Combinaisons d'actions (EC0)</div>

          <div className="mod-formula">
            <strong>ELU :</strong> γ_G · G_k + γ_Q · Q_k + γ_Q · ψ₀ · W_k
            <br /><span className="mod-formula-comment">// γ_G = 1.35 ; γ_Q = 1.50 ; ψ₀ = 0.6 (vent)</span>
          </div>
          <div className="mod-formula">
            <strong>ELS :</strong> G_k + Q_k + ψ₁ · W_k
            <br /><span className="mod-formula-comment">// ψ₁ = 0.5 (vent, bâtiments)</span>
          </div>

          <table className="mod-table">
            <thead>
              <tr>
                <th>Cas</th><th>γ_G</th><th>γ_Q</th><th>γ_W</th>
                <th>Description</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ELU 1</td><td>1.35</td><td>1.50</td><td>0.90</td>
                <td className="mod-val-accent">Exploitation dominante</td>
                <td><span className="mod-tag mod-tag-green">Défini</span></td>
              </tr>
              <tr>
                <td>ELU 2</td><td>1.35</td><td>0.90</td><td>1.50</td>
                <td className="mod-val-accent">Vent dominant</td>
                <td><span className="mod-tag mod-tag-green">Défini</span></td>
              </tr>
              <tr>
                <td>ELS</td><td>1.00</td><td>1.00</td><td>0.50</td>
                <td className="mod-val-accent">Service</td>
                <td><span className="mod-tag mod-tag-blue">Calculé</span></td>
              </tr>
              <tr>
                <td>Accidentel</td><td>1.00</td><td>—</td><td>—</td>
                <td className="mod-val-accent">À définir</td>
                <td><span className="mod-tag mod-tag-amber">En attente</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="mod-grid-4">
        <div className="mod-metric">
          <div className="mod-metric-label">Σ G permanentes</div>
          <div className="mod-metric-value">{totalG.toFixed(2)}</div>
          <div className="mod-metric-unit">kN/m²</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">Σ Q exploitation</div>
          <div className="mod-metric-value">{totalQ.toFixed(2)}</div>
          <div className="mod-metric-unit">kN/m²</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">ELU (G + Q dominant)</div>
          <div className="mod-metric-value">{(1.35 * totalG + 1.5 * totalQ).toFixed(2)}</div>
          <div className="mod-metric-unit">kN/m²</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">ELS</div>
          <div className="mod-metric-value">{(totalG + totalQ).toFixed(2)}</div>
          <div className="mod-metric-unit">kN/m²</div>
        </div>
      </div>
    </div>
  );
}
