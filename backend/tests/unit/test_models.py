"""
Unit tests for user models and schemas.
"""
import pytest
from datetime import datetime
from faker import Faker
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse


fake = Faker()


@pytest.mark.unit
class TestUserModel:
    """Test cases for the User SQLAlchemy model."""

    def test_user_creation(self, db_session):
        """Test creating a user with valid data."""
        user = User(
            email="test@example.com",
            hashed_password="hashed_password_123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_password_123"
        assert user.is_active is True
        assert isinstance(user.created_at, datetime)

    def test_user_email_unique_constraint(self, db_session):
        """Test that duplicate emails raise IntegrityError."""
        # Create first user
        user1 = User(
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        db_session.add(user1)
        db_session.commit()

        # Try to create second user with same email
        user2 = User(
            email="test@example.com",
            hashed_password="different_password"
        )
        db_session.add(user2)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_default_values(self, db_session):
        """Test that default values are set correctly."""
        user = User(
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.is_active is True  # Default value
        assert user.created_at is not None
        assert user.updated_at is None  # Only set on update


@pytest.mark.unit
class TestUserSchemas:
    """Test cases for user Pydantic schemas."""

    def test_user_create_valid_data(self):
        """Test UserCreate schema with valid data."""
        valid_data = {
            "email": "test@example.com",
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        user = UserCreate(**valid_data)
        assert user.email == "test@example.com"
        assert user.password == "SecurePass123!"

    def test_user_create_invalid_email(self):
        """Test UserCreate with invalid email formats."""
        invalid_emails = [
            "invalid-email",
            "@example.com",
            "test@",
            "",
            "a" * 250 + "@example.com"  # Too long
        ]
        
        for email in invalid_emails:
            with pytest.raises(ValidationError):
                UserCreate(
                    email=email,
                    password="SecurePass123!",
                    confirm_password="SecurePass123!"
                )

    def test_user_create_password_validation(self):
        """Test password validation rules."""
        base_data = {
            "email": "test@example.com",
            "confirm_password": "SecurePass123!"
        }
        
        # Test various invalid passwords
        invalid_passwords = [
            "short",  # Too short
            "nouppercase123!",  # No uppercase
            "NOLOWERCASE123!",  # No lowercase  
            "NoNumbers!",  # No numbers
            "NoSpecialChars123",  # No special characters
            "a" * 130,  # Too long
        ]
        
        for password in invalid_passwords:
            with pytest.raises(ValidationError):
                UserCreate(
                    **base_data,
                    password=password
                )

    def test_user_create_password_mismatch(self):
        """Test that password confirmation must match."""
        with pytest.raises(ValidationError):
            UserCreate(
                email="test@example.com",
                password="SecurePass123!",
                confirm_password="DifferentPass123!"
            )

    def test_user_login_schema(self):
        """Test UserLogin schema validation."""
        valid_data = {
            "email": "test@example.com",
            "password": "anypassword"
        }
        user_login = UserLogin(**valid_data)
        assert user_login.email == "test@example.com"
        assert user_login.password == "anypassword"

    def test_user_response_schema(self):
        """Test UserResponse schema with User model."""
        # Create a user instance
        user_data = {
            "id": 1,
            "email": "test@example.com",
            "is_active": True,
            "created_at": datetime.now()
        }
        
        # Mock User object
        class MockUser:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)
        
        user = MockUser(**user_data)
        response = UserResponse.model_validate(user)
        
        assert response.id == 1
        assert response.email == "test@example.com" 
        assert response.is_active is True
        assert isinstance(response.created_at, datetime)

    def test_email_normalization(self):
        """Test that emails are normalized to lowercase."""
        user_create = UserCreate(
            email="TEST@EXAMPLE.COM",
            password="SecurePass123!",
            confirm_password="SecurePass123!"
        )
        assert user_create.email == "test@example.com"

        user_login = UserLogin(
            email="TEST@EXAMPLE.COM",
            password="anypassword"
        )
        assert user_login.email == "test@example.com"
