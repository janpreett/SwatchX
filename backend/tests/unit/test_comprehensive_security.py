"""
Comprehensive unit tests for security functions and password handling.

Tests include:
- Password hashing and verification
- JWT token creation and validation
- Security utility functions
- Access token handling
"""
import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    pwd_context
)
from app.core.config import settings


class TestPasswordSecurity:
    """Test cases for password hashing and verification."""

    def test_password_hashing(self):
        """Test that passwords are properly hashed."""
        # Arrange
        plain_password = "mysecretpassword123"
        
        # Act
        hashed_password = get_password_hash(plain_password)
        
        # Assert
        assert hashed_password != plain_password
        assert hashed_password.startswith("$2b$")  # bcrypt prefix
        assert len(hashed_password) > 50  # Hashed passwords are long

    def test_password_verification_success(self):
        """Test successful password verification."""
        # Arrange
        plain_password = "correctpassword123"
        hashed_password = get_password_hash(plain_password)
        
        # Act
        is_valid = verify_password(plain_password, hashed_password)
        
        # Assert
        assert is_valid is True

    def test_password_verification_failure(self):
        """Test password verification with wrong password."""
        # Arrange
        correct_password = "correctpassword123"
        wrong_password = "wrongpassword456"
        hashed_password = get_password_hash(correct_password)
        
        # Act
        is_valid = verify_password(wrong_password, hashed_password)
        
        # Assert
        assert is_valid is False

    def test_password_hashing_deterministic(self):
        """Test that same password produces different hashes (salt)."""
        # Arrange
        password = "samepassword123"
        
        # Act
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Assert
        assert hash1 != hash2  # Different salts should produce different hashes
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_empty_password_handling(self):
        """Test handling of empty passwords."""
        # Arrange
        empty_password = ""
        
        # Act
        hashed = get_password_hash(empty_password)
        
        # Assert
        assert hashed is not None
        assert verify_password(empty_password, hashed) is True
        assert verify_password("notempty", hashed) is False

    def test_special_characters_password(self):
        """Test password with special characters."""
        # Arrange
        special_password = "p@ssw0rd!#$%^&*()_+-=[]{}|;':\",./<>?"
        
        # Act
        hashed = get_password_hash(special_password)
        
        # Assert
        assert verify_password(special_password, hashed) is True
        assert verify_password("p@ssw0rd", hashed) is False

    def test_unicode_password(self):
        """Test password with unicode characters."""
        # Arrange
        unicode_password = "пароль123@ñ"
        
        # Act
        hashed = get_password_hash(unicode_password)
        
        # Assert
        assert verify_password(unicode_password, hashed) is True


