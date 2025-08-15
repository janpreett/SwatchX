"""
Data Validation Schemas Module

This module contains Pydantic schemas for request/response validation and
data serialization. These schemas ensure data integrity and provide
type safety for the API endpoints.

Schemas:
- User schemas: Registration, login, profile management
- Expense schemas: Expense creation, updates, and responses
- Management schemas: Service providers, trucks, trailers, fuel stations
- Token schemas: Authentication token handling

All schemas include validation rules and are used for API input/output
validation, ensuring data consistency and security.
"""

from .user import UserCreate, UserLogin, UserResponse, Token, TokenData
from .expense import (
    ServiceProvider, ServiceProviderCreate, ServiceProviderUpdate,
    Truck, TruckCreate, TruckUpdate,
    Trailer, TrailerCreate, TrailerUpdate,
    FuelStation, FuelStationCreate, FuelStationUpdate,
    Expense, ExpenseCreate, ExpenseUpdate
)

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "Token", "TokenData",
    "ServiceProvider", "ServiceProviderCreate", "ServiceProviderUpdate",
    "Truck", "TruckCreate", "TruckUpdate", 
    "Trailer", "TrailerCreate", "TrailerUpdate",
    "FuelStation", "FuelStationCreate", "FuelStationUpdate",
    "Expense", "ExpenseCreate", "ExpenseUpdate"
]
