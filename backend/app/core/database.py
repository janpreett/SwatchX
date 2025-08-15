"""
Database Configuration and Session Management

This module handles database connection setup, session creation, and provides
the SQLAlchemy Base class for all database models. It manages the SQLite database
connection and provides a session dependency for FastAPI endpoints.

Functions:
- get_db(): Dependency function that yields database sessions
- engine: SQLAlchemy engine instance for database connections
- SessionLocal: Session factory for creating database sessions
- Base: Declarative base class for all SQLAlchemy models
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

engine = create_engine(
    settings.database_url, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
