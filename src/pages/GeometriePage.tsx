import { useState } from 'react';
import { useStructure, STORAGE_KEY, loadStored } from './StructureContext';

/* ── 2D cross-section SVG (ported from reference script) ── */
function buildCoupeSVG(h_dim: number, ht_dim: number, adeg: number, b_dim: number): string {
  if (b_dim <= 0 || ht_dim <= 0) return '';

  const SW = 680, SH = 310, LP = 95, RP = 75, TP = 42, BP = 58;
  const DW = SW - LP - RP, DH = SH - TP - BP;
  const scX = DW / b_dim, scY = DH / (ht_dim * 1.18);
  const pxB = b_dim * scX;
  const pxH = h_dim * scY;
  const pxHt = ht_dim * scY;
  const pxF = (ht_dim - h_dim) * scY;
  const x0 = LP, ySOL = TP + DH;
  const yH = ySOL - pxH;
  const yHt = ySOL - pxHt;
  const mx = x0 + pxB / 2;

  const W = '#00D4FF', D = '#3D5A78', T = '#F59E0B', M = '#3B82F6', TXT = '#E2EAF4';

  let s = `<svg viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs>
    <marker id="cDA" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="${D}"/></marker>
    <marker id="cDB" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${D}"/></marker>
    <marker id="cTA" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="${T}"/></marker>
    <marker id="cTB" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${T}"/></marker>
    <marker id="cAW" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="${W}"/></marker>
  </defs>`;

  // Ground
  s += `<line x1="${x0 - 10}" y1="${ySOL}" x2="${x0 + pxB + 10}" y2="${ySOL}" stroke="#6B85A0" stroke-width="3"/>`;
  for (let hx = x0 - 5; hx < x0 + pxB + 14; hx += 10)
    s += `<line x1="${hx}" y1="${ySOL}" x2="${hx - 7}" y2="${ySOL + 8}" stroke="#2A3D52" stroke-width="1"/>`;

  // Fills
  s += `<rect x="${x0}" y="${yH}" width="${pxB}" height="${pxH}" fill="rgba(59,130,246,.07)"/>`;
  s += `<polygon points="${x0},${yH} ${mx},${yHt} ${x0 + pxB},${yH}" fill="rgba(245,158,11,.1)"/>`;

  // Walls
  s += `<line x1="${x0}" y1="${ySOL}" x2="${x0}" y2="${yH}" stroke="${M}" stroke-width="3"/>`;
  s += `<line x1="${x0 + pxB}" y1="${ySOL}" x2="${x0 + pxB}" y2="${yH}" stroke="${M}" stroke-width="3"/>`;

  // Roof slopes
  s += `<line x1="${x0}" y1="${yH}" x2="${mx}" y2="${yHt}" stroke="${T}" stroke-width="2.5"/>`;
  s += `<line x1="${mx}" y1="${yHt}" x2="${x0 + pxB}" y2="${yH}" stroke="${T}" stroke-width="2.5"/>`;

  // Ridge dashed centerline
  s += `<line x1="${mx}" y1="${ySOL}" x2="${mx}" y2="${yHt}" stroke="${T}" stroke-width="1" stroke-dasharray="5,4" opacity=".4"/>`;
  s += `<text x="${mx + 5}" y="${yHt - 5}" font-family="monospace" font-size="9" fill="${T}" opacity=".8">Faîte</text>`;

  // Dim h₁ (right)
  const xCR = x0 + pxB + 20;
  s += `<line x1="${x0 + pxB}" y1="${yH}"   x2="${xCR + 2}" y2="${yH}"   stroke="${D}" stroke-width=".8" stroke-dasharray="2,2"/>`;
  s += `<line x1="${x0 + pxB}" y1="${ySOL}" x2="${xCR + 2}" y2="${ySOL}" stroke="${D}" stroke-width=".8" stroke-dasharray="2,2"/>`;
  s += `<line x1="${xCR}" y1="${ySOL}" x2="${xCR}" y2="${yH}" stroke="${D}" stroke-width="1.2" marker-start="url(#cDA)" marker-end="url(#cDB)"/>`;
  s += `<text x="${xCR + 7}" y="${ySOL - pxH / 2 + 4}" font-family="monospace" font-size="11" fill="${D}">h₁=${h_dim}m</text>`;

  // Dim ht (left)
  const xCL = x0 - 28;
  s += `<line x1="${x0}" y1="${yHt}" x2="${xCL - 2}" y2="${yHt}" stroke="${T}" stroke-width=".8" stroke-dasharray="2,2"/>`;
  s += `<line x1="${x0}" y1="${ySOL}" x2="${xCL - 2}" y2="${ySOL}" stroke="${T}" stroke-width=".8" stroke-dasharray="2,2"/>`;
  s += `<line x1="${xCL}" y1="${ySOL}" x2="${xCL}" y2="${yHt}" stroke="${T}" stroke-width="1.2" marker-start="url(#cTA)" marker-end="url(#cTB)"/>`;
  s += `<text x="${xCL - 7}" y="${ySOL - pxHt / 2 + 4}" font-family="monospace" font-size="11" fill="${T}" text-anchor="end">ht=${ht_dim.toFixed(2)}m</text>`;

  // Dim f = rise (far right)
  const xCF = x0 + pxB + 46;
  s += `<line x1="${x0 + pxB}" y1="${yH}"  x2="${xCF + 2}" y2="${yH}"  stroke="${T}" stroke-width=".7" stroke-dasharray="2,2"/>`;
  s += `<line x1="${mx}"       y1="${yHt}" x2="${xCF + 2}" y2="${yHt}" stroke="${T}" stroke-width=".7" stroke-dasharray="2,2"/>`;
  if (pxF > 4) {
    s += `<line x1="${xCF}" y1="${yH}" x2="${xCF}" y2="${yHt}" stroke="${T}" stroke-width="1" marker-start="url(#cTA)" marker-end="url(#cTB)"/>`;
    s += `<text x="${xCF - 7}" y="${yH - pxF / 2 + 4}"
              font-family="monospace"
              font-size="10"
              text-anchor="end"
              fill="${T}">
              f=${(ht_dim - h_dim).toFixed(2)}m
          </text>`;
  }

  // Dim L (bottom)
  const yBC = ySOL + 22;
  s += `<line x1="${x0}"      y1="${ySOL}" x2="${x0}"      y2="${yBC + 4}" stroke="${D}" stroke-width=".8"/>`;
  s += `<line x1="${x0 + pxB}" y1="${ySOL}" x2="${x0 + pxB}" y2="${yBC + 4}" stroke="${D}" stroke-width=".8"/>`;
  s += `<line x1="${x0}" y1="${yBC}" x2="${x0 + pxB}" y2="${yBC}" stroke="${D}" stroke-width="1.2" marker-start="url(#cDA)" marker-end="url(#cDB)"/>`;
  s += `<text x="${mx}" y="${yBC + 14}" text-anchor="middle" font-family="monospace" font-size="11" fill="${D}">L=${b_dim}m</text>`;

  // Angle α arc
  const alpRad = Math.atan2(pxF, pxB / 2);
  const arcR = Math.min(40, pxB * .13, Math.max(pxH, pxHt) * .35);
  if (arcR > 4 && alpRad > 0) {
    const pBx = x0 + arcR * Math.cos(alpRad), pBy = yH - arcR * Math.sin(alpRad);
    s += `<path d="M ${x0 + arcR},${yH} A ${arcR} ${arcR} 0 0 1 ${pBx.toFixed(1)},${pBy.toFixed(1)}" fill="none" stroke="${T}" stroke-width="1.5"/>`;
    s += `<text x="${x0 + arcR * 1.35}" y="${yH - arcR * .45}" font-family="monospace" font-size="10" fill="${T}">α=${adeg.toFixed(2)}°</text>`;
  }

  // Wind face labels

  // Wind arrow


  // Title
  s += `<text x="${SW / 2}" y="20" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="${TXT}">Coupe transversale — Vue en élévation (à l'échelle)</text>`;
  s += `<text x="${SW / 2}" y="32" text-anchor="middle" font-family="monospace" font-size="9" fill="${D}">Portique à double pente | h₁ + f = ht</text>`;

  s += '</svg>';
  return s;
}

