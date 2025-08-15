"""
Comprehensive unit tests for database models.

Tests the core functionality of SQLAlchemy models including:
- Model creation and validation
- Field constraints and relationships
- Model methods and properties
"""
import pytest
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.expense import Expense, BusinessUnit, Truck, Trailer, FuelStation
from app.core.security import get_password_hash, verify_password


class TestUserModel:
    """Test cases for User model."""

    def test_user_creation_success(self, db_session: Session):
        """Test successful user creation with required fields."""
        # Arrange
        email = "test@example.com"
        password = "securepassword123"
        hashed_password = get_password_hash(password)
        
        # Act
        user = User(
            email=email,
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        # Assert
        assert user.id is not None
        assert user.email == email
        assert user.hashed_password == hashed_password
        assert user.is_active is True  # Default value
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)

    def test_user_email_unique_constraint(self, db_session: Session):
        """Test that email field has unique constraint."""
        # Arrange
        email = "duplicate@example.com"
        user1 = User(email=email, hashed_password=get_password_hash("pass1"))
        user2 = User(email=email, hashed_password=get_password_hash("pass2"))
        
        # Act & Assert
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_email_not_null(self, db_session: Session):
        """Test that email field cannot be null."""
        # Arrange & Act & Assert
        user = User(hashed_password=get_password_hash("password"))
        db_session.add(user)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_password_hashing(self):
        """Test password hashing and verification."""
        # Arrange
        plain_password = "mySecretPassword123!"
        
        # Act
        hashed = get_password_hash(plain_password)
        
        # Assert
        assert hashed != plain_password
        assert verify_password(plain_password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False


class TestBusinessUnitModel:
    """Test cases for BusinessUnit model."""

    def test_business_unit_creation(self, db_session: Session):
        """Test successful business unit creation."""
        # Arrange
        name = "Test Business Unit"
        
        # Act
        business_unit = BusinessUnit(name=name)
        db_session.add(business_unit)
        db_session.commit()
        db_session.refresh(business_unit)
        
        # Assert
        assert business_unit.id is not None
        assert business_unit.name == name

    def test_business_unit_name_required(self, db_session: Session):
        """Test that business unit name is required."""
        # Arrange & Act & Assert
        business_unit = BusinessUnit()
        db_session.add(business_unit)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestTruckModel:
    """Test cases for Truck model."""

    def test_truck_creation(self, db_session: Session):
        """Test successful truck creation."""
        # Arrange
        number = "TRK-001"
        
        # Act
        truck = Truck(number=number)
        db_session.add(truck)
        db_session.commit()
        db_session.refresh(truck)
        
        # Assert
        assert truck.id is not None
        assert truck.number == number

    def test_truck_number_unique(self, db_session: Session):
        """Test that truck number must be unique."""
        # Arrange
        number = "TRK-DUPLICATE"
        truck1 = Truck(number=number)
        truck2 = Truck(number=number)
        
        # Act & Assert
        db_session.add(truck1)
        db_session.commit()
        
        db_session.add(truck2)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestTrailerModel:
    """Test cases for Trailer model."""

    def test_trailer_creation(self, db_session: Session):
        """Test successful trailer creation."""
        # Arrange
        number = "TRL-001"
        
        # Act
        trailer = Trailer(number=number)
        db_session.add(trailer)
        db_session.commit()
        db_session.refresh(trailer)
        
        # Assert
        assert trailer.id is not None
        assert trailer.number == number


class TestFuelStationModel:
    """Test cases for FuelStation model."""

    def test_fuel_station_creation(self, db_session: Session):
        """Test successful fuel station creation."""
        # Arrange
        name = "Shell Station Downtown"
        
        # Act
        fuel_station = FuelStation(name=name)
        db_session.add(fuel_station)
        db_session.commit()
        db_session.refresh(fuel_station)
        
        # Assert
        assert fuel_station.id is not None
        assert fuel_station.name == name


class TestExpenseModel:
    """Test cases for Expense model."""

    def test_expense_creation_with_relationships(self, db_session: Session):
        """Test expense creation with all related entities."""
        # Arrange - Create related entities first
        business_unit = BusinessUnit(name="Test BU")
        truck = Truck(number="TRK-001")
        trailer = Trailer(number="TRL-001")
        fuel_station = FuelStation(name="Test Station")
        
        db_session.add_all([business_unit, truck, trailer, fuel_station])
        db_session.commit()
        db_session.refresh(business_unit)
        db_session.refresh(truck)
        db_session.refresh(trailer)
        db_session.refresh(fuel_station)
        
        # Act - Create expense
        expense = Expense(
            date=date.today(),
            amount=Decimal("125.50"),
            description="Test fuel expense",
            category="fuel",
            company="swatchx",
            business_unit_id=business_unit.id,
            truck_id=truck.id,
            trailer_id=trailer.id,
            fuel_station_id=fuel_station.id,
            fuel_quantity=Decimal("45.5")
        )
        db_session.add(expense)
        db_session.commit()
        db_session.refresh(expense)
        
        # Assert
        assert expense.id is not None
        assert expense.date == date.today()
        assert expense.amount == Decimal("125.50")
        assert expense.category == "fuel"
        assert expense.company == "swatchx"
        assert expense.business_unit_id == business_unit.id
        assert expense.truck_id == truck.id
        assert expense.trailer_id == trailer.id
        assert expense.fuel_station_id == fuel_station.id
        assert expense.fuel_quantity == Decimal("45.5")
        assert expense.created_at is not None

    def test_expense_relationships_loading(self, db_session: Session):
        """Test that expense relationships can be loaded correctly."""
        # Arrange
        business_unit = BusinessUnit(name="Test BU")
        truck = Truck(number="TRK-001")
        trailer = Trailer(number="TRL-001")
        fuel_station = FuelStation(name="Test Station")
        
        db_session.add_all([business_unit, truck, trailer, fuel_station])
        db_session.commit()
        
        expense = Expense(
            date=date.today(),
            amount=Decimal("100.00"),
            description="Test expense",
            category="fuel",
            company="swatchx",
            business_unit_id=business_unit.id,
            truck_id=truck.id,
            trailer_id=trailer.id,
            fuel_station_id=fuel_station.id
        )
        db_session.add(expense)
        db_session.commit()
        
        # Act - Load expense with relationships
        loaded_expense = db_session.query(Expense).filter(Expense.id == expense.id).first()
        
        # Assert relationships can be accessed
        assert loaded_expense.business_unit.name == "Test BU"
        assert loaded_expense.truck.number == "TRK-001"
        assert loaded_expense.trailer.number == "TRL-001"
        assert loaded_expense.fuel_station.name == "Test Station"

    def test_expense_required_fields(self, db_session: Session):
        """Test that expense requires mandatory fields."""
        # Arrange & Act & Assert - Missing date
        expense1 = Expense(
            amount=Decimal("100.00"),
            description="Test",
            category="fuel",
            company="swatchx"
        )
        db_session.add(expense1)
        with pytest.raises(IntegrityError):
            db_session.commit()
        
        db_session.rollback()
        
        # Assert - Missing amount
        expense2 = Expense(
            date=date.today(),
            description="Test",
            category="fuel", 
            company="swatchx"
        )
        db_session.add(expense2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_expense_decimal_precision(self, db_session: Session):
        """Test that expense amounts handle decimal precision correctly."""
        # Arrange
        amount = Decimal("123.456")  # More precision than expected
        
        expense = Expense(
            date=date.today(),
            amount=amount,
            description="Precision test",
            category="fuel",
            company="swatchx"
        )
        
        # Act
        db_session.add(expense)
        db_session.commit()
        db_session.refresh(expense)
        
        # Assert - Should maintain precision
        assert expense.amount == amount

    def test_expense_optional_fields(self, db_session: Session):
        """Test expense creation with only required fields."""
        # Arrange
        expense = Expense(
            date=date.today(),
            amount=Decimal("50.00"),
            description="Basic expense",
            category="maintenance",
            company="swatchx"
        )
        
        # Act
        db_session.add(expense)
        db_session.commit()
        db_session.refresh(expense)
        
        # Assert
        assert expense.id is not None
        assert expense.business_unit_id is None
        assert expense.truck_id is None
        assert expense.trailer_id is None
        assert expense.fuel_station_id is None
        assert expense.fuel_quantity is None
        assert expense.attachment_path is None


class TestModelRelationships:
    """Test model relationships and cascading behavior."""

    def test_expense_business_unit_relationship(self, db_session: Session):
        """Test expense-business unit relationship works correctly."""
        # Arrange
        business_unit = BusinessUnit(name="Test BU")
        db_session.add(business_unit)
        db_session.commit()
        
        expense = Expense(
            date=date.today(),
            amount=Decimal("100.00"),
            description="Test",
            category="fuel",
            company="swatchx",
            business_unit_id=business_unit.id
        )
        db_session.add(expense)
        db_session.commit()
        
        # Act & Assert
        assert expense.business_unit.name == "Test BU"
        assert business_unit in [exp.business_unit for exp in db_session.query(Expense).all()]

    def test_foreign_key_constraint_violation(self, db_session: Session):
        """Test that invalid foreign key references are rejected."""
        # Arrange - Create expense with invalid business_unit_id
        expense = Expense(
            date=date.today(),
            amount=Decimal("100.00"),
            description="Test",
            category="fuel",
            company="swatchx",
            business_unit_id=999999  # Non-existent ID
        )
        
        # Act & Assert
        db_session.add(expense)
        with pytest.raises(IntegrityError):
            db_session.commit()
