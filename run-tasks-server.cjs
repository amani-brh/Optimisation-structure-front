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
    cwd: '.',
    cmd: 'python',
    args: ['scripts/mcp_server.py', '--selftest'],
  },
  'extract-robot': {
    cwd: '.',
    cmd: 'python',
    args: ['scripts/extract_robot.py'],
  },
  'open-robot': {
    cwd: '.',
    cmd: 'python',
    args: ['scripts/open_robot.py'],
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
    return json(res, 200, { 
      status: proc.exitCode === null ? 'running' : proc.exitCode === 0 ? 'done' : 'error', 
      exitCode: proc.exitCode,
      stdout: proc.stdout_buf,
      stderr: proc.stderr_buf,
      pid: proc.pid,
    });
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

    // Read request body for optional arguments
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let extraArgs = [];
      try {
        if (body) {
          const data = JSON.parse(body);
          if (data.args && Array.isArray(data.args)) {
            extraArgs = data.args;
          }
        }
      } catch (e) {
        // Ignore parse errors, use empty extra args
      }

      // Merge task args with extra args
      const allArgs = [...task.args, ...extraArgs];
      console.log(`[run] ${id}: ${task.cmd} ${allArgs.join(' ')}  (cwd: ${task.cwd})`);

      const proc = spawn(task.cmd, allArgs, {
        cwd: task.cwd,
        shell: false,
        stdio: 'pipe',
      });

      proc.exitCode = null;
      proc.stdout_buf = '';
      proc.stderr_buf = '';
      running[id] = proc;

      proc.stdout.on('data', d => { 
        const text = d.toString();
        process.stdout.write(`[${id}] ${text}`);
        proc.stdout_buf += text;
        if (proc.stdout_buf.length > 2048) proc.stdout_buf = proc.stdout_buf.slice(-2048);
      });
      proc.stderr.on('data', d => { 
        const text = d.toString();
        process.stderr.write(`[${id}] ${text}`);
        proc.stderr_buf += text;
        if (proc.stderr_buf.length > 2048) proc.stderr_buf = proc.stderr_buf.slice(-2048);
      });
      proc.on('close', code => {
        console.log(`[${id}] exited with code ${code}`);
        if (proc.stderr_buf) console.log(`[${id}] stderr: ${proc.stderr_buf}`);
        if (proc.stdout_buf) console.log(`[${id}] stdout: ${proc.stdout_buf}`);
        proc.exitCode = code;
      });

      json(res, 200, { status: 'started', pid: proc.pid });
    });
    return;
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
