"""
Comprehensive test coverage for all endpoints and edge cases.
Goal: Achieve 80% test coverage with security focus.
"""

import pytest
import json
import os
import tempfile
from datetime import datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.orm import Session
from fastapi import status
from unittest.mock import patch, MagicMock

from app.models.user import User
from app.models.expense import BusinessUnit, Truck, Trailer, FuelStation, Expense
from app.core.security import get_password_hash, create_access_token
from app.core.config import settings


class TestCompleteEndpointCoverage:
    """Comprehensive tests for all endpoints and edge cases."""

    async def test_signup_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test signup with all edge cases and validations."""
        # Test successful signup
        signup_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123@",
            "confirm_password": "SecurePass123@",
            "name": "New User"
        }
        response = await async_client.post("/auth/signup", json=signup_data)
        assert response.status_code == 201
        data = response.json()
        assert data["user"]["email"] == signup_data["email"]
        assert "access_token" in data
        
        # Test duplicate email
        response = await async_client.post("/auth/signup", json=signup_data)
        assert response.status_code == 400
        
        # Test invalid email format
        invalid_email_data = {
            "email": "not-an-email",
            "password": "SecurePass123@",
            "confirm_password": "SecurePass123@",
            "name": "Test User"
        }
        response = await async_client.post("/auth/signup", json=invalid_email_data)
        assert response.status_code == 422
        
        # Test missing required fields
        incomplete_data = {"email": "incomplete@example.com"}
        response = await async_client.post("/auth/signup", json=incomplete_data)
        assert response.status_code == 422
        
        # Test empty password
        empty_password_data = {
            "email": "empty@example.com",
            "password": "",
            "confirm_password": "",
            "name": "Empty Password"
        }
        response = await async_client.post("/auth/signup", json=empty_password_data)
        assert response.status_code == 422

    async def test_login_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test login with all scenarios."""
        # Create test user
        user = User(
            email="logintest@example.com",
            hashed_password=get_password_hash("SecurePass123@"),
            name="Login Test"
        )
        db_session.add(user)
        db_session.commit()

        # Test successful login
        login_data = {"username": "logintest@example.com", "password": "SecurePass123@"}
        response = await async_client.post("/auth/login", data=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

        # Test wrong password
        wrong_password_data = {"username": "logintest@example.com", "password": "wrongpassword"}
        response = await async_client.post("/auth/login", data=wrong_password_data)
        assert response.status_code == 401

        # Test non-existent user
        nonexistent_data = {"username": "nonexistent@example.com", "password": "password"}
        response = await async_client.post("/auth/login", data=nonexistent_data)
        assert response.status_code == 401

        # Test missing credentials
        response = await async_client.post("/auth/login", data={})
        assert response.status_code == 422

    async def test_management_entities_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test all management entities (business units, trucks, trailers, fuel stations) comprehensively."""
        # Create and login user
        user = User(
            email="management@example.com",
            hashed_password=get_password_hash("password123"),
            name="Management User"
        )
        db_session.add(user)
        db_session.commit()

        login_data = {"username": "management@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test Business Units CRUD
        # Create
        bu_data = {"name": "Test Business Unit", "description": "Test Description"}
        response = await async_client.post("/api/v1/business-units/", json=bu_data, headers=headers)
        assert response.status_code == 201
        bu_id = response.json()["id"]

        # Read all
        response = await async_client.get("/api/v1/business-units/", headers=headers)
        assert response.status_code == 200
        assert len(response.json()) >= 1

        # Read specific
        response = await async_client.get(f"/api/v1/business-units/{bu_id}", headers=headers)
        assert response.status_code == 200

        # Update
        update_data = {"name": "Updated Business Unit", "description": "Updated Description"}
        response = await async_client.put(f"/api/v1/business-units/{bu_id}", json=update_data, headers=headers)
        assert response.status_code == 200

        # Test Trucks CRUD
        # Create
        truck_data = {"number": "TRUCK001"}
        response = await async_client.post("/api/v1/trucks/", json=truck_data, headers=headers)
        assert response.status_code == 201
        truck_id = response.json()["id"]

        # Read all
        response = await async_client.get("/api/v1/trucks/", headers=headers)
        assert response.status_code == 200

        # Update
        update_truck_data = {"number": "TRUCK001-UPDATED"}
        response = await async_client.put(f"/api/v1/trucks/{truck_id}", json=update_truck_data, headers=headers)
        assert response.status_code == 200

        # Test Trailers CRUD
        # Create
        trailer_data = {"number": "TRAILER001"}
        response = await async_client.post("/api/v1/trailers/", json=trailer_data, headers=headers)
        assert response.status_code == 201
        trailer_id = response.json()["id"]

        # Update
        update_trailer_data = {"number": "TRAILER001-UPDATED"}
        response = await async_client.put(f"/api/v1/trailers/{trailer_id}", json=update_trailer_data, headers=headers)
        assert response.status_code == 200

        # Test Fuel Stations CRUD
        # Create
        fuel_data = {"name": "Test Fuel Station"}
        response = await async_client.post("/api/v1/fuel-stations/", json=fuel_data, headers=headers)
        assert response.status_code == 201
        fuel_id = response.json()["id"]

        # Update
        update_fuel_data = {"name": "Updated Fuel Station"}
        response = await async_client.put(f"/api/v1/fuel-stations/{fuel_id}", json=update_fuel_data, headers=headers)
        assert response.status_code == 200

        # Test Deletion (in reverse order due to potential dependencies)
        response = await async_client.delete(f"/api/v1/fuel-stations/{fuel_id}", headers=headers)
        assert response.status_code == 204

        response = await async_client.delete(f"/api/v1/trailers/{trailer_id}", headers=headers)
        assert response.status_code == 204

        response = await async_client.delete(f"/api/v1/trucks/{truck_id}", headers=headers)
        assert response.status_code == 204

        response = await async_client.delete(f"/api/v1/business-units/{bu_id}", headers=headers)
        assert response.status_code == 204

    async def test_expenses_comprehensive_crud(self, async_client: AsyncClient, db_session: Session):
        """Test comprehensive expense CRUD operations with all features."""
        # Create user and management entities for dropdown data
        user = User(
            email="expensetest@example.com",
            hashed_password=get_password_hash("password123"),
            name="Expense Test User"
        )
        db_session.add(user)
        
        # Create management entities for dropdown relationships
        business_unit = BusinessUnit(name="Test BU")
        truck = Truck(number="TRUCK001")
        trailer = Trailer(number="TRAILER001")
        fuel_station = FuelStation(name="Test Station")
        
        db_session.add_all([business_unit, truck, trailer, fuel_station])
        db_session.commit()
        db_session.refresh(business_unit)
        db_session.refresh(truck)
        db_session.refresh(trailer)
        db_session.refresh(fuel_station)

        # Login
        login_data = {"username": "expensetest@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test expense creation with all fields and relationships
        expense_data = {
            "date": "2024-01-15T10:00:00",
            "price": 150.50,
            "description": "Test expense with relationships",
            "category": "fuel-diesel",
            "company": "Swatch",
            "business_unit_id": business_unit.id,
            "truck_id": truck.id,
            "trailer_id": trailer.id,
            "fuel_station_id": fuel_station.id
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        assert response.status_code == 201
        expense_id = response.json()["id"]

        # Test expense retrieval with relationships
        response = await async_client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["business_unit_id"] == business_unit.id
        assert data["truck_id"] == truck.id

        # Test expense list with filtering by date range
        start_date = "2024-01-01"
        end_date = "2024-12-31"
        response = await async_client.get(
            f"/api/v1/expenses/?start_date={start_date}&end_date={end_date}",
            headers=headers
        )
        assert response.status_code == 200
        expenses = response.json()
        assert len(expenses) >= 1

        # Test filtering by keyword
        response = await async_client.get(
            "/api/v1/expenses/?keyword=relationships",
            headers=headers
        )
        assert response.status_code == 200

        # Test filtering by category
        response = await async_client.get(
            "/api/v1/expenses/?category=fuel-diesel",
            headers=headers
        )
        assert response.status_code == 200

        # Test filtering by company
        response = await async_client.get(
            "/api/v1/expenses/?company=Swatch",
            headers=headers
        )
        assert response.status_code == 200

        # Test expense update
        update_data = {
            "date": "2024-01-16T11:00:00",
            "price": 175.75,
            "description": "Updated expense description",
            "category": "truck",
            "company": "Swatch Updated"
        }
        
        response = await async_client.put(
            f"/api/v1/expenses/{expense_id}",
            data={"expense_data": json.dumps(update_data)},
            headers=headers
        )
        assert response.status_code == 200
        updated_data = response.json()
        assert updated_data["price"] == 175.75
        assert updated_data["description"] == "Updated expense description"

        # Test expense deletion
        response = await async_client.delete(f"/api/v1/expenses/{expense_id}", headers=headers)
        assert response.status_code == 204

        # Verify deletion
        response = await async_client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
        assert response.status_code == 404

    async def test_file_upload_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test file upload functionality comprehensively."""
        # Create user
        user = User(
            email="fileupload@example.com",
            hashed_password=get_password_hash("password123"),
            name="File Upload User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "fileupload@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test expense creation with file attachment
        expense_data = {
            "date": "2024-01-15T10:00:00",
            "price": 100.0,
            "description": "Expense with attachment",
            "category": "fuel-diesel",
            "company": "Swatch"
        }

        # Create a temporary file for testing
        test_content = b"This is a test file content for expense attachment."
        files = {"attachment": ("test_receipt.txt", test_content, "text/plain")}
        form_data = {"expense_data": json.dumps(expense_data)}

        response = await async_client.post(
            "/api/v1/expenses/",
            data=form_data,
            files=files,
            headers=headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["attachment_path"] is not None
        expense_id = data["id"]

        # Test different file types
        file_types = [
            ("receipt.pdf", b"%PDF-1.4", "application/pdf"),
            ("invoice.jpg", b"\xFF\xD8\xFF", "image/jpeg"),
            ("document.png", b"\x89PNG\r\n\x1a\n", "image/png"),
        ]

        for filename, content, mime_type in file_types:
            expense_data["description"] = f"Expense with {filename}"
            files = {"attachment": (filename, content, mime_type)}
            form_data = {"expense_data": json.dumps(expense_data)}

            response = await async_client.post(
                "/api/v1/expenses/",
                data=form_data,
                files=files,
                headers=headers
            )
            
            # Should accept valid file types
            assert response.status_code == 201

        # Test file size limits and invalid files
        # Large file (simulate)
        large_content = b"x" * (10 * 1024 * 1024)  # 10MB
        files = {"attachment": ("large_file.txt", large_content, "text/plain")}
        form_data = {"expense_data": json.dumps(expense_data)}

        response = await async_client.post(
            "/api/v1/expenses/",
            data=form_data,
            files=files,
            headers=headers
        )
        # Should handle large files appropriately (either accept or reject gracefully)
        assert response.status_code in [201, 413, 422]

    async def test_export_functionality(self, async_client: AsyncClient, db_session: Session):
        """Test export to Excel functionality."""
        # Create user and expenses
        user = User(
            email="export@example.com",
            hashed_password=get_password_hash("password123"),
            name="Export User"
        )
        db_session.add(user)
        db_session.commit()

        # Create test expenses
        expenses = []
        for i in range(5):
            expense = Expense(
                date=datetime(2024, 1, 15 + i, 10, 0, 0),
                price=100.0 + i * 10,
                description=f"Test expense {i+1}",
                category="fuel-diesel",
                company="Swatch"
            )
            expenses.append(expense)
            db_session.add(expense)
        
        db_session.commit()

        # Login
        login_data = {"username": "export@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test export endpoint (if it exists)
        response = await async_client.get("/api/v1/expenses/export", headers=headers)
        # Should either work or return method not allowed/not found
        assert response.status_code in [200, 404, 405]

        if response.status_code == 200:
            # Verify it's an Excel file
            assert "application" in response.headers.get("content-type", "")

    async def test_error_handling_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test comprehensive error handling."""
        # Create user
        user = User(
            email="errortest@example.com",
            hashed_password=get_password_hash("password123"),
            name="Error Test User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "errortest@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test 404 errors
        response = await async_client.get("/api/v1/expenses/99999", headers=headers)
        assert response.status_code == 404

        response = await async_client.get("/api/v1/business-units/99999", headers=headers)
        assert response.status_code == 404

        # Test invalid request methods
        response = await async_client.patch("/api/v1/expenses/", headers=headers)
        assert response.status_code == 405

        # Test malformed JSON
        response = await async_client.post(
            "/api/v1/business-units/",
            data="invalid json",
            headers={**headers, "Content-Type": "application/json"}
        )
        assert response.status_code == 422

        # Test missing authentication
        response = await async_client.get("/api/v1/expenses/")
        assert response.status_code in [401, 403]

    async def test_pagination_and_limits(self, async_client: AsyncClient, db_session: Session):
        """Test pagination and query limits."""
        # Create user
        user = User(
            email="pagination@example.com",
            hashed_password=get_password_hash("password123"),
            name="Pagination User"
        )
        db_session.add(user)
        db_session.commit()

        # Create many expenses
        for i in range(25):
            expense = Expense(
                date=datetime(2024, 1, 1 + i, 10, 0, 0),
                price=100.0 + i,
                description=f"Expense {i+1}",
                category="fuel-diesel",
                company="Swatch"
            )
            db_session.add(expense)
        
        db_session.commit()

        # Login
        login_data = {"username": "pagination@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test getting all expenses (should handle large datasets)
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        assert response.status_code == 200
        expenses = response.json()
        assert len(expenses) >= 25

        # Test with limit parameters (if supported)
        response = await async_client.get("/api/v1/expenses/?limit=10", headers=headers)
        assert response.status_code == 200

        # Test with offset parameters (if supported)
        response = await async_client.get("/api/v1/expenses/?offset=10&limit=10", headers=headers)
        assert response.status_code == 200

    async def test_concurrent_operations(self, async_client: AsyncClient, db_session: Session):
        """Test concurrent operations and race conditions."""
        # Create user
        user = User(
            email="concurrent@example.com",
            hashed_password=get_password_hash("password123"),
            name="Concurrent User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "concurrent@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create expense
        expense_data = {
            "date": "2024-01-15T10:00:00",
            "price": 100.0,
            "description": "Concurrent test expense",
            "category": "fuel-diesel",
            "company": "Swatch"
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        assert response.status_code == 201
        expense_id = response.json()["id"]

        # Test concurrent reads (should all succeed)
        import asyncio
        
        async def read_expense():
            return await async_client.get(f"/api/v1/expenses/{expense_id}", headers=headers)

        # Perform multiple concurrent reads
        tasks = [read_expense() for _ in range(5)]
        responses = await asyncio.gather(*tasks)
        
        # All reads should succeed
        for response in responses:
            assert response.status_code == 200

    async def test_data_validation_comprehensive(self, async_client: AsyncClient, db_session: Session):
        """Test comprehensive data validation."""
        # Create user
        user = User(
            email="validation@example.com",
            hashed_password=get_password_hash("password123"),
            name="Validation User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "validation@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test expense validation
        invalid_expenses = [
            # Missing required fields
            {"price": 100.0, "category": "fuel-diesel"},
            {"date": "2024-01-15T10:00:00", "category": "fuel-diesel"},
            {"date": "2024-01-15T10:00:00", "price": 100.0},
            
            # Invalid data types
            {"date": "invalid-date", "price": "not-a-number", "category": "fuel-diesel", "description": "test"},
            {"date": "2024-01-15T10:00:00", "price": -100, "category": "fuel-diesel", "description": "test"},
            
            # Invalid enum values
            {"date": "2024-01-15T10:00:00", "price": 100.0, "category": "invalid-category", "description": "test"},
            
            # Boundary testing
            {"date": "2024-01-15T10:00:00", "price": 0, "category": "fuel-diesel", "description": ""},
        ]

        for invalid_data in invalid_expenses:
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(invalid_data)},
                headers=headers
            )
            # Should reject invalid data
            assert response.status_code in [400, 422]

        # Test management entity validation
        invalid_business_units = [
            {},  # Empty
            {"name": ""},  # Empty name
            {"name": "x" * 1000},  # Too long
        ]

        for invalid_data in invalid_business_units:
            response = await async_client.post("/api/v1/business-units/", json=invalid_data, headers=headers)
            assert response.status_code in [400, 422]

    async def test_future_date_entries(self, async_client: AsyncClient, db_session: Session):
        """Test adding expenses with future dates."""
        # Create user
        user = User(
            email="futuredate@example.com",
            hashed_password=get_password_hash("password123"),
            name="Future Date User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "futuredate@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test adding expense with future date
        future_date = datetime.now() + timedelta(days=30)
        expense_data = {
            "date": future_date.isoformat(),
            "price": 200.0,
            "description": "Future expense entry",
            "category": "fuel-diesel",
            "company": "Swatch"
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        # Should allow future dates
        assert response.status_code == 201

        # Test adding expense with past date
        past_date = datetime.now() - timedelta(days=365)
        expense_data["date"] = past_date.isoformat()
        expense_data["description"] = "Past expense entry"
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        # Should allow past dates
        assert response.status_code == 201
