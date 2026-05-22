import type { OptimizationReport } from '../types/optimization';
import { statusLabel } from '../types/optimization';

interface Props {
  report: OptimizationReport;
  active: boolean;
  onClick: () => void;
}

export default function OptimizationReportCard({ report, active, onClick }: Props) {
  const st = statusLabel(report.status);
  const date = new Date(report.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const shortId = report.id.slice(0, 8);

  return (
    <div
      className={'report-card' + (active ? ' active' : '')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="rc-head">
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--tx3)', marginBottom: 2 }}>
            Rapport
          </div>
          <div className="rc-id">#{shortId}…</div>
        </div>
        <div className="rc-saving">
          <div className="rc-saving-val">
            −{report.weightReductionPercent.toFixed(1)}%
          </div>
          <div className="rc-saving-lbl">Gain poids</div>
        </div>
      </div>

      <div className="rc-weights">
        <div className="rc-w-block">
          <div className="rc-w-val">{report.currentWeightKg.toFixed(0)}</div>
          <div className="rc-w-lbl">Actuel (kg)</div>
        </div>
        <div className="rc-arrow">→</div>
        <div className="rc-w-block">
          <div className="rc-w-val proj">{report.projectedWeightKg.toFixed(1)}</div>
          <div className="rc-w-lbl">Projeté (kg)</div>
        </div>
      </div>

      <div className="progress" aria-label="Pourcentage d'économie">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(100, Math.max(0, report.weightReductionPercent))}%`,
          }}
        />
      </div>

      <p className="rc-rec">{report.aiRecommendation}</p>

      <div className="rc-foot">
        <span>{date}</span>
        <span className={'status-badge ' + st.className}>{st.label}</span>
      </div>
    </div>
  );
}
