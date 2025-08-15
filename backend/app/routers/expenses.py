from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import json
import os

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
from ..utils.file_handler import file_handler

router = APIRouter()

def serialize_expense_with_relationships(expense: Expense) -> dict:
    """
    Serialize expense with relationships to camelCase format for frontend compatibility.
    Centralizes the mapping logic to avoid duplication.
    """
    return {
        "id": expense.id,
        "company": expense.company,
        "category": expense.category,
        "date": expense.date,
        "cost": expense.cost,
        "description": expense.description,
        "repair_description": expense.repair_description,
        "gallons": expense.gallons,
        "business_unit_id": expense.business_unit_id,
        "truck_id": expense.truck_id,
        "trailer_id": expense.trailer_id,
        "fuel_station_id": expense.fuel_station_id,
        "attachment_path": expense.attachment_path,
        "businessUnit": {
            "id": expense.business_unit.id, 
            "name": expense.business_unit.name
        } if expense.business_unit else None,
        "truck": {
            "id": expense.truck.id, 
            "number": expense.truck.number
        } if expense.truck else None,
        "trailer": {
            "id": expense.trailer.id, 
            "number": expense.trailer.number
        } if expense.trailer else None,
        "fuelStation": {
            "id": expense.fuel_station.id, 
            "name": expense.fuel_station.name
        } if expense.fuel_station else None,
        "created_at": expense.created_at,
        "updated_at": expense.updated_at
    }

def get_expense_with_relationships(db: Session, expense_id: int) -> Expense:
    """
    Get expense with all relationships loaded.
    Centralizes the query logic to avoid duplication.
    """
    return db.query(Expense).options(
        joinedload(Expense.business_unit),
        joinedload(Expense.truck),
        joinedload(Expense.trailer),
        joinedload(Expense.fuel_station)
    ).filter(Expense.id == expense_id).first()

def get_expenses_with_relationships(db: Session, company: Optional[CompanyEnum] = None, 
                                  category: Optional[ExpenseCategoryEnum] = None, 
                                  skip: int = 0, limit: int = 100) -> List[Expense]:
    """
    Get expenses with all relationships loaded and optional filtering.
    Centralizes the query logic to avoid duplication.
    """
    query = db.query(Expense).options(
        joinedload(Expense.business_unit),
        joinedload(Expense.truck),
        joinedload(Expense.trailer),
        joinedload(Expense.fuel_station)
    )
    
    if company:
        query = query.filter(Expense.company == company)
    if category:
        query = query.filter(Expense.category == category)
    
    return query.offset(skip).limit(limit).all()

def check_entity_usage_and_delete(db: Session, entity, entity_id: int, entity_name: str):
    """
    Check if management entity is referenced by expenses and delete if not.
    Centralizes the deletion logic with referential integrity checks.
    """
    expense_count = db.query(Expense).filter(getattr(Expense, f"{entity_name}_id") == entity_id).count()
    if expense_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete {entity_name}: {expense_count} expense(s) reference it"
        )
    
    db.delete(entity)
    db.commit()

# Expense endpoints
@router.post("/expenses/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new expense entry with optional file attachment."""
    try:
        # Parse JSON data from form
        expense_dict = json.loads(expense_data)
        expense = ExpenseCreate(**expense_dict)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid expense data: {str(e)}")
    
    # Handle file upload if provided
    attachment_path = None
    if attachment:
        attachment_path = await file_handler.save_file(attachment)
    
    # Create expense with attachment path
    expense_data_dict = expense.dict()
    expense_data_dict["attachment_path"] = attachment_path
    
    db_expense = Expense(**expense_data_dict)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Return with relationships
    expense_with_relationships = get_expense_with_relationships(db, db_expense.id)
    return serialize_expense_with_relationships(expense_with_relationships)

@router.get("/expenses/", response_model=List[dict])
async def read_expenses(
    company: Optional[CompanyEnum] = None,
    category: Optional[ExpenseCategoryEnum] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all expenses with optional filtering by company and category.
    Returns expenses with relationships serialized for frontend compatibility.
    """
    expenses = get_expenses_with_relationships(db, company, category, skip, limit)
    return [serialize_expense_with_relationships(expense) for expense in expenses]

@router.get("/expenses/{expense_id}", response_model=dict)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single expense by ID with all relationships."""
    expense = get_expense_with_relationships(db, expense_id)
    
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return serialize_expense_with_relationships(expense)

@router.put("/expenses/{expense_id}", response_model=dict)
async def update_expense(
    expense_id: int,
    expense_data: str = Form(...),
    attachment: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an expense by ID with optional file attachment."""
    db_expense = get_expense_with_relationships(db, expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    try:
        # Parse JSON data from form
        expense_dict = json.loads(expense_data)
        expense = ExpenseUpdate(**expense_dict)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid expense data: {str(e)}")
    
    # Handle file upload if provided
    if attachment:
        # Delete old attachment if it exists
        if db_expense.attachment_path:
            file_handler.delete_file(db_expense.attachment_path)
        
        # Save new attachment
        attachment_path = await file_handler.save_file(attachment)
        expense.attachment_path = attachment_path
    elif attachment is None and 'attachment_path' not in expense_dict:
        # If no file provided and no attachment_path in data, remove existing attachment
        if db_expense.attachment_path:
            file_handler.delete_file(db_expense.attachment_path)
            expense.attachment_path = None
    
    # Update expense
    update_data = expense.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return serialize_expense_with_relationships(db_expense)

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Delete associated file if it exists
    if expense.attachment_path:
        file_handler.delete_file(expense.attachment_path)
    
    db.delete(expense)
    db.commit()
    return

@router.get("/expenses/{expense_id}/attachment")
async def download_attachment(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download expense attachment file."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if not expense.attachment_path:
        raise HTTPException(status_code=404, detail="No attachment found for this expense")
    
    file_path = file_handler.get_absolute_path(expense.attachment_path)
    if not file_path or not file_path.exists():
        raise HTTPException(status_code=404, detail="Attachment file not found")
    
    # Get the original filename from the path
    filename = os.path.basename(expense.attachment_path)
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type='application/octet-stream'
    )

@router.delete("/expenses/{expense_id}/attachment", status_code=status.HTTP_204_NO_CONTENT)
async def remove_attachment(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove attachment from expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if not expense.attachment_path:
        raise HTTPException(status_code=404, detail="No attachment found for this expense")
    
    # Delete the file
    file_handler.delete_file(expense.attachment_path)
    
    # Remove path from database
    expense.attachment_path = None
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
    """Delete a business unit if not referenced by expenses."""
    business_unit = db.query(BusinessUnit).filter(BusinessUnit.id == business_unit_id).first()
    if not business_unit:
        raise HTTPException(status_code=404, detail="Business unit not found")
    
    check_entity_usage_and_delete(db, business_unit, business_unit_id, "business_unit")

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
    """Delete a truck if not referenced by expenses."""
    truck = db.query(Truck).filter(Truck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    check_entity_usage_and_delete(db, truck, truck_id, "truck")

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
    """Delete a trailer if not referenced by expenses."""
    trailer = db.query(Trailer).filter(Trailer.id == trailer_id).first()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    
    check_entity_usage_and_delete(db, trailer, trailer_id, "trailer")

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
    """Delete a fuel station if not referenced by expenses."""
    fuel_station = db.query(FuelStation).filter(FuelStation.id == fuel_station_id).first()
    if not fuel_station:
        raise HTTPException(status_code=404, detail="Fuel station not found")
    
    check_entity_usage_and_delete(db, fuel_station, fuel_station_id, "fuel_station")