export default function GeometriePage() {
  const { L, H, setL, setH } = useStructure();
  const [saved, setSaved] = useState(false);
  const [showApercu, setShowApercu] = useState(false);

  const [alpha, setAlpha] = useState<number>(() => loadStored().alpha ?? 11.31);
  const [longueur, setLongueur] = useState<number>(() => loadStored().longueur ?? 50);
  const [nbTravees, setNbTravees] = useState<number>(() => loadStored().nbTravees ?? 1);
  const [pas, setPas] = useState<number>(() => loadStored().pas ?? 5);
  const [typeStructure, setTypeStructure] = useState<string>(() => loadStored().typeStructure ?? 'Portique à double pente');
  const [encastrement, setEncastrement] = useState<string>(() => loadStored().encastrement ?? 'Encastré – Encastré');

  // ht field value: user-defined as (L/2)*tan(α)
  const ht = (L / 2) * Math.tan((alpha * Math.PI) / 180);
  // Total ridge height for the SVG = eave + rise
  const htTotal = H + ht;

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ L, H, alpha, longueur, nbTravees, pas, typeStructure, encastrement }));
    setSaved(true);
  };

  const markUnsaved = () => setSaved(false);

  return (
    <>
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
                onChange={(e) => { setL(Number(e.target.value)); markUnsaved(); }}
              />
              <div className="mod-field-unit">mètres (axe à axe)</div>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Longueur du bâtiment</label>
              <input
                type="number"
                className="mod-field-input"
                value={longueur}
                onChange={(e) => { setLongueur(Number(e.target.value)); markUnsaved(); }}
              />
              <div className="mod-field-unit">mètres</div>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Hauteur poteau h₁</label>
              <input
                type="number"
                className="mod-field-input"
                value={H}
                onChange={(e) => { setH(Number(e.target.value)); markUnsaved(); }}
              />
              <div className="mod-field-unit">mètres au niveau de l'about</div>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Hauteur au faîtage ht</label>
              <input type="number" className="mod-field-input" value={ht.toFixed(3)} readOnly />
              <div className="mod-field-unit">mètres (montée) — (L/2)×tg(α)</div>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Nombre de travées</label>
              <input
                type="number"
                className="mod-field-input"
                value={nbTravees}
                onChange={(e) => { setNbTravees(Number(e.target.value)); markUnsaved(); }}
              />
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Pas entre portiques</label>
              <input
                type="number"
                className="mod-field-input"
                value={pas}
                onChange={(e) => { setPas(Number(e.target.value)); markUnsaved(); }}
              />
              <div className="mod-field-unit">mètres</div>
            </div>
          </div>

          <div className="mod-card">
            <div className="mod-card-title"><span className="mod-card-dot" />Toiture &amp; Paramètres</div>

            <div className="mod-field">
              <label className="mod-field-label">Pente de toiture α</label>
              <input
                type="number"
                className="mod-field-input"
                value={alpha}
                step={0.5}
                onChange={(e) => { setAlpha(Number(e.target.value)); markUnsaved(); }}
              />
              <div className="mod-field-unit">degrés — arctan((ht−h₁) / (L/2))</div>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Type de structure</label>
              <select
                className="mod-field-select"
                value={typeStructure}
                onChange={(e) => { setTypeStructure(e.target.value); markUnsaved(); }}
              >
                <option>Portique à double pente</option>
                <option>Portique à mono-pente</option>
                <option>Portique à croupe</option>
              </select>
            </div>

            <div className="mod-field">
              <label className="mod-field-label">Encastrement pied poteau</label>
              <select
                className="mod-field-select"
                value={encastrement}
                onChange={(e) => { setEncastrement(e.target.value); markUnsaved(); }}
              >
                <option>Encastré – Encastré</option>
                <option>Encastré – Articulé</option>
                <option>Articulé – Articulé</option>
              </select>
            </div>

            <div className="mod-btn-group">
              <button className="mod-btn mod-btn-primary" onClick={handleSave}>
                {saved ? '✓ Géométrie enregistrée' : 'Enregistrer'}
              </button>
              <button className="mod-btn mod-btn-outline" onClick={() => setShowApercu(true)}>
                Aperçu 2D
              </button>
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
            <div className="mod-metric-value">{longueur.toFixed(1)}</div>
            <div className="mod-metric-unit">mètres</div>
          </div>
          <div className="mod-metric">
            <div className="mod-metric-label">Hauteur poteau</div>
            <div className="mod-metric-value">{H.toFixed(1)}</div>
            <div className="mod-metric-unit">mètres</div>
          </div>
          <div className="mod-metric">
            <div className="mod-metric-label">Pente α</div>
            <div className="mod-metric-value">{alpha.toFixed(1)}°</div>
            <div className="mod-metric-unit">degrés</div>
          </div>
        </div>
      </div>

      {/* 2D Preview Modal */}
      {showApercu && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setShowApercu(false)}
        >
          <div
            style={{ background: '#0B1628', border: '1px solid #1A2E45', borderRadius: 10, padding: '1.5rem', maxWidth: 760, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: '#E2EAF4', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '.02em' }}>Aperçu 2D — Coupe transversale</div>
                <div style={{ color: '#3D5A78', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: 2 }}>Portique à double pente • à l'échelle</div>
              </div>
              <button
                style={{ background: 'transparent', border: '1px solid #1A2E45', color: '#6B85A0', borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                onClick={() => setShowApercu(false)}
              >×</button>
            </div>

            {/* SVG */}
            <div
              style={{ background: '#050A14', borderRadius: 6, border: '1px solid #1A2E45', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: buildCoupeSVG(H, htTotal, alpha, L) }}
            />

            {/* Summary strip */}
            <div style={{ marginTop: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#6B85A0', fontFamily: 'monospace', borderTop: '1px solid #1A2E45', paddingTop: '0.75rem' }}>
              <span>L = <strong style={{ color: '#00D4FF' }}>{L} m</strong></span>
              <span>h₁ = <strong style={{ color: '#3B82F6' }}>{H} m</strong></span>
              <span>f = <strong style={{ color: '#F59E0B' }}>{ht.toFixed(3)} m</strong></span>
              <span>ht = <strong style={{ color: '#F59E0B' }}>{htTotal.toFixed(3)} m</strong></span>
              <span>α = <strong style={{ color: '#F59E0B' }}>{alpha.toFixed(2)}°</strong></span>
              <span style={{ marginLeft: 'auto', color: '#253650' }}>Cliquer hors du panneau pour fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
