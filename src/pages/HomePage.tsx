import { Link } from 'react-router-dom';
import TaskButton from '../components/TaskButton';
import { TASKS } from '../config/tasks';

const modules = [
  {
    to: '/geometrie',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 18L11 4l8 14H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="11" y1="4" x2="11" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" opacity=".5"/>
      </svg>
    ),
    label: 'Géométrie',
    code: 'MOD-01',
    desc: 'Définition du portique : portée, hauteurs, pente de toiture, pas entre portiques.',
    tag: 'EC3',
    tagClass: 'blue',
    status: 'active',
  },
  {
    to: '/chargement',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="10" width="16" height="2" rx="1" fill="currentColor" opacity=".3"/>
        <line x1="6"  y1="10" x2="6"  y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="11" y1="10" x2="11" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="16" y1="10" x2="16" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 8h16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7 5l4-2 4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Charges & Surcharges',
    code: 'MOD-02',
    desc: 'Charges permanentes, d\'exploitation, neige et combinaisons selon l\'Eurocode 1.',
    tag: 'EC1',
    tagClass: 'blue',
    status: 'active',
  },
  {
    to: '/vent',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 8c2-3 8-3 8 0s6 3 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3 12c2-2 5-2 7 0s5 2 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 16c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Calcul du vent',
    code: 'MOD-03',
    desc: 'Pression dynamique de pointe, coefficients Cpe murs & toiture, zones A–J.',
    tag: 'EN 1991-1-4',
    tagClass: 'blue',
    status: 'active',
  },
  {
    to: '/calcul',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 11h8M11 7v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Calcul structurel',
    code: 'MOD-04',
    desc: 'Vérification des sections, résistance des éléments, flambement et déformation.',
    tag: 'EC3',
    tagClass: 'green',
    status: 'active',
  },
  {
    to: '/rsa',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M7 7h8M7 10.5h8M7 14h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="16" cy="15" r="3.5" fill="var(--bg2)" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M14.5 15l1 1 2-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Export RSA',
    code: 'MOD-05',
    desc: 'Génération du modèle Robot Structural Analysis (.rtd) pour post-traitement.',
    tag: 'RSA',
    tagClass: 'amber',
    status: 'active',
  },
  {
    to: '/optimisation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16L7 10l3 3 4-6 5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="4" r="2" fill="currentColor" opacity=".4"/>
        <circle cx="19" cy="4" r="1" fill="currentColor"/>
      </svg>
    ),
    label: 'Optimisation',
    code: 'MOD-06',
    desc: 'Optimisation multi-critères des dimensions de portique par algorithme génétique.',
    tag: 'AI',
    tagClass: 'violet',
    status: 'active',
  },
];

const tagStyles: Record<string, string> = {
  blue:   'background:var(--br-soft);color:var(--br);border-color:color-mix(in srgb,var(--br) 30%,transparent)',
  green:  'background:var(--em-soft);color:var(--em);border-color:color-mix(in srgb,var(--em) 30%,transparent)',
  amber:  'background:var(--am-soft);color:var(--am);border-color:color-mix(in srgb,var(--am) 30%,transparent)',
  violet: 'background:var(--vl-soft);color:var(--vl);border-color:color-mix(in srgb,var(--vl) 30%,transparent)',
};

