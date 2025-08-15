"""
Migration script to add attachment_path column to expenses table
"""
import sqlite3
import os
from pathlib import Path

def migrate_database():
    # Get the database path
    db_path = Path("data/swatchx.db")
    
    if not db_path.exists():
        print("Database file not found!")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if attachment_path column already exists
        cursor.execute("PRAGMA table_info(expenses)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'attachment_path' in columns:
            print("attachment_path column already exists!")
            return
        
        # Add the attachment_path column
        cursor.execute("ALTER TABLE expenses ADD COLUMN attachment_path TEXT")
        conn.commit()
        print("Successfully added attachment_path column to expenses table!")
        
    except sqlite3.Error as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
