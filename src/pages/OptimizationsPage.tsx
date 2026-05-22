import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOptimizations } from '../services/api';
import type { OptimizationReport } from '../types/optimization';
import OptimizationReportCard from '../components/OptimizationReportCard';
import OptimizationDetail from '../components/OptimizationDetail';

type LoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; data: OptimizationReport[] };

type SortKey = 'date' | 'gain' | 'savings';

export default function OptimizationsPage() {
  const [state, setState] = useState<LoadState>({ kind: 'idle' });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const navigate = useNavigate();
  const { id: selectedId } = useParams<{ id?: string }>();

  const load = async () => {
    setState({ kind: 'loading' });
    try {
      const data = await fetchOptimizations();
      setState({ kind: 'ok', data });
    } catch (e) {
      setState({
        kind: 'error',
        message: e instanceof Error ? e.message : 'Erreur inconnue',
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reports = state.kind === 'ok' ? state.data : [];

  const filteredSorted = useMemo(() => {
    let r = [...reports];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.id.toLowerCase().includes(q) ||
          x.aiRecommendation.toLowerCase().includes(q) ||
          x.optimizationStrategy.toLowerCase().includes(q),
      );
    }
    r.sort((a, b) => {
      switch (sortBy) {
        case 'gain':
          return b.weightReductionPercent - a.weightReductionPercent;
        case 'savings':
          return b.results.totalWeightSavings - a.results.totalWeightSavings;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return r;
  }, [reports, search, sortBy]);

  const selected = reports.find((r) => r.id === selectedId);

  // ─── Detail mode ───
  if (selected) {
    return (
      <main className="main-content">
        <OptimizationDetail
          report={selected}
          onBack={() => navigate('/optimisations')}
        />
      </main>
    );
  }

  // ─── List mode ───
  const totals = reports.reduce(
    (acc, r) => {
      acc.current += r.currentWeightKg;
      acc.projected += r.projectedWeightKg;
      acc.savings += r.results.totalWeightSavings;
      return acc;
    },
    { current: 0, projected: 0, savings: 0 },
  );

  return (
    <main className="main-content">
      {/* Header band */}
      <div className="card">
        <div className="cardhd">
          <div className="ctitle">
            <span className="cbar" />
            Optimisations de structure
          </div>
          <span className="ctag tc">
            {reports.length} rapport{reports.length > 1 ? 's' : ''}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
            marginBottom: '0.85rem',
          }}
        >
          <div className="met">
            <div className="mlbl">Poids cumulé actuel</div>
            <div className="mval">
              {totals.current.toFixed(0)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met em-ac">
            <div className="mlbl">Poids cumulé projeté</div>
            <div className="mval">
              {totals.projected.toFixed(0)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met hi-em">
            <div className="mlbl">Économie cumulée</div>
            <div className="mval">
              {totals.savings.toFixed(1)}
              <span className="munit">kg</span>
            </div>
          </div>
          <div className="met am-ac">
            <div className="mlbl">Réduction moyenne</div>
            <div className="mval">
              {reports.length
                ? (
                    reports.reduce((s, r) => s + r.weightReductionPercent, 0) /
                    reports.length
                  ).toFixed(2)
                : '0.00'}
              <span className="munit">%</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <input
            className="search-input"
            placeholder="Rechercher dans les recommandations, stratégies, IDs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '7px 11px',
              border: '1px solid var(--bd2)',
              borderRadius: '6px',
              background: 'var(--bg4)',
              color: 'var(--tx)',
              fontFamily: 'var(--fb)',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            style={{
              padding: '7px 11px',
              border: '1px solid var(--bd2)',
              borderRadius: '6px',
              background: 'var(--bg4)',
              color: 'var(--tx)',
              fontFamily: 'var(--fm)',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            <option value="date">Trier par : Date</option>
            <option value="gain">Trier par : Gain %</option>
            <option value="savings">Trier par : Économie kg</option>
          </select>
          <button
            className="back-btn"
            onClick={load}
            style={{ background: 'var(--bg4)', color: 'var(--tx2)', borderColor: 'var(--bd2)' }}
          >
            ⟳ Actualiser
          </button>
        </div>
      </div>

      {/* Body */}
      {state.kind === 'loading' && (
        <div className="empty">
          <div className="spinner" />
          <h3>Chargement…</h3>
          <p>Récupération des rapports d'optimisation depuis le serveur.</p>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="error-box">
          <strong>Impossible de charger les optimisations.</strong>
          <div style={{ marginTop: 6, fontFamily: 'var(--fm)' }}>{state.message}</div>
          <div style={{ marginTop: 8, fontSize: '.72rem', opacity: 0.85 }}>
            Vérifiez que l'API <code>https://localhost:5001/api/v1/Reports/optimizations</code>{' '}
            est lancée et qu'elle est accessible (CORS, certificat de dev).
          </div>
          <button
            className="back-btn"
            style={{ marginTop: 10 }}
            onClick={load}
          >
            Réessayer
          </button>
        </div>
      )}

      {state.kind === 'ok' && filteredSorted.length === 0 && (
        <div className="empty">
          <div className="emptyic">📋</div>
          <h3>Aucun rapport</h3>
          <p>
            {search
              ? 'Aucun rapport ne correspond à votre recherche.'
              : "Aucune optimisation n'a encore été générée."}
          </p>
        </div>
      )}

      {state.kind === 'ok' && filteredSorted.length > 0 && (
        <div className="report-grid">
          {filteredSorted.map((r) => (
            <OptimizationReportCard
              key={r.id}
              report={r}
              active={false}
              onClick={() => navigate(`/optimisations/${r.id}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
