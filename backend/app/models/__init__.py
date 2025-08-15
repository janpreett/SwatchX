"""
Database Models Module

This module contains all SQLAlchemy database models for the SwatchX application.
It defines the database schema and relationships between different entities.

Models:
- User: User authentication and profile information
- Expense: Main expense tracking with various categories
- ServiceProvider: Service provider management entities
- Truck: Truck fleet management
- Trailer: Trailer fleet management  
- FuelStation: Fuel station information
- Enums: Company and expense category enumerations

All models inherit from SQLAlchemy Base and include automatic timestamp management.
"""

from .user import User
from .expense import Expense, ServiceProvider, Truck, Trailer, FuelStation, CompanyEnum, ExpenseCategoryEnum

__all__ = ["User", "Expense", "ServiceProvider", "Truck", "Trailer", "FuelStation", "CompanyEnum", "ExpenseCategoryEnum"]
