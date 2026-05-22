import { useState } from 'react';

export default function RSAExportPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const launch = () => {
    setLog([]);
    setRunning(true);
    const steps = [
      '→ Connexion au serveur MCP (port 5000)…',
      '→ Sérialisation du modèle : 18 nœuds, 24 barres',
      '→ Transfert des cas de charge (6 cas)…',
      '✓ Modèle transmis avec succès — RSA en cours de traitement',
    ];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setLog((prev) => [...prev, s]);
        if (i === steps.length - 1) setRunning(false);
      }, (i + 1) * 800);
    });
  };

  const exportJson = () => {
    const data = {
      project: 'Hangar Industriel',
      nodes: 18,
      bars: 24,
      supports: 4,
      loadCases: 6,
      combinations: 4,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hangar_model.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Export RSA</span></div>
      <div className="mod-title">Module Export RSA</div>
      <div className="mod-sub">// Robot Structural Analysis — Lancement via MCP (Model Command Protocol)</div>

      <div className="mod-launch-box">
        <div className="mod-launch-icon">🔧</div>
        <div className="mod-launch-title">Robot Structural Analysis</div>
        <div className="mod-launch-desc">
          Lance automatiquement RSA via le protocole MCP développé dans ce projet.
          Le modèle structurel complet (géométrie, sections, charges) sera transmis.
        </div>
        <div className="mod-launch-btns">
          <button className="mod-btn mod-btn-primary" onClick={launch} disabled={running}>
            {running ? '⟳ Lancement…' : '▶ Lancer RSA via MCP'}
          </button>
          <button className="mod-btn mod-btn-outline" onClick={exportJson}>
            ⬇ Exporter modèle JSON
          </button>
        </div>

        {log.length > 0 && (
          <div className="mod-terminal">
            <div className="mod-t-line">
              <span className="mod-t-prompt">$</span>
              <span className="mod-t-cmd">optistruct mcp --target RSA --project hangar.opt</span>
            </div>
            {log.map((l, i) => (
              <div className="mod-t-line" key={i}>
                <span className={l.startsWith('✓') ? 'mod-t-info' : 'mod-t-out'}>{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mod-grid-2">
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Contenu du modèle exporté</div>
          <table className="mod-table">
            <thead>
              <tr><th>Élément</th><th>Quantité</th><th>Statut</th></tr>
            </thead>
            <tbody>
              {[
                { el: 'Nœuds',         qty: 18, tag: 'green', lbl: 'OK' },
                { el: 'Barres / Poutres', qty: 24, tag: 'green', lbl: 'OK' },
                { el: 'Appuis',        qty: 4,  tag: 'green', lbl: 'OK' },
                { el: 'Cas de charge', qty: 6,  tag: 'blue',  lbl: 'Prêt' },
                { el: 'Combinaisons',  qty: 4,  tag: 'blue',  lbl: 'Prêt' },
              ].map(({ el, qty, tag, lbl }) => (
                <tr key={el}>
                  <td>{el}</td>
                  <td className="mod-val-accent">{qty}</td>
                  <td><span className={`mod-tag mod-tag-${tag}`}>{lbl}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Paramètres MCP</div>
          <div className="mod-field">
            <label className="mod-field-label">Chemin RSA</label>
            <input
              type="text"
              className="mod-field-input"
              defaultValue="C:\Program Files\Autodesk\Robot Structural Analysis"
            />
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Port MCP</label>
            <input type="number" className="mod-field-input" defaultValue={5000} />
          </div>
          <div className="mod-field">
            <label className="mod-field-label">Format d'échange</label>
            <select className="mod-field-select">
              <option>JSON (recommandé)</option>
              <option>XML</option>
              <option>RTD</option>
            </select>
          </div>
          <div className="mod-btn-group">
            <button className="mod-btn mod-btn-outline">Tester la connexion</button>
          </div>
        </div>
      </div>
    </div>
  );
}
