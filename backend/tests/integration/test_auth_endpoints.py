"""
Integration tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash, verify_token

# Mark all async functions in this module with asyncio
pytestmark = pytest.mark.asyncio


@pytest.mark.integration
class TestSignupEndpoint:
    """Test cases for the /auth/signup endpoint."""

    @pytest.mark.asyncio
    async def test_signup_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful user signup."""
        signup_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        async for client in async_client:
            response = await client.post("/auth/signup", json=signup_data)
            break
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        # Check response structure
        assert "access_token" in data
        assert "token_type" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        
        # Check user data
        user_data = data["user"]
        assert user_data["email"] == "newuser@example.com"
        assert user_data["is_active"] is True
        assert "id" in user_data
        assert "created_at" in user_data
        
        # Verify user was created in database
        db_user = db_session.query(User).filter(User.email == "newuser@example.com").first()
        assert db_user is not None
        assert db_user.email == "newuser@example.com"
        assert db_user.hashed_password != "SecurePass123!"  # Should be hashed

        # Verify token is valid
        token = data["access_token"]
        email = verify_token(token)
        assert email == "newuser@example.com"

    async def test_signup_duplicate_email(self, async_client: AsyncClient, db_session: Session):
        """Test signup with already registered email."""
        # Create existing user
        existing_user = User(
            email="existing@example.com",
            hashed_password=get_password_hash("password123")
        )
        db_session.add(existing_user)
        db_session.commit()
        
        signup_data = {
            "email": "existing@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/signup", json=signup_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Email already registered" in data["detail"]

    async def test_signup_case_insensitive_email(self, async_client: AsyncClient, db_session: Session):
        """Test that email comparison is case-insensitive."""
        # Create user with lowercase email
        existing_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123")
        )
        db_session.add(existing_user)
        db_session.commit()
        
        # Try to signup with uppercase email
        signup_data = {
            "email": "TEST@EXAMPLE.COM",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/signup", json=signup_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "Email already registered" in data["detail"]

    async def test_signup_invalid_email(self, async_client: AsyncClient):
        """Test signup with invalid email formats."""
        invalid_emails = ["invalid-email", "@example.com", "test@", ""]
        
        for email in invalid_emails:
            signup_data = {
                "email": email,
                "password": "SecurePass123!",
                "confirm_password": "SecurePass123!"
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_signup_password_validation(self, async_client: AsyncClient):
        """Test signup with various invalid passwords."""
        invalid_passwords = [
            "short",  # Too short
            "nouppercase123!",  # No uppercase
            "NOLOWERCASE123!",  # No lowercase
            "NoNumbers!",  # No numbers
            "NoSpecialChars123",  # No special characters
        ]
        
        for password in invalid_passwords:
            signup_data = {
                "email": "test@example.com",
                "password": password,
                "confirm_password": password
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_signup_password_mismatch(self, async_client: AsyncClient):
        """Test signup with mismatched passwords."""
        signup_data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "confirm_password": "DifferentPass123!"
        }
        
        response = await async_client.post("/auth/signup", json=signup_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_signup_missing_fields(self, async_client: AsyncClient):
        """Test signup with missing required fields."""
        incomplete_data_sets = [
            {"password": "SecurePass123!", "confirm_password": "SecurePass123!"},  # Missing email
            {"email": "test@example.com", "confirm_password": "SecurePass123!"},  # Missing password
            {"email": "test@example.com", "password": "SecurePass123!"},  # Missing confirm_password
        ]
        
        for data in incomplete_data_sets:
            response = await async_client.post("/auth/signup", json=data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.integration
class TestLoginEndpoint:
    """Test cases for the /auth/login endpoint."""

    async def test_login_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful user login."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="loginuser@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "loginuser@example.com",  # OAuth2 uses 'username' field
            "password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check response structure
        assert "access_token" in data
        assert "token_type" in data
        assert "user" in data
        assert data["token_type"] == "bearer"
        
        # Check user data
        user_data = data["user"]
        assert user_data["email"] == "loginuser@example.com"
        assert user_data["is_active"] is True
        
        # Verify token is valid
        token = data["access_token"]
        email = verify_token(token)
        assert email == "loginuser@example.com"

    async def test_login_case_insensitive_email(self, async_client: AsyncClient, db_session: Session):
        """Test login with different email case."""
        # Create user with lowercase email
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="casetest@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        # Login with uppercase email
        login_data = {
            "username": "CASETEST@EXAMPLE.COM",
            "password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["user"]["email"] == "casetest@example.com"

    async def test_login_wrong_email(self, async_client: AsyncClient, db_session: Session):
        """Test login with non-existent email."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Incorrect email or password" in data["detail"]

    async def test_login_wrong_password(self, async_client: AsyncClient, db_session: Session):
        """Test login with incorrect password."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="wrongpass@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "wrongpass@example.com",
            "password": "WrongPassword123!"
        }
        
        response = await async_client.post("/auth/login", data=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "Incorrect email or password" in data["detail"]

    async def test_login_missing_credentials(self, async_client: AsyncClient):
        """Test login with missing username or password."""
        incomplete_data_sets = [
            {"password": "SecurePass123!"},  # Missing username
            {"username": "test@example.com"},  # Missing password
        ]
        
        for data in incomplete_data_sets:
            response = await async_client.post("/auth/login", data=data)
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.integration
class TestProtectedEndpoint:
    """Test cases for protected endpoints."""

    async def test_me_endpoint_success(self, async_client: AsyncClient, db_session: Session):
        """Test accessing /auth/me with valid token."""
        # Create test user
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="protecteduser@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        login_data = {
            "username": "protecteduser@example.com",
            "password": "SecurePass123!"
        }
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = await async_client.get("/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "protecteduser@example.com"
        assert data["is_active"] is True

    async def test_me_endpoint_no_token(self, async_client: AsyncClient):
        """Test accessing /auth/me without token."""
        response = await async_client.get("/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_me_endpoint_invalid_token(self, async_client: AsyncClient):
        """Test accessing /auth/me with invalid token."""
        headers = {"Authorization": "Bearer invalid.token.here"}
        response = await async_client.get("/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_me_endpoint_malformed_header(self, async_client: AsyncClient):
        """Test accessing /auth/me with malformed auth header."""
        malformed_headers = [
            {"Authorization": "invalid_format"},
            {"Authorization": "Bearer"},  # Missing token
            {"Authorization": "NotBearer validtoken"},  # Wrong type
        ]
        
        for headers in malformed_headers:
            response = await async_client.get("/auth/me", headers=headers)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
