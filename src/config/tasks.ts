// ═══════════════════════════════════════════════════════════════
//  LOCAL TASK CONFIGURATION
//  Edit paths here to match your PC — nothing else needs to change
// ═══════════════════════════════════════════════════════════════

/** URL of the companion task runner (run-tasks-server.cjs at project root) */
export const TASK_RUNNER_URL = 'http://localhost:3001';

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
    cwd: 'C:\\Users\\kunha\\source\\repos\\AmaniRobot\\MCP Robot',
    cmd: 'python',
    args: ['server.py'],
    color: 'blue',
  },

  extractRobot: {
    id: 'extract-robot',
    label: 'Extract → MongoDB',
    desc: 'Pull structure weights from Robot API into MongoDB',
    cwd: 'C:\\Users\\ameni\\Videos\\Robot Python API',
    cmd: 'python',
    args: ['extract_poids.py'],
    color: 'green',
  },

  openRobot: {
    id: 'open-robot',
    label: 'Launch Robot',
    desc: 'Connect to Autodesk Robot Structural Analysis via COM',
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
    color: 'amber',
  },
};
