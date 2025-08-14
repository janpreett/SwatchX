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

@router.put("/business-units/{business_unit_id}", response_model=BusinessUnitSchema)
def update_business_unit(
    business_unit_id: int,
    business_unit: BusinessUnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_business_unit = db.query(BusinessUnit).filter(BusinessUnit.id == business_unit_id).first()
    if not db_business_unit:
        raise HTTPException(status_code=404, detail="Business unit not found")
    
    for key, value in business_unit.dict().items():
        setattr(db_business_unit, key, value)
    
    db.commit()
    db.refresh(db_business_unit)
    return db_business_unit

@router.delete("/business-units/{business_unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business_unit(
    business_unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    business_unit = db.query(BusinessUnit).filter(BusinessUnit.id == business_unit_id).first()
    if not business_unit:
        raise HTTPException(status_code=404, detail="Business unit not found")
    
    # Check if any expenses use this business unit
    expense_count = db.query(Expense).filter(Expense.business_unit_id == business_unit_id).count()
    if expense_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete business unit: {expense_count} expense(s) reference it")
    
    db.delete(business_unit)
    db.commit()

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

@router.put("/trucks/{truck_id}", response_model=TruckSchema)
def update_truck(
    truck_id: int,
    truck: TruckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    for key, value in truck.dict().items():
        setattr(db_truck, key, value)
    
    db.commit()
    db.refresh(db_truck)
    return db_truck

@router.delete("/trucks/{truck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_truck(
    truck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    # Check if any expenses use this truck
    expense_count = db.query(Expense).filter(Expense.truck_id == truck_id).count()
    if expense_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete truck: {expense_count} expense(s) reference it")
    
    db.delete(truck)
    db.commit()

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

@router.put("/trailers/{trailer_id}", response_model=TrailerSchema)
def update_trailer(
    trailer_id: int,
    trailer: TrailerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not db_trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    
    for key, value in trailer.dict().items():
        setattr(db_trailer, key, value)
    
    db.commit()
    db.refresh(db_trailer)
    return db_trailer

@router.delete("/trailers/{trailer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trailer(
    trailer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    
    # Check if any expenses use this trailer
    expense_count = db.query(Expense).filter(Expense.trailer_id == trailer_id).count()
    if expense_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete trailer: {expense_count} expense(s) reference it")
    
    db.delete(trailer)
    db.commit()

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

@router.put("/fuel-stations/{fuel_station_id}", response_model=FuelStationSchema)
def update_fuel_station(
    fuel_station_id: int,
    fuel_station: FuelStationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_fuel_station = db.query(FuelStation).filter(FuelStation.id == fuel_station_id).first()
    if not db_fuel_station:
        raise HTTPException(status_code=404, detail="Fuel station not found")
    
    for key, value in fuel_station.dict().items():
        setattr(db_fuel_station, key, value)
    
    db.commit()
    db.refresh(db_fuel_station)
    return db_fuel_station

@router.delete("/fuel-stations/{fuel_station_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_station(
    fuel_station_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    fuel_station = db.query(FuelStation).filter(FuelStation.id == fuel_station_id).first()
    if not fuel_station:
        raise HTTPException(status_code=404, detail="Fuel station not found")
    
    # Check if any expenses use this fuel station
    expense_count = db.query(Expense).filter(Expense.fuel_station_id == fuel_station_id).count()
    if expense_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete fuel station: {expense_count} expense(s) reference it")
    
    db.delete(fuel_station)
    db.commit()
