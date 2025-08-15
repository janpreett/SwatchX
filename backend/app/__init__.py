"""
SwatchX Backend Application Package

This is the main package for the SwatchX backend application. It provides
easy access to all major components including the FastAPI app instance,
database utilities, security functions, models, and schemas.

Package Structure:
- core/: Configuration, database, and security utilities
- models/: SQLAlchemy database models
- schemas/: Pydantic validation schemas
- routers/: API endpoint definitions
- utils/: Helper utility functions

Usage:
    from app import app, User, Expense, get_current_user
    from app.core import settings, engine
"""

# Import main FastAPI app instance
from .main import app

# Import core components for easy access
from .core.database import engine, Base, get_db
from .core.config import settings
from .core.security import create_access_token, verify_password, get_password_hash, get_current_user

# Import models for database operations
from .models.user import User
from .models.expense import Expense

# Import schemas for API validation
from .schemas.user import UserCreate, UserLogin, UserResponse
from .schemas.expense import ExpenseCreate, ExpenseUpdate, Expense

# Package version
__version__ = "1.0.0"

# Make key components available at package level
__all__ = [
    "app",
    "engine", 
    "Base",
    "get_db",
    "settings",
    "create_access_token",
    "verify_password", 
    "get_password_hash",
    "get_current_user",
    "User",
    "Expense",
    "UserCreate",
    "UserLogin", 
    "UserResponse",
    "ExpenseCreate",
    "ExpenseUpdate",
    "Expense"
]
