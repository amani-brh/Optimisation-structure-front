/**
 * run-tasks-server.cjs
 * Lightweight task-runner that the React UI calls to launch local processes.
 *
 *  Start:  node run-tasks-server.cjs
 *  Port:   3001  (change below if needed)
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = 3001;

// ═══════════════════════════════════════════════════════════════
//  TASK DEFINITIONS  —  keep in sync with src/config/tasks.ts
// ═══════════════════════════════════════════════════════════════
const TASKS = {
  'mcp-server': {
    cwd: 'C:\\Users\\kunha\\source\\repos\\AmaniRobot\\MCP Robot',
    cmd: 'python',
    args: ['server.py'],
  },
  'extract-robot': {
    cwd: 'C:\\Users\\ameni\\Videos\\Robot Python API',
    cmd: 'python',
    args: ['extract_poids.py'],
  },
  'open-robot': {
    cwd: '.',
    cmd: 'python',
    args: [
      '-c',
      [
        'import win32com.client as com',
        'robot = com.Dispatch("Robot.Application")',
        'robot.Visible = True',
        'print("Connected to Autodesk Robot")',
      ].join('; '),
    ],
  },
};

// Running processes (keep reference to avoid duplicate launches)
const running = {};

// ─── CORS helper ───────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── JSON reply ─────────────────────────────────────────────────
function json(res, code, data) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── Server ─────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // GET /status/:id
  if (req.method === 'GET' && url.pathname.startsWith('/status/')) {
    const id = url.pathname.slice('/status/'.length);
    const proc = running[id];
    if (!proc) return json(res, 200, { status: 'idle' });
    return json(res, 200, { status: proc.exitCode === null ? 'running' : proc.exitCode === 0 ? 'done' : 'error', exitCode: proc.exitCode });
  }

  // POST /run/:id
  if (req.method === 'POST' && url.pathname.startsWith('/run/')) {
    const id = url.pathname.slice('/run/'.length);
    const task = TASKS[id];
    if (!task) return json(res, 404, { error: `Unknown task: ${id}` });

    // If already running, return status
    if (running[id] && running[id].exitCode === null) {
      return json(res, 200, { status: 'already-running', pid: running[id].pid });
    }

    console.log(`[run] ${id}: ${task.cmd} ${task.args.join(' ')}  (cwd: ${task.cwd})`);

    const proc = spawn(task.cmd, task.args, {
      cwd: task.cwd,
      shell: true,
      stdio: 'pipe',
    });

    proc.exitCode = null;
    running[id] = proc;

    proc.stdout.on('data', d => process.stdout.write(`[${id}] ${d}`));
    proc.stderr.on('data', d => process.stderr.write(`[${id}] ${d}`));
    proc.on('close', code => {
      console.log(`[${id}] exited with code ${code}`);
      proc.exitCode = code;
    });

    return json(res, 200, { status: 'started', pid: proc.pid });
  }

  // POST /stop/:id
  if (req.method === 'POST' && url.pathname.startsWith('/stop/')) {
    const id = url.pathname.slice('/stop/'.length);
    const proc = running[id];
    if (!proc || proc.exitCode !== null) return json(res, 200, { status: 'not-running' });
    proc.kill();
    return json(res, 200, { status: 'killed' });
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Task runner listening on http://localhost:${PORT}`);
  console.log('Available tasks:', Object.keys(TASKS).join(', '));
});
