"""
Migration script to add security questions columns to users table
"""
import sqlite3
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from sqlalchemy import text

def migrate_security_questions():
    """Add security questions columns to users table"""
    
    try:
        with engine.connect() as connection:
            # Check if columns already exist
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            security_columns = [
                'security_question_1',
                'security_answer_1_hash',
                'security_question_2', 
                'security_answer_2_hash',
                'security_question_3',
                'security_answer_3_hash'
            ]
            
            for column in security_columns:
                if column not in columns:
                    if 'question' in column:
                        connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} VARCHAR(500)"))
                    else:  # answer hash columns
                        connection.execute(text(f"ALTER TABLE users ADD COLUMN {column} VARCHAR(255)"))
                    print(f"Added column: {column}")
                else:
                    print(f"Column {column} already exists")
            
            connection.commit()
            print("Security questions migration completed successfully!")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    migrate_security_questions()
