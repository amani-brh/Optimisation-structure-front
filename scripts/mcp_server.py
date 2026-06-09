#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Structure Optimizer MCP Server
Wrapper script that runs server.py with optional arguments
"""
import sys
import os
import subprocess

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Get any command-line arguments passed to this script
script_args = sys.argv[1:]  # Everything after the script name

print("[INFO] Starting MCP Server...")
if script_args:
    print(f"[INFO] Arguments: {' '.join(script_args)}")

# Try multiple possible paths for the MCP server
mcp_paths = [
    r'C:\Users\ameni\Videos\optimisation-de-structure\MCP Robot\server.py',
    r'C:\Users\ameni\source\repos\AmaniRobot\MCP Robot\server.py',
]

mcp_script = None
for path_option in mcp_paths:
    if os.path.exists(path_option):
        mcp_script = path_option
        break

if not mcp_script:
    print(f"[ERROR] MCP Server script not found at any of these locations:", file=sys.stderr)
    for p in mcp_paths:
        print(f"  - {p}", file=sys.stderr)
    print(f"[FIX] Verify the path to your MCP Robot directory", file=sys.stderr)
    sys.exit(1)

print(f"[OK] Found MCP Server script: {mcp_script}")

# Build command with any arguments - don't use shell, pass args directly
cmd_args = [sys.executable, mcp_script] + script_args

print(f"[INFO] Running: {' '.join(cmd_args)}")

# Run the actual MCP server script
try:
    # Use shell=False for better argument handling (no escaping issues)
    result = subprocess.run(
        cmd_args,
        cwd=os.path.dirname(mcp_script),
        shell=False  # Direct execution, no shell escaping
    )
    
    if result.returncode == 0:
        print("[SUCCESS] MCP Server shutdown gracefully")
    else:
        print(f"[ERROR] MCP Server exited with code {result.returncode}", file=sys.stderr)
    
    sys.exit(result.returncode)
    
except KeyboardInterrupt:
    print("[INFO] MCP Server stopped by user")
    sys.exit(0)
except Exception as e:
    print(f"[ERROR] Failed to run MCP Server: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(2)
