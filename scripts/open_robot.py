#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Open Autodesk Robot Structural Analysis via COM
"""
import sys
import os
import time

# Force UTF-8 encoding for stdout on Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import win32com.client as com
    print("[OK] win32com imported successfully")
except ImportError as e:
    print(f"[ERROR] win32com not found: {e}", file=sys.stderr)
    print("FIX: Install with: pip install pywin32", file=sys.stderr)
    sys.exit(1)

try:
    robot = com.Dispatch("Robot.Application")
    print("[OK] Robot.Application COM object created")
except Exception as e:
    print(f"[ERROR] Cannot create Robot COM object: {e}", file=sys.stderr)
    print("FIX: Ensure Autodesk Robot Structural Analysis is installed and registered", file=sys.stderr)
    sys.exit(2)

try:
    # Make Robot visible
    robot.Visible = True
    print("[OK] Robot window visibility set to True")
    
    print("[INFO] Waiting for Robot to fully load...")
    time.sleep(3)
    
    # Try to maximize window if possible
    try:
        robot.MainWindow.State = 3  # 3 = Maximized in Robot API
        print("[OK] Robot window maximized")
    except:
        pass  # If maximization fails, that's okay
    
    print("[SUCCESS] Connected to Autodesk Robot Structural Analysis")
    print("[INFO] Robot is now visible - keeping connection alive...")
    
    # Keep the script running indefinitely to keep Robot open
    # The process will be terminated by the task manager when needed
    print("[INFO] Press Ctrl+C or use Stop button to close Robot")
    while True:
        time.sleep(1)
    
except KeyboardInterrupt:
    print("[INFO] Closing Robot connection...")
    sys.exit(0)
except Exception as e:
    print(f"[ERROR] Failed to setup Robot: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(3)



