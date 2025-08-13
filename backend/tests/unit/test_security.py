"""
Unit tests for security utilities (password hashing, JWT tokens).
"""
import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token
)
from app.core.config import settings


@pytest.mark.unit
class TestPasswordSecurity:
    """Test password hashing and verification."""

    def test_password_hashing(self):
        """Test password is properly hashed."""
        password = "MySecurePassword123!"
        hashed = get_password_hash(password)
        
        # Hash should not equal the original password
        assert hashed != password
        
        # Hash should be non-empty string
        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_password_verification_success(self):
        """Test correct password verification."""
        password = "MySecurePassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Test incorrect password verification."""
        password = "MySecurePassword123!"
        wrong_password = "WrongPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False

    def test_same_password_different_hashes(self):
        """Test that same password produces different hashes (salt)."""
        password = "MySecurePassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Different hashes due to salt
        assert hash1 != hash2
        
        # Both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


@pytest.mark.unit
class TestJWTSecurity:
    """Test JWT token creation and verification."""

    def test_create_access_token(self):
        """Test JWT token creation."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token can be decoded
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload

    def test_create_access_token_with_expiration(self):
        """Test JWT token creation with custom expiration."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta)
        
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # Check expiration is set correctly (within 1 minute tolerance)
        exp_timestamp = payload["exp"]
        expected_exp = datetime.now(timezone.utc) + expires_delta
        actual_exp = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        
        time_diff = abs((actual_exp - expected_exp).total_seconds())
        assert time_diff < 60  # Within 1 minute tolerance

    def test_verify_token_success(self):
        """Test successful token verification."""
        email = "test@example.com"
        data = {"sub": email}
        token = create_access_token(data)
        
        verified_email = verify_token(token)
        assert verified_email == email

    def test_verify_token_invalid_token(self):
        """Test verification of invalid token."""
        invalid_token = "invalid.token.here"
        
        result = verify_token(invalid_token)
        assert result is None

    def test_verify_token_wrong_secret(self):
        """Test token verification with wrong secret."""
        data = {"sub": "test@example.com"}
        # Create token with different secret
        wrong_token = jwt.encode(data, "wrong_secret", algorithm=settings.algorithm)
        
        result = verify_token(wrong_token)
        assert result is None

    def test_verify_token_expired(self):
        """Test verification of expired token."""
        data = {"sub": "test@example.com"}
        # Create token that expired 1 hour ago
        expires_delta = timedelta(hours=-1)
        expired_token = create_access_token(data, expires_delta)
        
        result = verify_token(expired_token)
        assert result is None

    def test_verify_token_missing_subject(self):
        """Test verification of token without subject."""
        data = {"not_sub": "test@example.com"}  # Wrong key
        token = jwt.encode(data, settings.secret_key, algorithm=settings.algorithm)
        
        result = verify_token(token)
        assert result is None

    def test_token_algorithm_consistency(self):
        """Test that tokens use the configured algorithm."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        # Decode without specifying algorithm to check header
        unverified_payload = jwt.get_unverified_header(token)
        assert unverified_payload["alg"] == settings.algorithm
