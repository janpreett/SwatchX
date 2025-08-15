#!/usr/bin/env python3
"""
Migration script to add name column to users table
"""

import sqlite3
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def migrate_database():
    """Add name column to users table"""
    db_path = backend_dir / "data" / "swatchx.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if name column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'name' in columns:
            print("✅ Name column already exists in users table")
            conn.close()
            return True
        
        # Add the name column
        print("🔄 Adding name column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(100)")
        
        # Commit the changes
        conn.commit()
        print("✅ Successfully added name column to users table")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'name' in columns:
            print("✅ Migration completed successfully")
            success = True
        else:
            print("❌ Migration failed - name column not found after addition")
            success = False
            
        conn.close()
        return success
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Starting user name column migration...")
    success = migrate_database()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("The users table now includes:")
        print("- name (VARCHAR(100), nullable)")
    else:
        print("\n💥 Migration failed!")
        sys.exit(1)
