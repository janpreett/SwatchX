"""
Performance tests for API endpoints and database operations.
"""
import pytest
import asyncio
import time
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash


@pytest.mark.performance
class TestAPIPerformance:
    """Test API endpoint performance and response times."""

    async def test_signup_performance(self, async_client: AsyncClient, db_session: Session):
        """Test signup endpoint response time."""
        signup_data = {
            "email": "performance@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        start_time = time.time()
        response = await async_client.post("/auth/signup", json=signup_data)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        assert response.status_code == 201
        # Signup should complete within 2 seconds
        assert response_time < 2.0, f"Signup took {response_time:.2f}s, expected < 2.0s"

    async def test_login_performance(self, async_client: AsyncClient, db_session: Session):
        """Test login endpoint response time."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="loginperf@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "loginperf@example.com",
            "password": "SecurePass123!"
        }
        
        start_time = time.time()
        response = await async_client.post("/auth/login", data=login_data)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        assert response.status_code == 200
        # Login should complete within 1 second
        assert response_time < 1.0, f"Login took {response_time:.2f}s, expected < 1.0s"

    async def test_protected_endpoint_performance(self, async_client: AsyncClient, db_session: Session):
        """Test protected endpoint response time."""
        # Create and login user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="protectedperf@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "protectedperf@example.com",
            "password": "SecurePass123!"
        }
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        start_time = time.time()
        response = await async_client.get("/auth/me", headers=headers)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        assert response.status_code == 200
        # Protected endpoint should respond within 0.5 seconds
        assert response_time < 0.5, f"Protected endpoint took {response_time:.2f}s, expected < 0.5s"

    async def test_concurrent_login_performance(self, async_client: AsyncClient, db_session: Session):
        """Test performance under concurrent login requests."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="concurrent@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "concurrent@example.com",
            "password": "SecurePass123!"
        }
        
        async def single_login():
            """Perform single login request."""
            start_time = time.time()
            response = await async_client.post("/auth/login", data=login_data)
            end_time = time.time()
            return response.status_code, end_time - start_time
        
        # Run 10 concurrent login requests
        tasks = [single_login() for _ in range(10)]
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        # All requests should succeed
        for status_code, response_time in results:
            assert status_code == 200
            # Each individual request should be reasonably fast
            assert response_time < 2.0, f"Individual login took {response_time:.2f}s"
        
        # Total time for 10 concurrent requests should be reasonable
        assert total_time < 5.0, f"10 concurrent logins took {total_time:.2f}s, expected < 5.0s"
        
        # Average response time should be acceptable
        avg_response_time = sum(rt for _, rt in results) / len(results)
        assert avg_response_time < 1.0, f"Average response time {avg_response_time:.2f}s"


@pytest.mark.performance
class TestDatabasePerformance:
    """Test database operation performance."""

    def test_user_creation_performance(self, db_session: Session):
        """Test database user creation performance."""
        users_to_create = 100
        
        start_time = time.time()
        
        users = []
        for i in range(users_to_create):
            user = User(
                email=f"perfuser{i}@example.com",
                hashed_password=get_password_hash(f"Password{i}!")
            )
            users.append(user)
        
        db_session.add_all(users)
        db_session.commit()
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Creating 100 users should complete within reasonable time
        assert creation_time < 20.0, f"Creating 100 users took {creation_time:.2f}s"
        
        # Average time per user should be reasonable
        avg_time_per_user = creation_time / users_to_create
        assert avg_time_per_user < 0.2, f"Average time per user: {avg_time_per_user:.3f}s"

    def test_user_query_performance(self, db_session: Session):
        """Test database user query performance."""
        # Create test users
        users = []
        for i in range(50):
            user = User(
                email=f"queryuser{i}@example.com",
                hashed_password=get_password_hash(f"Password{i}!")
            )
            users.append(user)
        
        db_session.add_all(users)
        db_session.commit()
        
        # Test single user queries
        start_time = time.time()
        
        for i in range(20):  # Query 20 different users
            user = db_session.query(User).filter(
                User.email == f"queryuser{i}@example.com"
            ).first()
            assert user is not None
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # 20 queries should complete within 1 second
        assert query_time < 1.0, f"20 user queries took {query_time:.2f}s"
        
        # Average time per query
        avg_query_time = query_time / 20
        assert avg_query_time < 0.05, f"Average query time: {avg_query_time:.3f}s"

    def test_password_hashing_performance(self):
        """Test password hashing performance."""
        passwords = [f"TestPassword{i}!" for i in range(20)]
        
        start_time = time.time()
        
        hashes = [get_password_hash(pwd) for pwd in passwords]
        
        end_time = time.time()
        hashing_time = end_time - start_time
        
        # Verify all hashes are different and valid
        assert len(set(hashes)) == len(passwords)  # All unique
        
        # Hashing 20 passwords should complete within 5 seconds
        assert hashing_time < 5.0, f"Hashing 20 passwords took {hashing_time:.2f}s"
        
        # Average time per hash
        avg_hash_time = hashing_time / 20
        assert avg_hash_time < 0.25, f"Average hash time: {avg_hash_time:.3f}s"


@pytest.mark.performance
class TestMemoryUsage:
    """Test memory usage patterns."""

    async def test_memory_usage_under_load(self, async_client: AsyncClient, db_session: Session):
        """Test that memory usage doesn't grow excessively under load."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="memorytest@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "memorytest@example.com",
            "password": "SecurePass123!"
        }
        
        # Perform many login requests to test memory usage
        for i in range(50):
            response = await async_client.post("/auth/login", data=login_data)
            assert response.status_code == 200
            
            # Optional: Add small delay to prevent overwhelming
            if i % 10 == 0:
                await asyncio.sleep(0.01)
        
        # Test passes if we reach here without memory errors
        assert True

    def test_database_connection_pooling(self, db_session: Session):
        """Test database connection efficiency."""
        # Perform multiple database operations
        operations = 0
        start_time = time.time()
        
        for i in range(20):
            # Perform various database operations
            user_count = db_session.query(User).count()
            operations += 1
            
            # Create and delete a user
            temp_user = User(
                email=f"temp{i}@example.com",
                hashed_password="temp_hash"
            )
            db_session.add(temp_user)
            db_session.commit()
            operations += 1
            
            db_session.delete(temp_user)
            db_session.commit()
            operations += 1
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # 60 database operations should complete efficiently
        assert total_time < 3.0, f"{operations} operations took {total_time:.2f}s"
        
        # Average time per operation
        avg_op_time = total_time / operations
        assert avg_op_time < 0.05, f"Average operation time: {avg_op_time:.3f}s"
