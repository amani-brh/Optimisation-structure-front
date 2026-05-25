import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import OptimizationsPage from './pages/OptimizationsPage';
import WindCalcPage from './pages/WindCalcPage';
import GeometriePage from './pages/GeometriePage';
import ChargementPage from './pages/ChargementPage';
import CalculPage from './pages/CalculPage';
import RSAExportPage from './pages/RSAExportPage';
import OptimisationPage from './pages/OptimisationPage';
import PropositionPage from './pages/PropositionPage';
import Sidebar from './components/Sidebar';

type Theme = 'light' | 'dark';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <header className="topbar">
        <div className="logo">
          <div className="logo-box">
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.3" />
              <path
                d="M7 2v2.5M7 9.5V12M2 7h2.5M9.5 7H12"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="7" cy="7" r="1.5" fill="white" />
            </svg>
          </div>
          Robot<span>Optim</span>
          <span className="logo-badge">PRO</span>
        </div>

        <span className="topbar-slogan">Optimiser · Analyser · Construire</span>

        <div className="tbsep" />

        

        <div className="tabnav">
          <NavLink
            to="/optimisations"
            className={({ isActive }) => 'tabbtn' + (isActive ? ' active' : '')}
          >
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
              <path
                d="M1 8L3.5 4.5l3 2L10 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Optimisations
          </NavLink>
          <NavLink
            to="/vent"
            className={({ isActive }) => 'tabbtn' + (isActive ? ' active' : '')}
          >
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="1" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3 3.5h5M3 5.5h3.5M3 7.5h4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            Calcul du vent
          </NavLink>
          <NavLink
            to="/proposition"
            className={({ isActive }) => 'tabbtn' + (isActive ? ' active' : '')}
          >
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none">
              <path d="M2 9L5.5 2 9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 7h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            Proposition des dimensions optimales
          </NavLink>
        </div>

        <div className="tbright">
          <div className="status-dot" title="Système opérationnel" />
          <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--tx3)' }}>Système OK</span>
          <span className="badge-version">v1.0.0</span>
          <button className="topbar-btn">MCP Export</button>
          <button className="topbar-btn">Nouvelle Session</button>
          <button
            className="thmbtn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Changer de thème"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/optimisations" replace />} />
            <Route path="/optimisations" element={<OptimizationsPage />} />
            <Route path="/optimisations/:id" element={<OptimizationsPage />} />
            <Route path="/vent" element={<WindCalcPage />} />
            <Route path="/geometrie" element={<GeometriePage />} />
            <Route path="/chargement" element={<ChargementPage />} />
            <Route path="/calcul" element={<CalculPage />} />
            <Route path="/rsa" element={<RSAExportPage />} />
            <Route path="/optimisation" element={<OptimisationPage />} />
            <Route path="/proposition" element={<PropositionPage />} />
            <Route path="*" element={<Navigate to="/optimisations" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
