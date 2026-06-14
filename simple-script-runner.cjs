#!/usr/bin/env node
/**
 * simple-script-runner.cjs
 * Lightweight HTTP server to run local scripts
 * 
 * Usage: node simple-script-runner.cjs [port]
 * Default port: 3002
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.argv[2] || 3002;

// Map of script IDs to their file paths
const SCRIPTS = {
  'mcp-server': path.join(__dirname, 'scripts', 'mcp_server.py'),
  'extract-robot': path.join(__dirname, 'scripts', 'extract_robot.py'),
  'open-robot': path.join(__dirname, 'scripts', 'open_robot.py'),
};

// Active processes
const running = {};

function json(res, code, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }

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
    const scriptPath = SCRIPTS[id];
    
    if (!scriptPath) return json(res, 404, { error: `Unknown script: ${id}` });
    if (running[id] && running[id].exitCode === null) {
      return json(res, 200, { status: 'already-running', pid: running[id].pid });
    }

    // Read request body for optional arguments
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let args = [];
      try {
        if (body) {
          const data = JSON.parse(body);
          if (data.args && Array.isArray(data.args)) {
            args = data.args;
          }
        }
      } catch (e) {
        // Ignore parse errors, use empty args
      }

      const cmdArgs = [scriptPath, ...args];
      console.log(`[${id}] Starting: python "${scriptPath}"${args.length ? ' ' + args.join(' ') : ''}`);

      const proc = spawn('python', cmdArgs, {
        shell: false,
        stdio: 'pipe',
      });

      proc.exitCode = null;
      proc.stdout_buf = '';
      proc.stderr_buf = '';
      running[id] = proc;

      proc.stdout.on('data', (d) => {
        const text = d.toString();
        process.stdout.write(`[${id}] ${text}`);
        proc.stdout_buf += text;
        if (proc.stdout_buf.length > 2048) proc.stdout_buf = proc.stdout_buf.slice(-2048);
      });

      proc.stderr.on('data', (d) => {
        const text = d.toString();
        process.stderr.write(`[${id}] ${text}`);
        proc.stderr_buf += text;
        if (proc.stderr_buf.length > 2048) proc.stderr_buf = proc.stderr_buf.slice(-2048);
      });

      proc.on('close', (code) => {
        console.log(`[${id}] exited with code ${code}`);
        if (proc.stderr_buf) console.log(`[${id}] stderr:\n${proc.stderr_buf}`);
        if (proc.stdout_buf) console.log(`[${id}] stdout:\n${proc.stdout_buf}`);
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
  console.log(`Script runner listening on http://localhost:${PORT}`);
  console.log('Available scripts:', Object.keys(SCRIPTS).join(', '));
  console.log('\nUsage: http://localhost:' + PORT + '/run/open-robot');
});
