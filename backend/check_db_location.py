#!/usr/bin/env python3
"""
SwatchX Database Location Checker
This script shows where your SwatchX database will be stored.
"""

import sys
import os
from pathlib import Path

def get_data_directory():
    """Get the appropriate directory for storing application data."""
    if getattr(sys, 'frozen', False):  # Running as exe (PyInstaller)
        # For exe: use %APPDATA%\SwatchX on Windows
        if os.name == 'nt':  # Windows
            data_dir = Path(os.getenv('APPDATA', '')) / 'SwatchX'
        else:  # Linux/Mac
            data_dir = Path.home() / '.swatchx'
        mode = "Production (EXE)"
    else:  # Development mode
        data_dir = Path('./data')
        mode = "Development"
    
    return data_dir, mode

if __name__ == "__main__":
    data_dir, mode = get_data_directory()
    db_path = data_dir / 'swatchx.db'
    
    print("=" * 50)
    print("SwatchX Database Location")
    print("=" * 50)
    print(f"Mode: {mode}")
    print(f"Database will be stored at:")
    print(f"  {db_path}")
    print()
    print(f"Data directory:")
    print(f"  {data_dir}")
    print()
    
    if data_dir.exists():
        print("✅ Data directory exists")
        if db_path.exists():
            print("✅ Database file exists")
            size = db_path.stat().st_size
            print(f"   Size: {size} bytes")
        else:
            print("📝 Database file will be created on first run")
    else:
        print("📝 Data directory will be created on first run")
    
    print("=" * 50)
