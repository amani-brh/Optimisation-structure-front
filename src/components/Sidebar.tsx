import { NavLink } from 'react-router-dom';

const modules = [
  { to: '/geometrie',   icon: '⬡', label: 'Géométrie' },
  { to: '/chargement',  icon: '↓', label: 'Charges & Surcharges', badge: 'EC1', badgeClass: 'blue' },
  { to: '/vent',        icon: '🌬', label: 'Calcul du vent',       badge: 'EC1', badgeClass: 'blue' },
  { to: '/calcul',      icon: '∑', label: 'Calcul structurel' },
  { to: '/rsa',         icon: '▶', label: 'Export RSA' },
  { to: '/optimisation',icon: '◈', label: 'Optimisation',          badge: 'AI' },
];

export default function Sidebar() {
  return (
    <aside className="mod-sidebar">
      <div className="sb-section">
        <div className="sb-label">Navigation</div>
        <NavLink
          to="/optimisations"
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <span className="nav-icon">⌂</span>
          Accueil
        </NavLink>
      </div>

      <div className="sb-section">
        <div className="sb-label">Modules</div>
        {modules.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <span className="nav-icon">{m.icon}</span>
            {m.label}
            {m.badge && (
              <span className={`nav-badge${m.badgeClass ? ' ' + m.badgeClass : ''}`}>
                {m.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="sb-project">
        <div className="sb-proj-tag">Projet actif</div>
        <div className="sb-proj-name">Hangar Industriel</div>
        <div className="sb-proj-sub">Portique 20m × 50m</div>
        <div className="sb-prog-label">Progression</div>
        <div className="mod-progress-bar">
          <div className="mod-progress-fill" style={{ width: '42%' }} />
        </div>
        <div className="sb-prog-pct">42%</div>
      </div>
    </aside>
  );
}
