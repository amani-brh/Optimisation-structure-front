import { useState } from 'react';
import { useStructure } from './StructureContext';

export default function GeometriePage() {
  const { L, H, setL, setH } = useStructure();
  const [saved, setSaved] = useState(false);

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Géométrie</span></div>
      <div className="mod-title">Module Géométrie</div>
      <div className="mod-sub">// Définition du système porteur — portique à double pente</div>

      <div className="mod-grid-2">
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Dimensions générales</div>

          <div className="mod-field">
            <label className="mod-field-label">Portée L (travée)</label>
            <input
              type="number"
              className="mod-field-input"
              value={L}
              onChange={(e) => { setL(Number(e.target.value)); setSaved(false); }}
            />
            <div className="mod-field-unit">mètres (axe à axe)</div>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Longueur du bâtiment</label>
            <input type="number" className="mod-field-input" defaultValue={50} />
            <div className="mod-field-unit">mètres</div>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Hauteur poteau h₁</label>
            <input
              type="number"
              className="mod-field-input"
              value={H}
              onChange={(e) => { setH(Number(e.target.value)); setSaved(false); }}
            />
            <div className="mod-field-unit">mètres au niveau de l'about</div>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Hauteur au faîtage ht</label>
            <input type="number" className="mod-field-input" defaultValue={8} />
            <div className="mod-field-unit">mètres totale</div>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Nombre de travées</label>
            <input type="number" className="mod-field-input" defaultValue={1} />
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Pas entre portiques</label>
            <input type="number" className="mod-field-input" defaultValue={5} />
            <div className="mod-field-unit">mètres</div>
          </div>
        </div>

        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Toiture &amp; Paramètres</div>

          <div className="mod-field">
            <label className="mod-field-label">Pente de toiture α</label>
            <input type="number" className="mod-field-input" defaultValue={11.31} step={0.5} />
            <div className="mod-field-unit">degrés — arctan((h₂−h₁) / (L/2))</div>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Type de structure</label>
            <select className="mod-field-select">
              <option>Portique à double pente</option>
              <option>Portique à mono-pente</option>
              <option>Portique à croupe</option>
            </select>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Encastrement pied poteau</label>
            <select className="mod-field-select">
              <option>Encastré – Encastré</option>
              <option>Encastré – Articulé</option>
              <option>Articulé – Articulé</option>
            </select>
          </div>

          <div className="mod-field">
            <label className="mod-field-label">Classe de conséquence</label>
            <select className="mod-field-select">
              <option>CC1 — Faible</option>
              <option>CC2 — Normal</option>
              <option>CC3 — Élevé</option>
            </select>
          </div>

          <div className="mod-btn-group">
            <button className="mod-btn mod-btn-primary" onClick={() => setSaved(true)}>
              {saved ? '✓ Géométrie enregistrée' : 'Enregistrer'}
            </button>
            <button className="mod-btn mod-btn-outline">Aperçu 2D</button>
          </div>
        </div>
      </div>

      <div className="mod-grid-4">
        <div className="mod-metric">
          <div className="mod-metric-label">Portée</div>
          <div className="mod-metric-value">{L.toFixed(1)}</div>
          <div className="mod-metric-unit">mètres</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">Longueur</div>
          <div className="mod-metric-value">50.0</div>
          <div className="mod-metric-unit">mètres</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">Hauteur poteau</div>
          <div className="mod-metric-value">{H.toFixed(1)}</div>
          <div className="mod-metric-unit">mètres</div>
        </div>
        <div className="mod-metric">
          <div className="mod-metric-label">Pente α</div>
          <div className="mod-metric-value">11.3°</div>
          <div className="mod-metric-unit">degrés</div>
        </div>
      </div>
    </div>
  );
}