from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_active_user
from ..models.user import User
from ..models.expense import Expense, BusinessUnit, Truck, Trailer, FuelStation, CompanyEnum, ExpenseCategoryEnum
from ..schemas.expense import (
    ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema,
    BusinessUnitCreate, BusinessUnitUpdate, BusinessUnit as BusinessUnitSchema,
    TruckCreate, TruckUpdate, Truck as TruckSchema,
    TrailerCreate, TrailerUpdate, Trailer as TrailerSchema,
    FuelStationCreate, FuelStationUpdate, FuelStation as FuelStationSchema
)

router = APIRouter()

# Expense endpoints
@router.post("/expenses/", response_model=ExpenseSchema, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_expense = Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/expenses/", response_model=List[ExpenseSchema])
async def read_expenses(
    company: Optional[CompanyEnum] = None,
    category: Optional[ExpenseCategoryEnum] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Expense)
    if company:
        query = query.filter(Expense.company == company)
    if category:
        query = query.filter(Expense.category == category)
    
    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.get("/expenses/{expense_id}", response_model=ExpenseSchema)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/expenses/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    return

# Business Unit endpoints
@router.post("/business-units/", response_model=BusinessUnitSchema, status_code=status.HTTP_201_CREATED)
def create_business_unit(
    business_unit: BusinessUnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_business_unit = BusinessUnit(**business_unit.dict())
    db.add(db_business_unit)
    db.commit()
    db.refresh(db_business_unit)
    return db_business_unit

@router.get("/business-units/", response_model=List[BusinessUnitSchema])
async def read_business_units(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    business_units = db.query(BusinessUnit).offset(skip).limit(limit).all()
    return business_units

# Truck endpoints
@router.post("/trucks/", response_model=TruckSchema, status_code=status.HTTP_201_CREATED)
def create_truck(
    truck: TruckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_truck = Truck(**truck.dict())
    db.add(db_truck)
    db.commit()
    db.refresh(db_truck)
    return db_truck

@router.get("/trucks/", response_model=List[TruckSchema])
async def read_trucks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trucks = db.query(Truck).offset(skip).limit(limit).all()
    return trucks

# Trailer endpoints
@router.post("/trailers/", response_model=TrailerSchema, status_code=status.HTTP_201_CREATED)
def create_trailer(
    trailer: TrailerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_trailer = Trailer(**trailer.dict())
    db.add(db_trailer)
    db.commit()
    db.refresh(db_trailer)
    return db_trailer

@router.get("/trailers/", response_model=List[TrailerSchema])
async def read_trailers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trailers = db.query(Trailer).offset(skip).limit(limit).all()
    return trailers

# Fuel Station endpoints
@router.post("/fuel-stations/", response_model=FuelStationSchema, status_code=status.HTTP_201_CREATED)
def create_fuel_station(
    fuel_station: FuelStationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_fuel_station = FuelStation(**fuel_station.dict())
    db.add(db_fuel_station)
    db.commit()
    db.refresh(db_fuel_station)
    return db_fuel_station

@router.get("/fuel-stations/", response_model=List[FuelStationSchema])
async def read_fuel_stations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    fuel_stations = db.query(FuelStation).offset(skip).limit(limit).all()
    return fuel_stations
