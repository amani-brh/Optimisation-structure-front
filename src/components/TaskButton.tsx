import { useState, useEffect, useRef } from 'react';
import { TASK_RUNNER_URL, type TaskDef } from '../config/tasks';

type Status = 'idle' | 'starting' | 'running' | 'done' | 'error' | 'offline';

const COLOR = {
  blue:  { bg: 'var(--br-soft)',  border: 'var(--br)',  text: 'var(--br)'  },
  green: { bg: 'var(--em-soft)', border: 'var(--em)',  text: 'var(--em)'  },
  amber: { bg: 'var(--am-soft)', border: 'var(--am)',  text: 'var(--am)'  },
};

const STATUS_DOT: Record<Status, { color: string; animate: boolean }> = {
  idle:     { color: 'var(--bd3)',    animate: false },
  starting: { color: 'var(--am)',     animate: true  },
  running:  { color: 'var(--em)',     animate: true  },
  done:     { color: 'var(--em)',     animate: false },
  error:    { color: 'var(--rs)',     animate: false },
  offline:  { color: 'var(--tx4)',   animate: false },
};

const STATUS_LABEL: Record<Status, string> = {
  idle:     'Prêt',
  starting: 'Démarrage…',
  running:  'En cours…',
  done:     'Terminé ✓',
  error:    'Erreur',
  offline:  'Serveur hors ligne',
};

interface Props {
  task: TaskDef;
  /** full shell command shown in the copy tooltip */
  fullCmd: string;
}

export default function TaskButton({ task, fullCmd }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [log, setLog] = useState('');
  const [copied, setCopied] = useState(false);
  const [args, setArgs] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const c = COLOR[task.color];
  const dot = STATUS_DOT[status];

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  // Poll /status/:id while running
  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${TASK_RUNNER_URL}/status/${task.id}`);
        const d = await r.json();
        console.log(`[TaskButton] Poll ${task.id}: status=${d.status}`, d);
        if (d.status === 'running') { setStatus('running'); }
        else if (d.status === 'done') { 
          setStatus('done'); 
          setLog('Success ✓'); 
          stopPolling(); 
          console.log(`[TaskButton] Task completed successfully`); 
        }
        else if (d.status === 'error') { 
          setStatus('error');
          const errMsg = d.stderr ? `Python Error:\n${d.stderr}` : `Exit code ${d.exitCode}`;
          setLog(errMsg);
          stopPolling();
          console.error(`[TaskButton] Task failed:`, d);
        }
        else { stopPolling(); }
      } catch (err) { 
        console.error(`[TaskButton] Poll error:`, err);
        stopPolling(); 
      }
    }, 1200);
  };

  useEffect(() => () => stopPolling(), []);

  const handleRun = async () => {
    if (status === 'running' || status === 'starting') return;
    setStatus('starting');
    setLog('');
    console.log(`[TaskButton] Starting task: ${task.id}${args ? ` with args: ${args}` : ''}`);
    try {
      console.log(`[TaskButton] Sending request to ${TASK_RUNNER_URL}/run/${task.id}`);
      
      // Parse args (space-separated or quoted)
      const argsArray = args.trim() ? args.trim().split(/\s+/) : [];
      const body = argsArray.length > 0 ? JSON.stringify({ args: argsArray }) : undefined;
      
      const r = await fetch(`${TASK_RUNNER_URL}/run/${task.id}`, { 
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body,
      });
      console.log(`[TaskButton] Response status: ${r.status}`);
      const d = await r.json();
      console.log(`[TaskButton] Response data:`, d);
      if (d.status === 'started' || d.status === 'already-running') {
        setStatus('running');
        console.log(`[TaskButton] Task started, polling for status...`);
        startPolling();
      } else {
        setStatus('error');
        setLog(d.error ?? 'Unknown error');
        console.error(`[TaskButton] Task error:`, d.error);
      }
    } catch (err) {
      setStatus('offline');
      const msg = 'Task runner not reachable — run: npm run tasks';
      setLog(msg);
      console.error(`[TaskButton] Network error:`, err, msg);
    }
  };

  const handleStop = async () => {
    try { await fetch(`${TASK_RUNNER_URL}/stop/${task.id}`, { method: 'POST' }); } catch {}
    stopPolling();
    setStatus('idle');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCmd).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  const isActive = status === 'running' || status === 'starting';

  return (
    <div style={{
      background: 'var(--bg2)',
      border: `1px solid ${isActive ? c.border : 'var(--bd)'}`,
      borderRadius: 'var(--r2)',
      padding: '0.9rem 1rem',
      boxShadow: isActive ? `0 0 0 1px color-mix(in srgb,${c.border} 18%,transparent)` : 'var(--sh1)',
      transition: 'border-color .2s, box-shadow .2s',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Status dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dot.color, flexShrink: 0,
          boxShadow: dot.animate ? `0 0 0 3px color-mix(in srgb,${dot.color} 22%,transparent)` : 'none',
          animation: dot.animate ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
        }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--tx)' }}>{task.label}</div>
          <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 1 }}>{task.desc}</div>
        </div>
        <span style={{
          fontFamily: 'var(--fm)', fontSize: 9, fontWeight: 600,
          padding: '2px 6px', borderRadius: 'var(--r1)',
          background: c.bg, color: c.text,
          border: `1px solid color-mix(in srgb,${c.border} 30%,transparent)`,
        }}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Command preview */}
      <div style={{
        fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--tx4)',
        background: 'var(--bg3)', borderRadius: 'var(--r1)',
        padding: '4px 8px', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }} title={fullCmd}>
        {fullCmd}
      </div>

      {/* Error/log line */}
      {log && (
        <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: status === 'error' ? 'var(--rs)' : 'var(--tx3)' }}>
          {log}
        </div>
      )}

      {/* Arguments input (optional) */}
      <input
        type="text"
        placeholder="Arguments (e.g. --selftest)"
        value={args}
        onChange={(e) => setArgs(e.target.value)}
        disabled={status === 'running' || status === 'starting'}
        style={{
          fontFamily: 'var(--fm)',
          fontSize: 10,
          padding: '4px 8px',
          borderRadius: 'var(--r1)',
          border: '1px solid var(--bd)',
          background: 'var(--bg3)',
          color: 'var(--tx3)',
          outline: 'none',
        }}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button
          onClick={isActive ? handleStop : handleRun}
          style={{
            flex: 1,
            background: isActive ? 'var(--rs-soft)' : c.bg,
            color: isActive ? 'var(--rs)' : c.text,
            border: `1px solid color-mix(in srgb,${isActive ? 'var(--rs)' : c.border} 35%,transparent)`,
            borderRadius: 'var(--r1)',
            padding: '5px 0',
            fontFamily: 'var(--fb)',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all .12s',
          }}
        >
          {isActive ? '■ Arrêter' : '▶ Lancer'}
        </button>
        <button
          onClick={handleCopy}
          title="Copier la commande"
          style={{
            background: 'var(--bg3)',
            color: copied ? 'var(--em)' : 'var(--tx3)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--r1)',
            padding: '5px 10px',
            fontFamily: 'var(--fm)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.6; transform:scale(1.3); }
        }
      `}</style>
    </div>
  );
}