export default function HomePage() {
  return (
    <div style={{ padding: '2rem 2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r3)',
        padding: '2rem 2.5rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--sh2)',
      }}>
        {/* Blueprint grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(var(--bd) 1px,transparent 1px),linear-gradient(90deg,var(--bd) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
        }}/>

        {/* Accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--br),var(--cy))' }}/>

        <div style={{ position: 'relative', display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left: title */}
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--br)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Projet de fin d'études — Stage 2025/2026
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 700, color: 'var(--tx)', letterSpacing: '-.02em', lineHeight: 1.15 }}>
              Optimisation d'une structure<br />
              <span style={{ color: 'var(--br)' }}>en charpente métallique</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--tx2)', fontSize: 13, lineHeight: 1.6, maxWidth: 440 }}>
              Outil de calcul et d'optimisation d'une structure industriels à double pente
              conformément aux Eurocodes EN 1991 et EN 1993.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/geometrie" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'var(--br)', color: '#fff', border: 'none',
                borderRadius: 'var(--r2)', padding: '8px 18px',
                fontWeight: 600, fontSize: 13, fontFamily: 'var(--fb)',
                textDecoration: 'none', boxShadow: '0 2px 8px rgba(30,78,140,.3)',
              }}>
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.3"/>
                  <path d="M6 2v4l3 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Démarrer l'analyse
              </Link>
              <Link to="/optimisations" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'var(--bg3)', color: 'var(--tx2)', border: '1px solid var(--bd2)',
                borderRadius: 'var(--r2)', padding: '8px 18px',
                fontWeight: 500, fontSize: 13, fontFamily: 'var(--fb)',
                textDecoration: 'none',
              }}>
                Voir les optimisations
              </Link>
            </div>
          </div>

          {/* Right: info card */}
          <div style={{
            flex: '0 0 auto', minWidth: 230,
            background: 'var(--bg3)', border: '1px solid var(--bd)',
            borderRadius: 'var(--r2)', padding: '1.1rem 1.25rem',
          }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--tx3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Fiche du projet
            </div>

            {[
              { label: 'Étudiante', value: 'Amani Barhoumi' },
              { label: 'Spécialité', value: 'Génie Civil' },
              { label: 'Promotion', value: '2025 / 2026' },
              { label: 'Établissement', value: 'ENIT' },
              { label: 'Entreprise', value: 'CIAG Concept' },
              { label: 'Type de stage', value: 'PFE — Stage fin d\'études' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, padding: '5px 0', borderBottom: '1px solid var(--bd)' }}>
                <span style={{ color: 'var(--tx3)', fontSize: 11, fontFamily: 'var(--fm)', whiteSpace: 'nowrap' }}>{label}</span>
                <span style={{ color: 'var(--tx)', fontSize: 12, fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <div style={{ flex: 1, background: 'var(--br-soft)', borderRadius: 'var(--r1)', padding: '5px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 16, fontWeight: 700, color: 'var(--br)' }}>6</div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>Modules</div>
              </div>
              <div style={{ flex: 1, background: 'var(--em-soft)', borderRadius: 'var(--r1)', padding: '5px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 16, fontWeight: 700, color: 'var(--em)' }}>EC3</div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>Norme</div>
              </div>
              <div style={{ flex: 1, background: 'var(--am-soft)', borderRadius: 'var(--r1)', padding: '5px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 16, fontWeight: 700, color: 'var(--am)' }}>AI</div>
                <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>Optim.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Workflow bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--bg2)', border: '1px solid var(--bd)',
        borderRadius: 'var(--r2)', marginBottom: '1.5rem',
        overflow: 'hidden', boxShadow: 'var(--sh1)',
      }}>
        <div style={{ padding: '8px 14px', fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--tx3)', letterSpacing: '.06em', textTransform: 'uppercase', borderRight: '1px solid var(--bd)', whiteSpace: 'nowrap' }}>
          Workflow
        </div>
        {modules.map((m, i) => (
          <div key={m.to} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Link to={m.to} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', color: 'var(--tx2)', textDecoration: 'none',
              fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
              transition: 'background .12s,color .12s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--tx2)'; }}
            >
              <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--tx4)', marginRight: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {m.label}
            </Link>
            {i < modules.length - 1 && (
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1 1l5 5-5 5" stroke="var(--bd3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* ── Module cards grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
      }}>
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r3)',
              padding: '1.25rem 1.4rem',
              height: '100%',
              boxShadow: 'var(--sh1)',
              transition: 'border-color .15s, box-shadow .15s, transform .1s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--br)';
                el.style.boxShadow = 'var(--sh3), 0 0 0 1px color-mix(in srgb,var(--br) 15%,transparent)';
                el.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'var(--bd)';
                el.style.boxShadow = 'var(--sh1)';
                el.style.transform = 'none';
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42,
                  background: 'var(--br-soft)',
                  border: '1px solid color-mix(in srgb,var(--br) 20%,transparent)',
                  borderRadius: 'var(--r2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--br)',
                  flexShrink: 0,
                }}>
                  {m.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span style={{
                    fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 600,
                    padding: '2px 7px', borderRadius: 'var(--r1)',
                    border: '1px solid', letterSpacing: '.04em',
                    ...(Object.fromEntries(
                      tagStyles[m.tagClass]
                        .split(';')
                        .filter(Boolean)
                        .map(s => {
                          const [k, ...v] = s.split(':');
                          return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(':').trim()];
                        })
                    )),
                  }}>
                    {m.tag}
                  </span>
                  <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--tx4)' }}>{m.code}</span>
                </div>
              </div>

              {/* Label */}
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx)', marginBottom: 6, letterSpacing: '-.01em' }}>
                {m.label}
              </div>

              {/* Description */}
              <p style={{ margin: 0, fontSize: 12, color: 'var(--tx2)', lineHeight: 1.55 }}>
                {m.desc}
              </p>

              {/* Arrow */}
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--br)', fontSize: 12, fontWeight: 500 }}>
                <span>Ouvrir le module</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Background tasks panel ── */}
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--bg2)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r3)',
        boxShadow: 'var(--sh1)',
        overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.7rem 1.1rem',
          borderBottom: '1px solid var(--bd)',
          background: 'var(--bg3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="11" height="11" rx="2" stroke="var(--tx3)" strokeWidth="1.2"/>
              <path d="M3.5 4h6M3.5 6.5h4M3.5 9h5.5" stroke="var(--tx3)" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--tx2)' }}>Tâches système</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--tx4)', background: 'var(--bg5)', padding: '1px 6px', borderRadius: 'var(--r1)', border: '1px solid var(--bd)' }}>
              3 tâches
            </span>
          </div>
          <span style={{ fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--tx4)' }}>
            Requiert: <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 2, color: 'var(--tx3)' }}>npm run tasks</code>
          </span>
        </div>

        {/* Task cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
          padding: '1rem',
        }}>
          <TaskButton
            task={TASKS.mcpServer}
            fullCmd={`cd "${TASKS.mcpServer.cwd}" && ${TASKS.mcpServer.cmd} ${TASKS.mcpServer.args.join(' ')}`}
          />
          <TaskButton
            task={TASKS.extractRobot}
            fullCmd={`cd "${TASKS.extractRobot.cwd}" && ${TASKS.extractRobot.cmd} ${TASKS.extractRobot.args.join(' ')}`}
          />
          <TaskButton
            task={TASKS.openRobot}
            fullCmd={`python -c "import win32com.client as com; robot = com.Dispatch('Robot.Application'); robot.Visible = True"`}
          />
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        background: 'var(--bg2)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--r2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        boxShadow: 'var(--sh1)',
      }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--tx3)' }}>
          <span style={{ color: 'var(--tx2)', fontWeight: 600 }}>Amani Barhoumi</span>
          {' '}— PFE Génie Civil · ENIT × CIAG Concept · 2025/2026
        </div>
        <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--tx4)' }}>
          <span>EN 1991-1-1 · EN 1991-1-3 · EN 1991-1-4 · EN 1993-1-1</span>
          <span style={{ color: 'var(--bd2)' }}>|</span>
          <span>RobotOptim PRO v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