class TestJWTTokenSecurity:
    """Test cases for JWT token creation and verification."""

    def test_create_access_token_success(self):
        """Test successful access token creation."""
        # Arrange
        test_email = "test@example.com"
        data = {"sub": test_email}
        
        # Act
        token = create_access_token(data=data)
        
        # Assert
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are typically long

    def test_create_access_token_with_expiration(self):
        """Test access token creation with custom expiration."""
        # Arrange
        test_email = "test@example.com"
        data = {"sub": test_email}
        expires_delta = timedelta(minutes=10)
        
        # Act
        token = create_access_token(data=data, expires_delta=expires_delta)
        
        # Assert
        assert token is not None
        
        # Verify expiration time
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        exp_timestamp = payload.get("exp")
        exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        now = datetime.now(timezone.utc)
        
        # Should expire in approximately 10 minutes (allow some variance)
        time_diff = exp_datetime - now
        assert 9 <= time_diff.total_seconds() / 60 <= 11

    def test_verify_token_success(self):
        """Test successful token verification."""
        # Arrange
        test_email = "test@example.com"
        data = {"sub": test_email}
        token = create_access_token(data=data)
        
        # Act
        decoded_email = verify_token(token)
        
        # Assert
        assert decoded_email == test_email

    def test_verify_token_invalid(self):
        """Test token verification with invalid token."""
        # Arrange
        invalid_token = "invalid.token.here"
        
        # Act
        decoded_email = verify_token(invalid_token)
        
        # Assert
        assert decoded_email is None

    def test_verify_token_expired(self):
        """Test token verification with expired token."""
        # Arrange
        test_email = "test@example.com"
        data = {"sub": test_email}
        expires_delta = timedelta(seconds=-10)  # Already expired
        token = create_access_token(data=data, expires_delta=expires_delta)
        
        # Act
        decoded_email = verify_token(token)
        
        # Assert
        assert decoded_email is None

    def test_verify_token_malformed(self):
        """Test token verification with malformed token."""
        # Arrange
        malformed_tokens = [
            "",
            "not.a.token",
            "header.payload",  # Missing signature
            "too.many.parts.here.extra",
        ]
        
        # Act & Assert
        for token in malformed_tokens:
            decoded_email = verify_token(token)
            assert decoded_email is None, f"Token {token} should be invalid"

    def test_verify_token_wrong_signature(self):
        """Test token verification with token signed by different key."""
        # Arrange
        test_email = "test@example.com"
        data = {"sub": test_email}
        
        # Create token with different secret
        wrong_secret = "different-secret-key"
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        
        wrong_token = jwt.encode(to_encode, wrong_secret, algorithm="HS256")
        
        # Act
        decoded_email = verify_token(wrong_token)
        
        # Assert
        assert decoded_email is None

    def test_token_payload_integrity(self):
        """Test that token payload contains expected data."""
        # Arrange
        test_email = "user@example.com"
        custom_expires = timedelta(minutes=30)
        data = {"sub": test_email}
        
        # Act
        token = create_access_token(data=data, expires_delta=custom_expires)
        
        # Assert - Decode and verify payload manually
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        
        assert payload["sub"] == test_email
        assert "exp" in payload
        # Note: Our JWT implementation doesn't include 'iat' by default
        
        # Verify expiration time is reasonable (should be approximately 30 minutes)
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        current_time = datetime.now(timezone.utc)
        time_diff = exp_time - current_time
        
        # Should be approximately 30 minutes
        assert 29 <= time_diff.total_seconds() / 60 <= 31


class TestSecurityConfiguration:
    """Test security configuration and context."""

    def test_password_context_configuration(self):
        """Test that password context is properly configured."""
        # Arrange & Act
        context = pwd_context
        
        # Assert
        assert context is not None
        assert "bcrypt" in context.schemes()
        
        # Test that it can hash and verify
        test_password = "testpassword123"
        hashed = context.hash(test_password)
        assert context.verify(test_password, hashed) is True

    def test_security_settings_loaded(self):
        """Test that security settings are properly loaded."""
        # Assert
        assert settings.secret_key is not None
        assert len(settings.secret_key) > 10  # Should be reasonably long
        assert settings.access_token_expire_minutes > 0


class TestSecurityEdgeCases:
    """Test edge cases and error conditions in security functions."""

    def test_verify_password_with_none_values(self):
        """Test password verification with None values."""
        # Arrange
        plain_password = "testpassword"
        hashed_password = get_password_hash(plain_password)
        
        # Act & Assert - None values should be handled gracefully
        try:
            result = verify_password(None, hashed_password)
            assert result is False
        except (TypeError, ValueError):
            # If the library throws an exception, that's also acceptable behavior
            pass
            
        try:
            result = verify_password(plain_password, None)
            assert result is False
        except (TypeError, ValueError):
            pass
            
        try:
            result = verify_password(None, None)
            assert result is False
        except (TypeError, ValueError):
            pass

    def test_create_token_with_empty_data(self):
        """Test token creation with empty data."""
        # Arrange
        empty_data = {}
        
        # Act
        token = create_access_token(data=empty_data)
        
        # Assert
        assert token is not None
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert "exp" in payload
        # Note: Our JWT implementation doesn't include 'iat' by default

    def test_create_token_with_additional_claims(self):
        """Test token creation with additional custom claims."""
        # Arrange
        data = {
            "sub": "user@example.com",
            "role": "admin",
            "permissions": ["read", "write", "delete"],
            "custom_field": "custom_value"
        }
        
        # Act
        token = create_access_token(data=data)
        
        # Assert
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert payload["sub"] == "user@example.com"
        assert payload["role"] == "admin"
        assert payload["permissions"] == ["read", "write", "delete"]
        assert payload["custom_field"] == "custom_value"
        
        # Verify token can still be verified normally
        decoded_email = verify_token(token)
        assert decoded_email == "user@example.com"
