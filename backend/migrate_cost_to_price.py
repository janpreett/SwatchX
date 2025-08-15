#!/usr/bin/env python3
"""
Migration script to rename 'cost' column to 'price' in the expenses table.
This ensures consistency between the database schema and the application code.
"""

import sqlite3
import os
from pathlib import Path

def migrate_cost_to_price():
    """Migrate the expenses table to rename cost column to price."""
    
    # Database path
    db_path = Path("data/swatchx.db")
    
    if not db_path.exists():
        print(f"Database file not found at {db_path}")
        return False
    
    # Create backup first
    backup_path = db_path.with_suffix('.db.backup')
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Created backup at {backup_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if cost column exists
        cursor.execute("PRAGMA table_info(expenses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'cost' not in columns:
            print("Cost column not found. Migration may have already been run.")
            if 'price' in columns:
                print("Price column already exists.")
                return True
            else:
                print("Neither cost nor price column found. Please check your database schema.")
                return False
        
        if 'price' in columns:
            print("Price column already exists alongside cost. Removing cost column.")
            # If both exist, just drop the cost column
            cursor.execute("ALTER TABLE expenses DROP COLUMN cost")
        else:
            # Rename cost to price
            cursor.execute("ALTER TABLE expenses RENAME COLUMN cost TO price")
            print("Successfully renamed 'cost' column to 'price'")
        
        conn.commit()
        conn.close()
        
        print("Migration completed successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        # Restore backup if something went wrong
        if backup_path.exists():
            shutil.copy2(backup_path, db_path)
            print("Restored from backup due to error")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Starting migration: cost -> price")
    success = migrate_cost_to_price()
    if success:
        print("Migration completed successfully!")
    else:
        print("Migration failed!")
        exit(1)
