// ═══════════════════════════════════════════════════════════════
//  LOCAL TASK CONFIGURATION
//  Edit paths here to match your PC — nothing else needs to change
// ═══════════════════════════════════════════════════════════════

/** URL of the script runner (simple-script-runner.cjs at project root) */
export const TASK_RUNNER_URL = 'http://localhost:3002';

export interface TaskDef {
  id: string;
  label: string;
  desc: string;
  /** working directory for the command */
  cwd: string;
  /** executable */
  cmd: string;
  /** arguments array */
  args: string[];
  color: 'blue' | 'green' | 'amber';
}

export const TASKS: Record<string, TaskDef> = {
  mcpServer: {
    id: 'mcp-server',
    label: 'MCP Server',
    desc: 'Structure-optimizer MCP server (Claude tool bridge)',
    cwd: '.',
    cmd: 'python',
    args: ['scripts/mcp_server.py', '--selftest'],
    color: 'blue',
  },

  extractRobot: {
    id: 'extract-robot',
    label: 'Extract → MongoDB',
    desc: 'Pull structure weights from Robot API into MongoDB',
    cwd: '.',
    cmd: 'python',
    args: ['scripts/extract_robot.py'],
    color: 'green',
  },

  openRobot: {
    id: 'open-robot',
    label: 'Launch Robot',
    desc: 'Connect to Autodesk Robot Structural Analysis via COM',
    cwd: '.',
    cmd: 'python',
    args: ['scripts/open_robot.py'],
    color: 'amber',
  },
};
