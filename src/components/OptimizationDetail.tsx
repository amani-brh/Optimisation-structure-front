import type { OptimizationReport } from '../types/optimization';
import { statusLabel } from '../types/optimization';

interface Props {
  report: OptimizationReport;
  onBack: () => void;
}

export default function OptimizationDetail({ report, onBack }: Props) {
  const st = statusLabel(report.status);
  const date = new Date(report.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'medium',
  });

  // Filter modifications with real numeric data vs. those that are just narrative notes
  const realMods = report.suggestedModifications.filter(
    (m) => m.currentProfile && m.recommendedProfile,
  );
  const narrativeMods = report.suggestedModifications.filter(
    (m) => !m.currentProfile && !m.recommendedProfile,
  );

  const paramEntries = Object.entries(report.parameterSuggestions || {});

  return (
    <div className="detail-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="back-btn" onClick={onBack}>
          ← Retour à la liste
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={'status-badge ' + st.className}>{st.label}</span>
          <span style={{ fontSize: '.72rem', color: 'var(--tx3)', fontFamily: 'var(--fm)' }}>
            {date}
          </span>
        </div>
      </div>

      {/* ─── Headline metrics ─── */}
      <div className="card">
        <div className="cardhd">
          <div className="ctitle">
            <span className="cbar em" />
            Synthèse de l'optimisation
          </div>
          <span className="ctag te">
            #{report.id.slice(0, 8)}…
          </span>
        </div>

        <div className="mets m4">
          <div className="met hi-em">
            <div className="mlbl">Gain de poids</div>
            <div className="mval">
              {report.weightReductionPercent.toFixed(2)}
              <span className="munit">%</span>
            </div>
          </div>
          <div className="met">
            <div className="mlbl">Poids actuel</div>
            <div className="mval">
              {report.currentWeightKg.toFixed(1)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met em-ac">
            <div className="mlbl">Poids projeté</div>
            <div className="mval">
              {report.projectedWeightKg.toFixed(1)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met am-ac">
            <div className="mlbl">Économie totale</div>
            <div className="mval">
              {report.results.totalWeightSavings.toFixed(1)}
              <span className="munit">kg</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--tx3)', marginBottom: 4 }}>
            <span>Réduction de poids</span>
            <span style={{ fontFamily: 'var(--fm)', color: 'var(--em)', fontWeight: 600 }}>
              {report.weightReductionPercent.toFixed(2)}%
            </span>
          </div>
          <div className="progress" style={{ height: 10 }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, Math.max(0, report.weightReductionPercent))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── AI Recommendation + Strategy ─── */}
      <div className="g2">
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar" />
              Recommandation IA
            </div>
            <span className="ctag tc">AI</span>
          </div>
          <div className="callout">{report.aiRecommendation}</div>
        </div>

        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar am" />
              Stratégie d'optimisation
            </div>
            <span className="ctag ta">Plan</span>
          </div>
          <div className="callout am">{report.optimizationStrategy}</div>
        </div>
      </div>

      {/* ─── Design modifications ─── */}
      {report.designModifications.length > 0 && (
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar em" />
              Modifications de conception ({report.designModifications.length})
            </div>
          </div>
          <ul className="bullet-list em">
            {report.designModifications.map((mod, i) => (
              <li key={i}>{mod}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Section-by-section quantitative table ─── */}
      {realMods.length > 0 && (
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar vl" />
              Modifications de sections
            </div>
            <span className="ctag tv">{realMods.length} section(s)</span>
          </div>
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Profil actuel</th>
                  <th>Profil recommandé</th>
                  <th>Quantité</th>
                  <th>Poids/pièce actuel</th>
                  <th>Poids/pièce reco.</th>
                  <th>Économie totale</th>
                </tr>
              </thead>
              <tbody>
                {realMods.map((m, i) => (
                  <tr key={i}>
                    <td className="neu left">{m.sectionType}</td>
                    <td className="neg">{m.currentProfile || '—'}</td>
                    <td className="pos">{m.recommendedProfile || '—'}</td>
                    <td>{m.quantity || '—'}</td>
                    <td>{m.currentWeightPerPiece || '—'}</td>
                    <td>{m.recommendedWeightPerPiece || '—'}</td>
                    <td className="pos">
                      {m.totalWeightSavings ? `${m.totalWeightSavings.toFixed(1)} kg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Narrative checklist (modifications without numeric data) ─── */}
      {narrativeMods.length > 0 && (
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar rs" />
              Étapes & vérifications
            </div>
            <span className="ctag tr">{narrativeMods.length} action(s)</span>
          </div>
          <ul className="bullet-list">
            {narrativeMods.map((m, i) => (
              <li key={i}>{m.justification || m.sectionType}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Parameter suggestions ─── */}
      {paramEntries.length > 0 && (
        <div className="card">
          <div className="cardhd">
            <div className="ctitle">
              <span className="cbar am" />
              Suggestions de paramètres
            </div>
            <span className="ctag ta">{paramEntries.length} suggestion(s)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {paramEntries.map(([key, val]) => (
              <div className="suggest-row" key={key}>
                <div className="suggest-key">{key.replace('_', ' ')}</div>
                <div className="suggest-val">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Results / implementation ─── */}
      <div className="card">
        <div className="cardhd">
          <div className="ctitle">
            <span className="cbar" />
            Résultats & faisabilité
          </div>
          <span className="ctag tc">Résumé</span>
        </div>

        <div className="mets m3">
          <div className="met">
            <div className="mlbl">Économie totale</div>
            <div className="mval">
              {report.results.totalWeightSavings.toFixed(1)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met">
            <div className="mlbl">Sections modifiées</div>
            <div className="mval">{report.results.numberOfSectionsModified}</div>
          </div>
          <div className="met">
            <div className="mlbl">Impact coût estimé</div>
            <div className="mval">
              {report.results.estimatedCostImpact || '—'}
              <span className="munit">€</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.9rem' }}>
          <div className="sech">Faisabilité</div>
          <div className="callout">{report.results.feasibilityAssessment}</div>
        </div>

        {report.results.implementationNotes.length > 0 && (
          <div style={{ marginTop: '0.9rem' }}>
            <div className="sech">Notes d'implémentation</div>
            <ul className="bullet-list am">
              {report.results.implementationNotes.map((note, i) => (
                <li key={i} style={{ fontFamily: 'var(--fm)', fontSize: '.74rem' }}>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
