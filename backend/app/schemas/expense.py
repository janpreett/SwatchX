from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
from ..models.expense import CompanyEnum, ExpenseCategoryEnum

# Base schemas for management entities
class ServiceProviderBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class ServiceProviderCreate(ServiceProviderBase):
    pass

class ServiceProviderUpdate(ServiceProviderBase):
    pass

class ServiceProvider(ServiceProviderBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Truck schemas
class TruckBase(BaseModel):
    number: str = Field(..., min_length=1, max_length=50)

class TruckCreate(TruckBase):
    pass

class TruckUpdate(TruckBase):
    pass

class Truck(TruckBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Trailer schemas
class TrailerBase(BaseModel):
    number: str = Field(..., min_length=1, max_length=50)

class TrailerCreate(TrailerBase):
    pass

class TrailerUpdate(TrailerBase):
    pass

class Trailer(TrailerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Fuel Station schemas
class FuelStationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class FuelStationCreate(FuelStationBase):
    pass

class FuelStationUpdate(FuelStationBase):
    pass

class FuelStation(FuelStationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Expense schemas
class ExpenseBase(BaseModel):
    company: CompanyEnum
    category: ExpenseCategoryEnum
    date: datetime
    price: float = Field(..., gt=0)
    description: Optional[str] = Field(None, max_length=500)
    gallons: Optional[float] = Field(None, gt=0)
    service_provider_id: Optional[int] = None
    truck_id: Optional[int] = None
    trailer_id: Optional[int] = None
    fuel_station_id: Optional[int] = None
    attachment_path: Optional[str] = Field(None, max_length=500)

    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2)
    
    @validator('gallons')
    def gallons_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Gallons must be greater than 0')
        return round(v, 2) if v is not None else v

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    company: Optional[CompanyEnum] = None
    category: Optional[ExpenseCategoryEnum] = None
    date: Optional[datetime] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)
    gallons: Optional[float] = Field(None, gt=0)
    service_provider_id: Optional[int] = None
    truck_id: Optional[int] = None
    trailer_id: Optional[int] = None
    fuel_station_id: Optional[int] = None
    attachment_path: Optional[str] = Field(None, max_length=500)

    @validator('price')
    def price_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2) if v is not None else v
    
    @validator('gallons')
    def gallons_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Gallons must be greater than 0')
        return round(v, 2) if v is not None else v

class Expense(ExpenseBase):
    id: int
    serviceProvider: Optional[ServiceProvider] = None
    truck: Optional[Truck] = None
    trailer: Optional[Trailer] = None
    fuelStation: Optional[FuelStation] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
