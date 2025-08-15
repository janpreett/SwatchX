"""
Additional tests to improve auth router coverage.
"""

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash
from app.routers.auth import (
    authenticate_user, 
    get_current_user,
    get_user
)
from app.core.database import get_db


@pytest.mark.unit
class TestAuthFunctions:
    """Test authentication utility functions."""

    def test_get_user_by_email_exists(self, db_session: Session):
        """Test getting user by email when user exists."""
        # Arrange
        test_email = "existing@example.com"
        user = User(email=test_email, hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Act
        result = get_user(db_session, test_email)
        
        # Assert
        assert result is not None
        assert result.email == test_email

    def test_get_user_by_email_not_exists(self, db_session: Session):
        """Test getting user by email when user doesn't exist."""
        # Arrange
        test_email = "nonexistent@example.com"
        
        # Act
        result = get_user(db_session, test_email)
        
        # Assert
        assert result is None

    def test_authenticate_user_success(self, db_session: Session):
        """Test successful user authentication."""
        # Arrange
        test_email = "auth@example.com"
        test_password = "password123"
        user = User(email=test_email, hashed_password=get_password_hash(test_password))
        db_session.add(user)
        db_session.commit()
        
        # Act
        result = authenticate_user(db_session, test_email, test_password)
        
        # Assert
        assert result is not False
        assert result.email == test_email

    def test_authenticate_user_wrong_password(self, db_session: Session):
        """Test authentication with wrong password."""
        # Arrange
        test_email = "auth@example.com"
        user = User(email=test_email, hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Act
        result = authenticate_user(db_session, test_email, "wrongpassword")
        
        # Assert
        assert result is False

    def test_authenticate_user_nonexistent(self, db_session: Session):
        """Test authentication with non-existent user."""
        # Act
        result = authenticate_user(db_session, "nonexistent@example.com", "password")
        
        # Assert
        assert result is False


@pytest.mark.integration
class TestAuthEndpointsCoverage:
    """Additional auth endpoint tests for coverage."""

    async def test_signup_duplicate_email(self, async_client: AsyncClient, db_session: Session):
        """Test signup with duplicate email."""
        # Arrange
        existing_user = User(
            email="duplicate@example.com", 
            hashed_password=get_password_hash("password123")
        )
        db_session.add(existing_user)
        db_session.commit()
        
        signup_data = {
            "email": "duplicate@example.com",
            "password": "newpassword123",
            "confirm_password": "newpassword123"
        }
        
        # Act
        response = await async_client.post("/auth/signup", json=signup_data)
        
        # Assert
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]

    async def test_signup_password_mismatch(self, async_client: AsyncClient):
        """Test signup with password mismatch."""
        # Arrange
        signup_data = {
            "email": "mismatch@example.com",
            "password": "password123",
            "confirm_password": "different123"
        }
        
        # Act
        response = await async_client.post("/auth/signup", json=signup_data)
        
        # Assert
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]

    async def test_login_invalid_credentials(self, async_client: AsyncClient):
        """Test login with invalid credentials."""
        # Arrange
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        # Act
        response = await async_client.post("/auth/login", data=login_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_login_missing_user(self, async_client: AsyncClient):
        """Test login attempt for user that doesn't exist."""
        # Arrange
        login_data = {
            "username": "missing@example.com", 
            "password": "anypassword"
        }
        
        # Act
        response = await async_client.post("/auth/login", data=login_data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_protected_endpoint_no_token(self, async_client: AsyncClient):
        """Test protected endpoint without token."""
        # Act
        response = await async_client.get("/auth/me")
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_protected_endpoint_invalid_token(self, async_client: AsyncClient):
        """Test protected endpoint with invalid token."""
        # Arrange
        headers = {"Authorization": "Bearer invalid-token"}
        
        # Act
        response = await async_client.get("/auth/me", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_protected_endpoint_malformed_header(self, async_client: AsyncClient):
        """Test protected endpoint with malformed auth header."""
        # Arrange
        headers = {"Authorization": "InvalidFormat token"}
        
        # Act
        response = await async_client.get("/auth/me", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_me_endpoint_success(self, async_client: AsyncClient, db_session: Session):
        """Test successful access to /me endpoint."""
        # Arrange
        user = User(email="me@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        login_data = {"username": "me@example.com", "password": "password123"}
        login_response = await async_client.post("/auth/login", data=login_data)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act
        response = await async_client.get("/auth/me", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == "me@example.com"

    async def test_signup_edge_cases(self, async_client: AsyncClient):
        """Test various edge cases for signup."""
        edge_cases = [
            {
                "email": "",
                "password": "password123",
                "confirm_password": "password123"
            },
            {
                "email": "test@example.com",
                "password": "",
                "confirm_password": ""
            },
            {
                "email": "invalid-email",
                "password": "password123",
                "confirm_password": "password123"
            }
        ]
        
        for case in edge_cases:
            response = await async_client.post("/auth/signup", json=case)
            # Should return validation error
            assert response.status_code in [
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                status.HTTP_400_BAD_REQUEST
            ]

    async def test_login_edge_cases(self, async_client: AsyncClient):
        """Test various edge cases for login."""
        edge_cases = [
            {"username": "", "password": "password"},
            {"username": "test@example.com", "password": ""},
            {},
        ]
        
        for case in edge_cases:
            response = await async_client.post("/auth/login", data=case)
            # Should return some kind of error
            assert response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                status.HTTP_400_BAD_REQUEST
            ]
