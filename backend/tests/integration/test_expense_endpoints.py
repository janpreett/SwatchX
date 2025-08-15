"""
Comprehensive integration tests for expense CRUD endpoints.

Tests the full expense lifecycle including:
- Creating expenses with various data combinations
- Reading expenses with filtering and pagination
- Updating expenses with and without file attachments
- Deleting expenses and cleanup
- File attachment handling
- Error scenarios and validation
"""
import pytest
import json
import io
from datetime import date
from decimal import Decimal
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session

from app.models.expense import Expense, BusinessUnit, Truck, Trailer, FuelStation
from app.models.user import User
from app.core.security import get_password_hash


@pytest.mark.integration
class TestExpenseCRUDEndpoints:
    """Test cases for expense CRUD operations."""

    async def test_create_expense_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful expense creation with all fields."""
        # Arrange - Create user and authentication
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        assert login_response.status_code == status.HTTP_200_OK
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create related entities
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

        # Prepare expense data
        expense_data = {
            "date": "2024-01-15T10:30:00",
            "price": 125.50,
            "description": "Test fuel expense",
            "category": "fuel-diesel",
            "company": "Swatch",
            "business_unit_id": business_unit.id,
            "truck_id": truck.id,
            "trailer_id": trailer.id,
            "fuel_station_id": fuel_station.id,
            "gallons": 45.5
        }
        
        # Act - Create expense
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        
        # Assert
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        print(f"Response data keys: {data.keys()}")
        
        assert data["price"] == 125.50
        assert data["description"] == "Test fuel expense"
        assert data["category"] == "fuel-diesel"
        assert data["company"] == "Swatch"
        assert data["gallons"] == 45.5        # Verify relationships are included
        assert data["businessUnit"]["name"] == "Test BU"
        assert data["truck"]["number"] == "TRK-001"
        assert data["trailer"]["number"] == "TRL-001"
        assert data["fuelStation"]["name"] == "Test Station"
        
        # Verify in database
        db_expense = db_session.query(Expense).filter(Expense.id == data["id"]).first()
        assert db_expense is not None
        assert db_expense.price== Decimal("125.50")

    async def test_create_expense_with_file_attachment(self, async_client: AsyncClient, db_session: Session):
        """Test expense creation with file attachment."""
        # Arrange - Create user and login
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        expense_data = {
            "date": "2024-01-15",
            "amount": 85.25,
            "description": "Fuel with receipt",
            "category": "fuel",
            "company": "Swatch"
        }
        
        # Create fake file
        fake_file_content = b"fake pdf content"
        files = {
            "attachment": ("receipt.pdf", io.BytesIO(fake_file_content), "application/pdf")
        }
        
        # Act
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            files=files,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert "attachment_path" in data
        assert data["attachment_path"] is not None
        
        # Verify in database
        db_expense = db_session.query(Expense).filter(Expense.id == data["id"]).first()
        assert db_expense.attachment_path is not None

    async def test_read_expenses_with_filtering(self, async_client: AsyncClient, db_session: Session):
        """Test reading expenses with company and category filters."""
        # Arrange - Create user and login
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create test expenses
        expenses = [
            Expense(
                date=date.today(),
                price=Decimal("100.00"),
                description="SwatchX Fuel",
                category="fuel",
                company="Swatch"
            ),
            Expense(
                date=date.today(),
                price=Decimal("200.00"),
                description="SwatchX Maintenance",
                category="truck",
                company="Swatch"
            ),
            Expense(
                date=date.today(),
                price=Decimal("150.00"),
                description="Timmins Fuel",
                category="fuel",
                company="timmins"
            )
        ]
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Act & Assert - Test company filter
        response = await async_client.get(
            "/api/v1/expenses/?company=swatchx",
            headers=headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(expense["company"] == "Swatch" for expense in data)
        
        # Act & Assert - Test category filter
        response = await async_client.get(
            "/api/v1/expenses/?category=fuel",
            headers=headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 2
        assert all(expense["category"] == "fuel" for expense in data)
        
        # Act & Assert - Test combined filters
        response = await async_client.get(
            "/api/v1/expenses/?company=swatchx&category=fuel",
            headers=headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["company"] == "Swatch"
        assert data[0]["category"] == "fuel"

    async def test_read_single_expense_success(self, async_client: AsyncClient, db_session: Session):
        """Test reading a single expense by ID."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create business unit for relationship test
        business_unit = BusinessUnit(name="Test BU")
        db_session.add(business_unit)
        db_session.commit()
        
        expense = Expense(
            date=date.today(),
            price=Decimal("175.25"),
            description="Single expense test",
            category="truck",
            company="Swatch",
            business_unit_id=business_unit.id
        )
        db_session.add(expense)
        db_session.commit()
        db_session.refresh(expense)
        
        # Act
        response = await async_client.get(
            f"/api/v1/expenses/{expense.id}",
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["id"] == expense.id
        assert data["price"] == 175.25
        assert data["description"] == "Single expense test"
        assert data["category"] == "truck"
        assert data["business_unit"]["name"] == "Test BU"

    async def test_update_expense_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful expense update."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create expense
        expense = Expense(
            date=date.today(),
            price=Decimal("100.00"),
            description="Original description",
            category="fuel",
            company="Swatch"
        )
        db_session.add(expense)
        db_session.commit()
        db_session.refresh(expense)
        
        # Prepare update data
        update_data = {
            "amount": 150.75,
            "description": "Updated description",
            "category": "truck"
        }
        
        # Act
        response = await async_client.put(
            f"/api/v1/expenses/{expense.id}",
            data={"expense_data": json.dumps(update_data)},
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["price"] == 150.75
        assert data["description"] == "Updated description"
        assert data["category"] == "truck"
        assert data["company"] == "Swatch"  # Unchanged
        
        # Verify in database
        db_session.refresh(expense)
        assert expense.price== Decimal("150.75")
        assert expense.description == "Updated description"
        assert expense.category == "truck"

    async def test_delete_expense_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful expense deletion."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create expense
        expense = Expense(
            date=date.today(),
            price=Decimal("99.99"),
            description="To be deleted",
            category="fuel",
            company="Swatch"
        )
        db_session.add(expense)
        db_session.commit()
        expense_id = expense.id
        
        # Act
        response = await async_client.delete(
            f"/api/v1/expenses/{expense_id}",
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify expense is deleted from database
        deleted_expense = db_session.query(Expense).filter(Expense.id == expense_id).first()
        assert deleted_expense is None

    async def test_expense_not_found(self, async_client: AsyncClient, db_session: Session):
        """Test handling of non-existent expense."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        non_existent_id = 999999
        
        # Act & Assert - GET
        response = await async_client.get(
            f"/api/v1/expenses/{non_existent_id}",
            headers=headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Act & Assert - PUT
        response = await async_client.put(
            f"/api/v1/expenses/{non_existent_id}",
            data={"expense_data": json.dumps({"amount": 100.0})},
            headers=headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Act & Assert - DELETE
        response = await async_client.delete(
            f"/api/v1/expenses/{non_existent_id}",
            headers=headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_create_expense_invalid_data(self, async_client: AsyncClient, db_session: Session):
        """Test expense creation with invalid data."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test missing required fields
        invalid_data_sets = [
            {},  # Empty data
            {"date": "2024-01-15"},  # Missing amount
            {"amount": 100.0},  # Missing date
            {"date": "2024-01-15", "amount": "invalid"},  # Invalid amount type
            {"date": "invalid-date", "amount": 100.0},  # Invalid date format
        ]
        
        for invalid_data in invalid_data_sets:
            # Act
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(invalid_data)},
                headers=headers
            )
            
            # Assert
            assert response.status_code in [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ]

    async def test_expense_pagination(self, async_client: AsyncClient, db_session: Session):
        """Test expense list pagination."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create multiple expenses
        expenses = []
        for i in range(25):  # Create 25 expenses
            expense = Expense(
                date=date.today(),
                price=Decimal(f"{10 + i}.00"),
                description=f"Test expense {i}",
                category="fuel",
                company="Swatch"
            )
            expenses.append(expense)
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Act & Assert - Test default pagination
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 100  # Default limit
        
        # Act & Assert - Test custom pagination
        response = await async_client.get("/api/v1/expenses/?skip=10&limit=5", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5

    async def test_unauthorized_access(self, async_client: AsyncClient):
        """Test that expense endpoints require authentication."""
        # Act & Assert - GET without auth
        response = await async_client.get("/api/v1/expenses/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Act & Assert - POST without auth
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps({"amount": 100, "date": "2024-01-15"})}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Act & Assert - PUT without auth
        response = await async_client.put(
            "/api/v1/expenses/1",
            data={"expense_data": json.dumps({"amount": 100})}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Act & Assert - DELETE without auth
        response = await async_client.delete("/api/v1/expenses/1")
        assert response.status_code == status.HTTP_403_FORBIDDEN
