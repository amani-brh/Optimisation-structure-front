#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract Robot Structure Weights to MongoDB
Wrapper script that runs extract_poids.py
"""
import sys
import os
import subprocess
import time

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

print("[INFO] Starting Robot extraction to MongoDB...")
print("[INFO] Checking if Robot is running...")

# Check if Robot is already running
try:
    import win32com.client as com
    try:
        robot = com.GetObject(None, "Robot.Application")
        print("[OK] Robot is already running")
    except:
        print("[WARN] Robot is NOT running - it needs to be open for extraction")
        print("[WARN] Please launch Robot first, then retry extraction")
        print("[INFO] Attempting to create Robot connection...")
        try:
            robot = com.Dispatch("Robot.Application")
            robot.Visible = True
            print("[OK] Robot launched, waiting for initialization...")
            time.sleep(3)
        except Exception as e:
            print(f"[ERROR] Cannot start Robot: {e}", file=sys.stderr)
            print("[FIX] Please open Robot manually, then retry extraction", file=sys.stderr)
            sys.exit(1)
except ImportError:
    print("[WARN] win32com not available - Robot availability cannot be verified", file=sys.stderr)

# Path to the actual extract script
extract_script = r'C:\Users\ameni\Videos\Robot Python API\extract_poids.py'

if not os.path.exists(extract_script):
    print(f"[ERROR] Script not found: {extract_script}", file=sys.stderr)
    print(f"[FIX] Verify the path exists and extract_poids.py is there", file=sys.stderr)
    sys.exit(1)

print(f"[OK] Found extract script: {extract_script}")
print("[INFO] Running extraction (this may take a few minutes)...")

# Run the actual extraction script
try:
    result = subprocess.run(
        [sys.executable, extract_script],
        cwd=os.path.dirname(extract_script),
        capture_output=False
    )
    
    if result.returncode == 0:
        print("[SUCCESS] Robot extraction completed - data saved to MongoDB")
    else:
        print(f"[ERROR] Extraction failed with exit code {result.returncode}", file=sys.stderr)
        print("[HINT] Common causes:", file=sys.stderr)
        print("  1. Robot is not open or not responding", file=sys.stderr)
        print("  2. Robot doesn't have a document loaded", file=sys.stderr)
        print("  3. Robot is in the middle of another operation", file=sys.stderr)
        print("[FIX] Try: Close Robot, open it, ensure document is loaded, then retry", file=sys.stderr)
    
    sys.exit(result.returncode)
    
except Exception as e:
    print(f"[ERROR] Failed to run extraction: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(2)

