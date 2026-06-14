import { useStructure, loadStored } from './StructureContext';
import rawData from '../data/db-ciag.json';

interface DBRow {
  id: string;
  P: number;      // Portée (matches StructureContext.L)
  L: number;      // Longueur bâtiment (matches localStorage longueur)
  travee: number; // Nombre de travées (matches localStorage nbTravees)
  alpha: number;  // Pente (matches localStorage alpha)
  h: number;      // Hauteur poteau (matches StructureContext.H)
  Sp: string;     // Section poteau
  St: string;     // Section traverse
  classe: string; // Classe combinée
  etat: 0 | 1;   // Statut validation manuelle
}

const db: DBRow[] = rawData as DBRow[];

const TOL = 0.5; // tolerance for float comparison

function near(a: number, b: number) {
  return Math.abs(a - b) <= TOL;
}

export default function DBCIAGPage() {
  const { L, H } = useStructure();
  const stored = loadStored();
  const longueur: number = stored.longueur ?? 50;
  const nbTravees: number = stored.nbTravees ?? 1;
  const alpha: number = stored.alpha ?? 11.31;

  // Determine which rows match current app values
  function isActive(row: DBRow): boolean {
    return (
      near(row.P, L) &&
      near(row.h, H) &&
      near(row.L, longueur) &&
      row.travee === nbTravees &&
      near(row.alpha, alpha)
    );
  }

  // Per-cell match helpers
  function matchP(v: number) { return near(v, L); }
  function matchL(v: number) { return near(v, longueur); }
  function matchTravee(v: number) { return v === nbTravees; }
  function matchAlpha(v: number) { return near(v, alpha); }
  function matchH(v: number) { return near(v, H); }

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>DB CIAG</span></div>
      <div className="mod-title">Base de Données CIAG</div>
      <div className="mod-sub">// Configurations structurales de référence — comparaison avec le projet actif</div>

      {/* Current app values banner */}
      <div
        style={{
          background: 'var(--bg4)',
          border: '1px solid var(--bd)',
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: '1rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          fontSize: 12,
          fontFamily: 'var(--fm)',
        }}
      >
        <span style={{ color: 'var(--tx3)' }}>Valeurs projet actif :</span>
        {[
          ['P', `${L} m`],
          ['L', `${longueur} m`],
          ['Travée', `${nbTravees}`],
          ['α', `${alpha.toFixed(2)}°`],
          ['h', `${H} m`],
        ].map(([label, val]) => (
          <span key={label}>
            <span style={{ color: 'var(--tx3)' }}>{label} = </span>
            <span style={{ color: 'var(--cy)', fontWeight: 600 }}>{val}</span>
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: 11 }}>
          Les cellules en cyan correspondent aux valeurs actives
        </span>
      </div>

      {/* Table */}
      <div className="mod-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            fontFamily: 'var(--fm)',
          }}
        >
          <thead>
            <tr style={{ background: 'var(--bg5)' }}>
              {[
                'Échantillon', 'P (m)', 'L (m)', 'Travée', 'α', 'h (m)',
                'Sp', 'St', 'C (Sp_St)', 'État',
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--tx2)',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid var(--bd)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col === 'α' ? 'α (°)' : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {db.map((row) => {
              const active = isActive(row);
              return (
                <tr
                  key={row.id}
                  style={{
                    background: active ? 'var(--cya)' : 'transparent',
                    borderLeft: active ? '3px solid var(--cy)' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Échantillon */}
                  <td style={tdStyle()}>
                    <span style={{ fontWeight: 700, color: active ? 'var(--cy)' : 'var(--tx)' }}>
                      {row.id}
                    </span>
                    {active && (
                      <span className="mod-tag mod-tag-blue" style={{ marginLeft: 6, fontSize: 10 }}>
                        Actif
                      </span>
                    )}
                  </td>

                  {/* P */}
                  <td style={tdStyle(matchP(row.P))}>
                    {row.P}
                  </td>

                  {/* L */}
                  <td style={tdStyle(matchL(row.L))}>
                    {row.L}
                  </td>

                  {/* Travée */}
                  <td style={tdStyle(matchTravee(row.travee))}>
                    {row.travee}
                  </td>

                  {/* Alpha */}
                  <td style={tdStyle(matchAlpha(row.alpha))}>
                    {row.alpha.toFixed(2)}°
                  </td>

                  {/* h */}
                  <td style={tdStyle(matchH(row.h))}>
                    {row.h}
                  </td>

                  {/* Sp */}
                  <td style={tdStyle()}>
                    <span style={{ color: 'var(--cy)' }}>{row.Sp}</span>
                  </td>

                  {/* St */}
                  <td style={tdStyle()}>
                    <span style={{ color: 'var(--am)' }}>{row.St}</span>
                  </td>

                  {/* Classe */}
                  <td style={tdStyle()}>
                    <code style={{ fontSize: 12, background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4 }}>
                      {row.classe}
                    </code>
                  </td>

                  {/* État */}
                  <td style={tdStyle()}>
                    {row.etat === 1 ? (
                      <span className="mod-tag mod-tag-green">1 ✓</span>
                    ) : (
                      <span className="mod-tag mod-tag-amber">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '0.75rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          fontSize: 11,
          color: 'var(--tx3)',
          fontFamily: 'var(--fm)',
        }}
      >
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--cya)', border: '1px solid var(--cy)', marginRight: 4, verticalAlign: 'middle' }} />
          Ligne active — correspond aux valeurs du projet
        </span>
        <span>
          <span style={{ color: 'var(--cy)', fontWeight: 600 }}>Valeur en cyan</span> = cellule qui correspond
        </span>
        <span>
          <span className="mod-tag mod-tag-green" style={{ fontSize: 10 }}>1 ✓</span>&nbsp;= validé &nbsp;
          <span className="mod-tag mod-tag-amber" style={{ fontSize: 10 }}>0</span>&nbsp;= en attente
        </span>
        <span style={{ marginLeft: 'auto' }}>
          Source :&nbsp;<code style={{ fontSize: 10 }}>src/data/db-ciag.json</code>
        </span>
      </div>
    </div>
  );
}

// Cell style — highlight when value matches current app
function tdStyle(matches?: boolean): React.CSSProperties {
  return {
    padding: '9px 14px',
    borderBottom: '1px solid var(--bd)',
    color: matches ? 'var(--cy)' : 'var(--tx)',
    fontWeight: matches ? 600 : 400,
    whiteSpace: 'nowrap',
  };
}
