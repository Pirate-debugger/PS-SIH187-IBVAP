#!/usr/bin/env python3
"""
IBVAP 2.0 - Intelligent Border Video Analytics Platform
Launcher script for Ministry of Home Affairs / SSB (Sashastra Seema Bal)
"""

import sys
import os

# Ensure UTF-8 output encoding on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import uvicorn
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.config import HOST, PORT, SYSTEM_NAME, SYSTEM_LONG_NAME, AGENCY

def main():
    print("=" * 75)
    print(f"  [STARTING] {SYSTEM_NAME} - {SYSTEM_LONG_NAME}")
    print(f"  [AGENCY]   {AGENCY}")
    print(f"  [URL]      http://localhost:{PORT}")
    print(f"  [DOCS]     http://localhost:{PORT}/docs")
    print(f"  [STATUS]   BOP-CAM-01 to BOP-CAM-06 Active")
    print("=" * 75)

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False, app_dir=str(backend_dir))

if __name__ == "__main__":
    main()
