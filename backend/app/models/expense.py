"""
Expense and Management Entity Models

This module contains all database models related to expense tracking and
fleet management. It includes the main Expense model and supporting
entities for business operations.

Models:
- Expense: Main expense tracking with categories and relationships
- ServiceProvider: Service provider management
- Truck: Truck fleet tracking
- Trailer: Trailer fleet tracking
- FuelStation: Fuel station information
- Enums: Company and expense category definitions

The Expense model supports various expense types including fuel, repairs,
parts, and other operational costs with optional file attachments.
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum
from ..core.database import Base

class CompanyEnum(str, Enum):
    SWATCH = "Swatch"
    SWS = "SWS"

class ExpenseCategoryEnum(str, Enum):
    TRUCK = "truck"
    TRAILER = "trailer"
    DMV = "dmv"
    PARTS = "parts"
    PHONE_TRACKER = "phone-tracker"
    OTHER_EXPENSES = "other-expenses"
    TOLL = "toll"
    OFFICE_SUPPLIES = "office-supplies"
    FUEL_DIESEL = "fuel-diesel"
    DEF = "def"

# Management entities
class ServiceProvider(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Truck(Base):
    __tablename__ = "trucks"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Trailer(Base):
    __tablename__ = "trailers"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FuelStation(Base):
    __tablename__ = "fuel_stations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Main expense model
class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(SQLEnum(CompanyEnum), nullable=False)
    category = Column(SQLEnum(ExpenseCategoryEnum), nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)
    
    # Optional fields based on category
    description = Column(String(500), nullable=True)
    gallons = Column(Float, nullable=True)
    
    # Foreign key relationships
    service_provider_id = Column(Integer, ForeignKey("service_providers.id"), nullable=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=True)
    trailer_id = Column(Integer, ForeignKey("trailers.id"), nullable=True)
    fuel_station_id = Column(Integer, ForeignKey("fuel_stations.id"), nullable=True)
    
    # File attachment
    attachment_path = Column(String(500), nullable=True)
    
    # Relationships
    service_provider = relationship("ServiceProvider")
    truck = relationship("Truck")
    trailer = relationship("Trailer")
    fuel_station = relationship("FuelStation")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
