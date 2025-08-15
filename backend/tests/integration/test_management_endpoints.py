"""
Comprehensive integration tests for management CRUD endpoints.

Tests CRUD operations for:
- Business Units
- Trucks
- Trailers 
- Fuel Stations

Includes testing referential integrity constraints and bulk operations.
"""
import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session

from app.models.expense import BusinessUnit, Truck, Trailer, FuelStation, Expense
from app.models.user import User
from app.core.security import get_password_hash
from datetime import date
from decimal import Decimal


@pytest.mark.integration
class TestBusinessUnitEndpoints:
    """Test cases for Business Unit CRUD operations."""

    async def test_create_business_unit_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful business unit creation."""
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

        business_unit_data = {"name": "New Business Unit"}
        
        # Act
        response = await async_client.post(
            "/api/v1/business-units/",
            json=business_unit_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Business Unit"
        assert "id" in data
        
        # Verify in database
        db_bu = db_session.query(BusinessUnit).filter(BusinessUnit.id == data["id"]).first()
        assert db_bu is not None
        assert db_bu.name == "New Business Unit"

    async def test_read_business_units(self, async_client: AsyncClient, db_session: Session):
        """Test reading business units list."""
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

        # Create test business units
        bus = [
            BusinessUnit(name="BU One"),
            BusinessUnit(name="BU Two"),
            BusinessUnit(name="BU Three")
        ]
        db_session.add_all(bus)
        db_session.commit()
        
        # Act
        response = await async_client.get("/api/v1/business-units/", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 3
        
        names = [bu["name"] for bu in data]
        assert "BU One" in names
        assert "BU Two" in names
        assert "BU Three" in names

    async def test_update_business_unit_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful business unit update."""
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

        # Create business unit
        bu = BusinessUnit(name="Original Name")
        db_session.add(bu)
        db_session.commit()
        db_session.refresh(bu)
        
        update_data = {"name": "Updated Name"}
        
        # Act
        response = await async_client.put(
            f"/api/v1/business-units/{bu.id}",
            json=update_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Name"
        
        # Verify in database
        db_session.refresh(bu)
        assert bu.name == "Updated Name"

    async def test_delete_business_unit_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful business unit deletion when not referenced."""
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

        # Create business unit
        bu = BusinessUnit(name="To Be Deleted")
        db_session.add(bu)
        db_session.commit()
        bu_id = bu.id
        
        # Act
        response = await async_client.delete(f"/api/v1/business-units/{bu_id}", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify deleted from database
        deleted_bu = db_session.query(BusinessUnit).filter(BusinessUnit.id == bu_id).first()
        assert deleted_bu is None

    async def test_delete_business_unit_with_expenses_fails(self, async_client: AsyncClient, db_session: Session):
        """Test that business unit deletion fails when referenced by expenses."""
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

        # Create business unit with expense
        bu = BusinessUnit(name="Referenced BU")
        db_session.add(bu)
        db_session.commit()
        db_session.refresh(bu)
        
        expense = Expense(
            date=date.today(),
            price=Decimal("100.00"),
            description="Test expense",
            category="fuel",
            company="Swatch",
            business_unit_id=bu.id
        )
        db_session.add(expense)
        db_session.commit()
        
        # Act
        response = await async_client.delete(f"/api/v1/business-units/{bu.id}", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "expense(s) reference it" in data["detail"]


@pytest.mark.integration
class TestTruckEndpoints:
    """Test cases for Truck CRUD operations."""

    async def test_create_truck_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful truck creation."""
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

        truck_data = {"number": "TRK-NEW-001"}
        
        # Act
        response = await async_client.post(
            "/api/v1/trucks/",
            json=truck_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["number"] == "TRK-NEW-001"
        assert "id" in data

    async def test_truck_number_uniqueness(self, async_client: AsyncClient, db_session: Session):
        """Test that truck numbers must be unique."""
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

        # Create first truck
        truck1 = Truck(number="DUPLICATE-001")
        db_session.add(truck1)
        db_session.commit()
        
        truck_data = {"number": "DUPLICATE-001"}
        
        # Act - Try to create truck with same number
        response = await async_client.post(
            "/api/v1/trucks/",
            json=truck_data,
            headers=headers
        )
        
        # Assert - Should fail due to uniqueness constraint
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR or response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.integration
class TestTrailerEndpoints:
    """Test cases for Trailer CRUD operations."""

    async def test_create_trailer_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful trailer creation."""
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

        trailer_data = {"number": "TRL-NEW-001"}
        
        # Act
        response = await async_client.post(
            "/api/v1/trailers/",
            json=trailer_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["number"] == "TRL-NEW-001"
        assert "id" in data

    async def test_read_trailers_pagination(self, async_client: AsyncClient, db_session: Session):
        """Test reading trailers with pagination."""
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

        # Create multiple trailers
        trailers = [Trailer(number=f"TRL-{i:03d}") for i in range(15)]
        db_session.add_all(trailers)
        db_session.commit()
        
        # Act - Test pagination
        response = await async_client.get("/api/v1/trailers/?skip=5&limit=5", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5


@pytest.mark.integration
class TestFuelStationEndpoints:
    """Test cases for Fuel Station CRUD operations."""

    async def test_create_fuel_station_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful fuel station creation."""
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

        fuel_station_data = {"name": "New Shell Station"}
        
        # Act
        response = await async_client.post(
            "/api/v1/fuel-stations/",
            json=fuel_station_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Shell Station"
        assert "id" in data

    async def test_update_fuel_station_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful fuel station update."""
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

        # Create fuel station
        fuel_station = FuelStation(name="Old Station Name")
        db_session.add(fuel_station)
        db_session.commit()
        db_session.refresh(fuel_station)
        
        update_data = {"name": "Updated Station Name"}
        
        # Act
        response = await async_client.put(
            f"/api/v1/fuel-stations/{fuel_station.id}",
            json=update_data,
            headers=headers
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Station Name"


@pytest.mark.integration
class TestManagementEndpointsValidation:
    """Test validation and error handling for management endpoints."""

    async def test_create_with_missing_fields(self, async_client: AsyncClient, db_session: Session):
        """Test creation with missing required fields."""
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

        # Test missing name for business unit
        response = await async_client.post(
            "/api/v1/business-units/",
            json={},
            headers=headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Test missing number for truck
        response = await async_client.post(
            "/api/v1/trucks/",
            json={},
            headers=headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_update_nonexistent_entity(self, async_client: AsyncClient, db_session: Session):
        """Test updating non-existent entities."""
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

        nonexistent_id = 999999
        
        # Test all entity types
        entities = [
            ("/api/v1/business-units/", {"name": "Updated Name"}),
            ("/api/v1/trucks/", {"number": "Updated Number"}),
            ("/api/v1/trailers/", {"number": "Updated Number"}),
            ("/api/v1/fuel-stations/", {"name": "Updated Name"}),
        ]
        
        for endpoint, data in entities:
            response = await async_client.put(
                f"{endpoint}{nonexistent_id}",
                json=data,
                headers=headers
            )
            assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_unauthorized_access_management_endpoints(self, async_client: AsyncClient):
        """Test that management endpoints require authentication."""
        endpoints = [
            "GET /api/v1/business-units/",
            "POST /api/v1/business-units/",
            "PUT /api/v1/business-units/1",
            "DELETE /api/v1/business-units/1",
            "GET /api/v1/trucks/",
            "POST /api/v1/trucks/",
            "PUT /api/v1/trucks/1",
            "DELETE /api/v1/trucks/1",
        ]
        
        test_data = {"name": "Test", "number": "TEST"}
        
        for endpoint in endpoints:
            method, url = endpoint.split(" ")
            
            if method == "GET":
                response = await async_client.get(url)
            elif method == "POST":
                response = await async_client.post(url, json=test_data)
            elif method == "PUT":
                response = await async_client.put(url, json=test_data)
            elif method == "DELETE":
                response = await async_client.delete(url)
            
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
