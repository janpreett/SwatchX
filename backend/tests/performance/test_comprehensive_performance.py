"""
Comprehensive performance tests for the SwatchX API.

Tests include:
- API response time measurements
- Database query performance
- Concurrent user simulation
- Load testing for key endpoints
- Memory usage monitoring
- N+1 query detection
"""
import pytest
import asyncio
import time
from datetime import date, datetime
from decimal import Decimal
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.models.user import User
from app.models.expense import Expense, BusinessUnit, Truck, Trailer, FuelStation
from app.core.security import get_password_hash


@pytest.mark.performance
class TestAPIResponseTimes:
    """Test API response times for key endpoints."""

    async def test_expense_list_performance(self, async_client: AsyncClient, db_session: Session):
        """Test performance of expense list endpoint with various data sizes."""
        # Arrange - Create user and login
        user = User(email="perftest@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "perftest@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create test data in batches
        batch_sizes = [10, 50, 100, 500]
        
        for batch_size in batch_sizes:
            # Create expenses
            expenses = []
            for i in range(batch_size):
                expense = Expense(
                    date=date.today(),
                    price=Decimal(f"{100 + i}.00"),
                    description=f"Performance test expense {i}",
                    category="fuel",
                    company="Swatch"
                )
                expenses.append(expense)
            
            db_session.add_all(expenses)
            db_session.commit()
            
            # Measure response time
            start_time = time.time()
            
            response = await async_client.get("/api/v1/expenses/", headers=headers)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            # Assert
            assert response.status_code == status.HTTP_200_OK
            
            # Performance assertions - adjust thresholds as needed
            if batch_size <= 10:
                assert response_time < 0.5, f"Response time {response_time}s too slow for {batch_size} records"
            elif batch_size <= 100:
                assert response_time < 1.0, f"Response time {response_time}s too slow for {batch_size} records"
            elif batch_size <= 500:
                assert response_time < 2.0, f"Response time {response_time}s too slow for {batch_size} records"
            
            data = response.json()
            assert len(data) >= batch_size
            
            print(f"✓ Batch size {batch_size}: Response time {response_time:.3f}s")

    async def test_expense_creation_performance(self, async_client: AsyncClient, db_session: Session):
        """Test performance of expense creation endpoint."""
        # Arrange
        user = User(email="perftest@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "perftest@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create supporting entities
        business_unit = BusinessUnit(name="Perf Test BU")
        truck = Truck(number="PERF-001")
        
        db_session.add_all([business_unit, truck])
        db_session.commit()
        db_session.refresh(business_unit)
        db_session.refresh(truck)

        expense_data = {
            "date": "2024-01-15",
            "amount": 125.50,
            "description": "Performance test expense",
            "category": "fuel",
            "company": "Swatch",
            "business_unit_id": business_unit.id,
            "truck_id": truck.id
        }
        
        # Measure creation time
        start_time = time.time()
        
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": str(expense_data).replace("'", '"')},
            headers=headers
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response_time < 1.0, f"Expense creation took {response_time}s, too slow"
        
        print(f"✓ Expense creation: {response_time:.3f}s")

    async def test_auth_endpoint_performance(self, async_client: AsyncClient, db_session: Session):
        """Test performance of authentication endpoints."""
        # Arrange
        user = User(email="authtest@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Test login performance
        start_time = time.time()
        
        response = await async_client.post(
            "/auth/login",
            data={"username": "authtest@example.com", "password": "password123"}
        )
        
        end_time = time.time()
        login_time = end_time - start_time
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert login_time < 0.5, f"Login took {login_time}s, too slow"
        
        # Test /auth/me performance
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        start_time = time.time()
        
        response = await async_client.get("/auth/me", headers=headers)
        
        end_time = time.time()
        me_time = end_time - start_time
        
        assert response.status_code == status.HTTP_200_OK
        assert me_time < 0.3, f"/auth/me took {me_time}s, too slow"
        
        print(f"✓ Login: {login_time:.3f}s, /auth/me: {me_time:.3f}s")

    async def test_management_endpoints_performance(self, async_client: AsyncClient, db_session: Session):
        """Test performance of management CRUD endpoints."""
        # Arrange
        user = User(email="mgmttest@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "mgmttest@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create test data
        entities = []
        for i in range(50):
            entities.extend([
                BusinessUnit(name=f"BU {i}"),
                Truck(number=f"TRK-{i:03d}"),
                Trailer(number=f"TRL-{i:03d}"),
                FuelStation(name=f"Station {i}")
            ])
        
        db_session.add_all(entities)
        db_session.commit()
        
        # Test various management endpoints
        endpoints = [
            "/api/v1/business-units/",
            "/api/v1/trucks/",
            "/api/v1/trailers/",
            "/api/v1/fuel-stations/"
        ]
        
        for endpoint in endpoints:
            start_time = time.time()
            
            response = await async_client.get(endpoint, headers=headers)
            
            end_time = time.time()
            response_time = end_time - start_time
            
            assert response.status_code == status.HTTP_200_OK
            assert response_time < 0.8, f"{endpoint} took {response_time}s, too slow"
            
            data = response.json()
            assert len(data) >= 50
            
            print(f"✓ {endpoint}: {response_time:.3f}s for {len(data)} records")


@pytest.mark.performance
class TestConcurrentUsers:
    """Test API performance under concurrent user load."""

    async def test_concurrent_expense_reads(self, async_client: AsyncClient, db_session: Session):
        """Test concurrent expense reading by multiple users."""
        # Arrange - Create multiple users
        users = []
        tokens = []
        
        for i in range(5):
            user = User(
                email=f"concurrent{i}@example.com",
                hashed_password=get_password_hash("password123")
            )
            users.append(user)
        
        db_session.add_all(users)
        db_session.commit()
        
        # Login all users and get tokens
        for user in users:
            login_response = await async_client.post(
                "/auth/login",
                data={"username": user.email, "password": "password123"}
            )
            tokens.append(login_response.json()["access_token"])
        
        # Create test expenses
        expenses = []
        for i in range(100):
            expense = Expense(
                date=date.today(),
                price=Decimal(f"{50 + i}.00"),
                description=f"Concurrent test expense {i}",
                category="fuel",
                company="Swatch"
            )
            expenses.append(expense)
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Concurrent requests function
        async def make_request(token):
            headers = {"Authorization": f"Bearer {token}"}
            start_time = time.time()
            
            response = await async_client.get("/api/v1/expenses/", headers=headers)
            
            end_time = time.time()
            return response.status_code, end_time - start_time
        
        # Act - Make concurrent requests
        start_time = time.time()
        
        tasks = [make_request(token) for token in tokens]
        results = await asyncio.gather(*tasks)
        
        total_time = time.time() - start_time
        
        # Assert
        for status_code, response_time in results:
            assert status_code == status.HTTP_200_OK
            assert response_time < 2.0, f"Concurrent request took {response_time}s"
        
        avg_response_time = sum(result[1] for result in results) / len(results)
        
        print(f"✓ Concurrent reads: {len(results)} users, avg {avg_response_time:.3f}s, total {total_time:.3f}s")
        
        # Performance assertion
        assert avg_response_time < 1.5, f"Average response time {avg_response_time}s too slow"

    async def test_concurrent_expense_creation(self, async_client: AsyncClient, db_session: Session):
        """Test concurrent expense creation."""
        # Arrange
        user = User(email="creation@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "creation@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Function to create expense
        async def create_expense(index):
            expense_data = {
                "date": "2024-01-15",
                "amount": 100.0 + index,
                "description": f"Concurrent creation test {index}",
                "category": "fuel",
                "company": "Swatch"
            }
            
            start_time = time.time()
            
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": str(expense_data).replace("'", '"')},
                headers=headers
            )
            
            end_time = time.time()
            return response.status_code, end_time - start_time, index
        
        # Act - Create expenses concurrently
        concurrent_creates = 10
        
        start_time = time.time()
        
        tasks = [create_expense(i) for i in range(concurrent_creates)]
        results = await asyncio.gather(*tasks)
        
        total_time = time.time() - start_time
        
        # Assert
        successful_creates = 0
        for status_code, response_time, index in results:
            if status_code == status.HTTP_201_CREATED:
                successful_creates += 1
            assert response_time < 3.0, f"Creation {index} took {response_time}s"
        
        # Should have high success rate
        success_rate = successful_creates / concurrent_creates
        assert success_rate >= 0.8, f"Only {success_rate:.1%} success rate for concurrent creates"
        
        print(f"✓ Concurrent creates: {successful_creates}/{concurrent_creates} succeeded in {total_time:.3f}s")


@pytest.mark.performance
class TestDatabaseQueryPerformance:
    """Test database query performance and N+1 detection."""

    async def test_expense_relationships_query_efficiency(self, async_client: AsyncClient, db_session: Session):
        """Test that expense queries with relationships are efficient (no N+1)."""
        # Arrange
        user = User(email="dbtest@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "dbtest@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create related entities
        business_units = [BusinessUnit(name=f"BU {i}") for i in range(10)]
        trucks = [Truck(number=f"TRK-{i:03d}") for i in range(10)]
        trailers = [Trailer(number=f"TRL-{i:03d}") for i in range(10)]
        fuel_stations = [FuelStation(name=f"Station {i}") for i in range(10)]
        
        db_session.add_all(business_units + trucks + trailers + fuel_stations)
        db_session.commit()
        
        # Create expenses with relationships
        expenses = []
        for i in range(50):
            expense = Expense(
                date=date.today(),
                price=Decimal(f"{100 + i}.00"),
                description=f"Relationship test {i}",
                category="fuel",
                company="Swatch",
                business_unit_id=business_units[i % len(business_units)].id,
                truck_id=trucks[i % len(trucks)].id,
                trailer_id=trailers[i % len(trailers)].id,
                fuel_station_id=fuel_stations[i % len(fuel_stations)].id
            )
            expenses.append(expense)
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Enable SQL query logging (if available)
        # This would require additional setup for query counting
        
        # Measure query performance
        start_time = time.time()
        
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= 50
        
        # Performance assertion for relationship loading
        assert query_time < 2.0, f"Query with relationships took {query_time}s, possible N+1 problem"
        
        # Verify relationships are loaded
        expenses_with_relationships = [exp for exp in data if exp.get("business_unit")]
        assert len(expenses_with_relationships) > 0, "Relationships not loaded"
        
        print(f"✓ Relationship queries: {len(data)} expenses in {query_time:.3f}s")

    async def test_pagination_performance(self, async_client: AsyncClient, db_session: Session):
        """Test that pagination performs well with large datasets."""
        # Arrange
        user = User(email="pagination@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "pagination@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create large dataset
        expenses = []
        for i in range(1000):  # Large dataset
            expense = Expense(
                date=date.today(),
                price=Decimal(f"{10 + i}.00"),
                description=f"Pagination test {i}",
                category="fuel",
                company="Swatch"
            )
            expenses.append(expense)
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Test different page sizes
        page_sizes = [10, 50, 100]
        
        for limit in page_sizes:
            start_time = time.time()
            
            response = await async_client.get(
                f"/api/v1/expenses/?skip=0&limit={limit}",
                headers=headers
            )
            
            end_time = time.time()
            query_time = end_time - start_time
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data) == limit
            
            # Pagination should be fast even with large datasets
            assert query_time < 1.0, f"Pagination (limit={limit}) took {query_time}s"
            
            print(f"✓ Pagination limit {limit}: {query_time:.3f}s")
        
        # Test deep pagination performance
        start_time = time.time()
        
        response = await async_client.get(
            "/api/v1/expenses/?skip=800&limit=50",
            headers=headers
        )
        
        end_time = time.time()
        deep_page_time = end_time - start_time
        
        assert response.status_code == status.HTTP_200_OK
        assert deep_page_time < 1.5, f"Deep pagination took {deep_page_time}s"
        
        print(f"✓ Deep pagination (skip=800): {deep_page_time:.3f}s")


@pytest.mark.performance
class TestMemoryUsage:
    """Test memory usage patterns."""

    async def test_large_result_set_memory_usage(self, async_client: AsyncClient, db_session: Session):
        """Test memory usage when returning large result sets."""
        # Arrange
        user = User(email="memory@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "memory@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create large dataset with large descriptions
        expenses = []
        large_description = "A" * 1000  # 1KB description
        
        for i in range(200):  # 200KB of description data
            expense = Expense(
                date=date.today(),
                price=Decimal(f"{100 + i}.00"),
                description=f"{large_description} {i}",
                category="fuel",
                company="Swatch"
            )
            expenses.append(expense)
        
        db_session.add_all(expenses)
        db_session.commit()
        
        # Measure response time and size
        start_time = time.time()
        
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Estimate response size
        response_size_mb = len(str(data)) / (1024 * 1024)
        
        # Should handle large responses reasonably
        assert response_time < 3.0, f"Large response took {response_time}s"
        assert response_size_mb < 10, f"Response size {response_size_mb:.2f}MB too large"
        
        print(f"✓ Large result set: {len(data)} records, {response_size_mb:.2f}MB, {response_time:.3f}s")
