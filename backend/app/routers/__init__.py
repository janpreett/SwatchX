"""
API Router Module

This module contains all FastAPI route definitions organized by functionality.
It provides the main API endpoints for authentication, expense management,
and other application features.

Routers:
- auth_router: User authentication, registration, and profile management
- expenses_router: Expense CRUD operations and management entities

All routers are included in the main FastAPI application and provide
RESTful API endpoints with proper validation and error handling.
"""

from .auth import router as auth_router
from .expenses import router as expenses_router

__all__ = ["auth_router", "expenses_router"]
