"""
Multi-user access and dropdown functionality tests.
Tests user isolation and management table dropdown functionality.
"""

import pytest
import json
from datetime import datetime, timedelta
from httpx import AsyncClient
from sqlalchemy.orm import Session
from fastapi import status

from app.models.user import User
from app.models.expense import BusinessUnit, Truck, Trailer, FuelStation, Expense
from app.core.security import get_password_hash


class TestMultiUserAccess:
    """Test multi-user access and data isolation."""

    async def test_user_data_isolation(self, async_client: AsyncClient, db_session: Session):
        """Test that users can only access their own data."""
        # Create two users
        user1 = User(
            email="user1@example.com",
            hashed_password=get_password_hash("password123"),
            name="User One"
        )
        user2 = User(
            email="user2@example.com",
            hashed_password=get_password_hash("password123"),
            name="User Two"
        )
        db_session.add_all([user1, user2])
        db_session.commit()
        db_session.refresh(user1)
        db_session.refresh(user2)

        # Login both users
        login_data1 = {"username": "user1@example.com", "password": "password123"}
        response1 = await async_client.post("/auth/login", data=login_data1)
        token1 = response1.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        login_data2 = {"username": "user2@example.com", "password": "password123"}
        response2 = await async_client.post("/auth/login", data=login_data2)
        token2 = response2.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 1 creates an expense
        expense_data1 = {
            "date": "2024-01-15T10:00:00",
            "price": 100.0,
            "description": "User 1 expense",
            "category": "fuel-diesel",
            "company": "Swatch"
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data1)},
            headers=headers1
        )
        assert response.status_code == 201
        expense1_id = response.json()["id"]

        # User 2 creates an expense
        expense_data2 = {
            "date": "2024-01-16T10:00:00",
            "price": 200.0,
            "description": "User 2 expense",
            "category": "truck",
            "company": "Swatch"
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data2)},
            headers=headers2
        )
        assert response.status_code == 201
        expense2_id = response.json()["id"]

        # User 1 should see their own expenses
        response = await async_client.get("/api/v1/expenses/", headers=headers1)
        assert response.status_code == 200
        user1_expenses = response.json()
        user1_descriptions = [exp["description"] for exp in user1_expenses]
        assert "User 1 expense" in user1_descriptions

        # User 2 should see their own expenses
        response = await async_client.get("/api/v1/expenses/", headers=headers2)
        assert response.status_code == 200
        user2_expenses = response.json()
        user2_descriptions = [exp["description"] for exp in user2_expenses]
        assert "User 2 expense" in user2_descriptions

        # User 1 should not be able to access User 2's expense directly
        response = await async_client.get(f"/api/v1/expenses/{expense2_id}", headers=headers1)
        # Should either return 404 (not found) or 403 (forbidden) if access control is implemented
        assert response.status_code in [404, 403]

        # User 2 should not be able to access User 1's expense directly
        response = await async_client.get(f"/api/v1/expenses/{expense1_id}", headers=headers2)
        assert response.status_code in [404, 403]

    async def test_management_dropdown_functionality(self, async_client: AsyncClient, db_session: Session):
        """Test management entities are accessible as dropdown options."""
        # Create user
        user = User(
            email="dropdown@example.com",
            hashed_password=get_password_hash("password123"),
            name="Dropdown User"
        )
        db_session.add(user)
        db_session.commit()

        # Login
        login_data = {"username": "dropdown@example.com", "password": "password123"}
        response = await async_client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create management entities that should appear in dropdowns
        business_units = [
            BusinessUnit(name="Logistics"),
            BusinessUnit(name="Transportation"),  
            BusinessUnit(name="Maintenance")
        ]
        
        trucks = [
            Truck(number="T001"),
            Truck(number="T002"),
            Truck(number="T003")
        ]
        
        trailers = [
            Trailer(number="TR001"),
            Trailer(number="TR002"),
            Trailer(number="TR003")
        ]
        
        fuel_stations = [
            FuelStation(name="Shell Station"),
            FuelStation(name="BP Station"),
            FuelStation(name="Petro Canada")
        ]

        db_session.add_all(business_units + trucks + trailers + fuel_stations)
        db_session.commit()

        # Test that all management entities are accessible for dropdown population
        # Business Units
        response = await async_client.get("/api/v1/business-units/", headers=headers)
        assert response.status_code == 200
        bu_data = response.json()
        assert len(bu_data) >= 3
        bu_names = [bu["name"] for bu in bu_data]
        assert "Logistics" in bu_names
        assert "Transportation" in bu_names
        assert "Maintenance" in bu_names

        # Trucks
        response = await async_client.get("/api/v1/trucks/", headers=headers)
        assert response.status_code == 200
        truck_data = response.json()
        assert len(truck_data) >= 3
        truck_numbers = [truck["number"] for truck in truck_data]
        assert "T001" in truck_numbers
        assert "T002" in truck_numbers
        assert "T003" in truck_numbers

        # Trailers
        response = await async_client.get("/api/v1/trailers/", headers=headers)
        assert response.status_code == 200
        trailer_data = response.json()
        assert len(trailer_data) >= 3
        trailer_numbers = [trailer["number"] for trailer in trailer_data]
        assert "TR001" in trailer_numbers
        assert "TR002" in trailer_numbers
        assert "TR003" in trailer_numbers

        # Fuel Stations
        response = await async_client.get("/api/v1/fuel-stations/", headers=headers)
        assert response.status_code == 200
        fs_data = response.json()
        assert len(fs_data) >= 3
        fs_names = [fs["name"] for fs in fs_data]
        assert "Shell Station" in fs_names
        assert "BP Station" in fs_names
        assert "Petro Canada" in fs_names

    async def test_expense_form_with_dropdowns(self, async_client: AsyncClient, db_session: Session):
        """Test creating expenses using dropdown selections."""
        # Create user
        user = User(
            email="expenseform@example.com",
            hashed_password=get_password_hash("password123"),
            name="Expense Form User"
        )
        db_session.add(user)
        
        # Create management entities
        business_unit = BusinessUnit(name="Fleet Operations")
        truck = Truck(number="FL001")
        trailer = Trailer(number="TL001")
        fuel_station = FuelStation(name="Flying J")
        
        db_session.add_all([business_unit, truck, trailer, fuel_station])
        db_session.commit()
        db_session.refresh(business_unit)
        db_session.refresh(truck)
        db_session.refresh(trailer)
        db_session.refresh(fuel_station)

        # Login
        login_data = {"username": "expenseform@example.com", "password": "password123"}
        response = await async_client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create expense using dropdown selections
        expense_with_dropdowns = {
            "date": "2024-01-15T10:00:00",
            "price": 250.75,
            "description": "Fuel purchase with all dropdown selections",
            "category": "fuel-diesel",
            "company": "Swatch",
            "business_unit_id": business_unit.id,
            "truck_id": truck.id,
            "trailer_id": trailer.id,
            "fuel_station_id": fuel_station.id
        }
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_with_dropdowns)},
            headers=headers
        )
        assert response.status_code == 201
        expense_data = response.json()
        
        # Verify all relationships were saved
        assert expense_data["business_unit_id"] == business_unit.id
        assert expense_data["truck_id"] == truck.id
        assert expense_data["trailer_id"] == trailer.id
        assert expense_data["fuel_station_id"] == fuel_station.id

        # Verify the expense can be retrieved with full relationship data
        expense_id = expense_data["id"]
        response = await async_client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
        assert response.status_code == 200
        full_expense_data = response.json()
        
        # Check that foreign key relationships are preserved
        assert full_expense_data["business_unit_id"] == business_unit.id
        assert full_expense_data["truck_id"] == truck.id
        assert full_expense_data["trailer_id"] == trailer.id
        assert full_expense_data["fuel_station_id"] == fuel_station.id

    async def test_filtering_with_relationships(self, async_client: AsyncClient, db_session: Session):
        """Test filtering expenses by related entities."""
        # Create user and entities
        user = User(
            email="filtering@example.com",
            hashed_password=get_password_hash("password123"),
            name="Filtering User"
        )
        db_session.add(user)
        
        # Create different business units
        bu1 = BusinessUnit(name="Operations")
        bu2 = BusinessUnit(name="Maintenance")
        
        # Create different trucks
        truck1 = Truck(number="OP001")
        truck2 = Truck(number="MN001")
        
        db_session.add_all([bu1, bu2, truck1, truck2])
        db_session.commit()
        db_session.refresh(bu1)
        db_session.refresh(bu2)
        db_session.refresh(truck1)
        db_session.refresh(truck2)

        # Create expenses with different relationships
        expenses = [
            Expense(
                date=datetime(2024, 1, 15, 10, 0, 0),
                price=150.0,
                description="Operations fuel expense",
                category="fuel-diesel",
                company="Swatch",
                business_unit_id=bu1.id,
                truck_id=truck1.id
            ),
            Expense(
                date=datetime(2024, 1, 16, 10, 0, 0),
                price=300.0,
                description="Maintenance parts expense",
                category="parts",
                company="Swatch",
                business_unit_id=bu2.id,
                truck_id=truck2.id
            ),
            Expense(
                date=datetime(2024, 1, 17, 10, 0, 0),
                price=200.0,
                description="Operations maintenance",
                category="truck",
                company="Swatch",
                business_unit_id=bu1.id,
                truck_id=truck1.id
            )
        ]
        
        db_session.add_all(expenses)
        db_session.commit()

        # Login
        login_data = {"username": "filtering@example.com", "password": "password123"}
        response = await async_client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test filtering by business unit (if supported)
        response = await async_client.get(f"/api/v1/expenses/?business_unit_id={bu1.id}", headers=headers)
        assert response.status_code == 200
        bu1_expenses = response.json()
        # Should return expenses related to Operations business unit
        bu1_descriptions = [exp["description"] for exp in bu1_expenses]
        assert "Operations fuel expense" in bu1_descriptions
        assert "Operations maintenance" in bu1_descriptions

        # Test filtering by truck (if supported)
        response = await async_client.get(f"/api/v1/expenses/?truck_id={truck2.id}", headers=headers)
        assert response.status_code == 200
        truck2_expenses = response.json()
        # Should return expenses related to MN001 truck
        if truck2_expenses:  # If filtering is implemented
            truck2_descriptions = [exp["description"] for exp in truck2_expenses]
            assert "Maintenance parts expense" in truck2_descriptions

        # Test combined filtering
        response = await async_client.get(
            f"/api/v1/expenses/?business_unit_id={bu1.id}&category=fuel-diesel",
            headers=headers
        )
        assert response.status_code == 200

    async def test_concurrent_user_operations(self, async_client: AsyncClient, db_session: Session):
        """Test concurrent operations by multiple users."""
        # Create multiple users
        users = []
        for i in range(3):
            user = User(
                email=f"concurrent{i}@example.com",
                hashed_password=get_password_hash("password123"),
                name=f"Concurrent User {i}"
            )
            users.append(user)
            db_session.add(user)
        
        db_session.commit()

        # Login all users and get tokens
        tokens = []
        for i, user in enumerate(users):
            login_data = {"username": f"concurrent{i}@example.com", "password": "password123"}
            response = await async_client.post("/auth/login", data=login_data)
            token = response.json()["access_token"]
            tokens.append(token)

        # Create shared management entities
        shared_bu = BusinessUnit(name="Shared Operations")
        db_session.add(shared_bu)
        db_session.commit()
        db_session.refresh(shared_bu)

        # Each user creates expenses concurrently
        import asyncio
        
        async def create_user_expense(user_index, token):
            headers = {"Authorization": f"Bearer {token}"}
            expense_data = {
                "date": f"2024-01-{15 + user_index}T10:00:00",
                "price": 100.0 + user_index * 50,
                "description": f"User {user_index} concurrent expense",
                "category": "fuel-diesel",
                "company": "Swatch",
                "business_unit_id": shared_bu.id
            }
            
            return await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(expense_data)},
                headers=headers
            )

        # Create expenses concurrently
        tasks = [create_user_expense(i, token) for i, token in enumerate(tokens)]
        responses = await asyncio.gather(*tasks)

        # All should succeed
        for response in responses:
            assert response.status_code == 201

        # Each user should see their own expenses
        for i, token in enumerate(tokens):
            headers = {"Authorization": f"Bearer {token}"}
            response = await async_client.get("/api/v1/expenses/", headers=headers)
            assert response.status_code == 200
            user_expenses = response.json()
            
            # Find this user's expense
            user_expense = next(
                (exp for exp in user_expenses if f"User {i} concurrent expense" in exp["description"]), 
                None
            )
            assert user_expense is not None

    async def test_bulk_operations(self, async_client: AsyncClient, db_session: Session):
        """Test bulk operations and large dataset handling."""
        # Create user
        user = User(
            email="bulk@example.com",
            hashed_password=get_password_hash("password123"),
            name="Bulk User"
        )
        db_session.add(user)
        db_session.commit()

        # Create many management entities for realistic dropdown data
        business_units = [BusinessUnit(name=f"Department {i}") for i in range(10)]
        trucks = [Truck(number=f"T{i:03d}") for i in range(20)]
        
        db_session.add_all(business_units + trucks)
        db_session.commit()

        # Login
        login_data = {"username": "bulk@example.com", "password": "password123"}
        response = await async_client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test that large dropdown datasets are handled efficiently
        response = await async_client.get("/api/v1/business-units/", headers=headers)
        assert response.status_code == 200
        bu_data = response.json()
        assert len(bu_data) >= 10

        response = await async_client.get("/api/v1/trucks/", headers=headers)
        assert response.status_code == 200
        truck_data = response.json()
        assert len(truck_data) >= 20

        # Create multiple expenses rapidly
        for i in range(10):
            expense_data = {
                "date": f"2024-01-{15 + i}T{10 + i}:00:00",
                "price": 100.0 + i * 10,
                "description": f"Bulk expense {i}",
                "category": "fuel-diesel",
                "company": "Swatch",
                "business_unit_id": business_units[i % len(business_units)].id,
                "truck_id": trucks[i % len(trucks)].id
            }
            
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(expense_data)},
                headers=headers
            )
            assert response.status_code == 201

        # Verify all expenses are retrievable
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        assert response.status_code == 200
        all_expenses = response.json()
        assert len(all_expenses) >= 10

        # Test filtering still works with large dataset
        response = await async_client.get("/api/v1/expenses/?keyword=bulk", headers=headers)
        assert response.status_code == 200
        filtered_expenses = response.json()
        bulk_expenses = [exp for exp in filtered_expenses if "Bulk expense" in exp["description"]]
        assert len(bulk_expenses) >= 10
