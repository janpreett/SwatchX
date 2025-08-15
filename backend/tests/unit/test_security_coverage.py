"""
Additional security tests to improve coverage.
"""

import pytest
from datetime import datetime, timedelta, timezone
from app.core.security import (
    create_access_token,
    verify_token,
    get_password_hash,
    verify_password
)
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError, JWTClaimsError
from app.core.config import settings


@pytest.mark.unit
class TestSecurityFunctionsCoverage:
    """Additional tests for security functions."""

    def test_create_access_token_with_custom_expiration(self):
        """Test token creation with custom expiration."""
        # Arrange
        data = {"sub": "testuser@example.com", "role": "admin"}
        custom_delta = timedelta(hours=2)
        
        # Act
        token = create_access_token(data=data, expires_delta=custom_delta)
        
        # Assert
        assert token is not None
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert payload["sub"] == "testuser@example.com"
        assert payload["role"] == "admin"
        
        # Verify expiration time
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        time_diff = exp_time - now
        
        # Should be approximately 2 hours
        assert 7100 <= time_diff.total_seconds() <= 7300  # Allow some variance

    def test_create_access_token_default_expiration(self):
        """Test token creation with default expiration."""
        # Arrange
        data = {"sub": "defaultuser@example.com"}
        
        # Act
        token = create_access_token(data=data)
        
        # Assert
        assert token is not None
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        
        # Verify default expiration (15 minutes)
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        time_diff = exp_time - now
        
        # Should be approximately 15 minutes
        assert 800 <= time_diff.total_seconds() <= 1000

    def test_create_access_token_empty_data(self):
        """Test token creation with minimal data."""
        # Arrange
        data = {}
        
        # Act
        token = create_access_token(data=data)
        
        # Assert
        assert token is not None
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert "exp" in payload

    def test_create_access_token_complex_data(self):
        """Test token creation with complex data structures."""
        # Arrange
        data = {
            "sub": "complex@example.com",
            "permissions": ["read", "write", "admin"],
            "metadata": {
                "department": "IT",
                "level": 5
            },
            "scopes": "read:users write:users admin:system"
        }
        
        # Act
        token = create_access_token(data=data)
        
        # Assert
        assert token is not None
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert payload["sub"] == "complex@example.com"
        assert payload["permissions"] == ["read", "write", "admin"]
        assert payload["metadata"]["department"] == "IT"

    def test_verify_token_valid(self):
        """Test token verification with valid token."""
        # Arrange
        data = {"sub": "verify@example.com", "role": "user"}
        token = create_access_token(data=data)
        
        # Act
        email = verify_token(token)
        
        # Assert
        assert email is not None
        assert email == "verify@example.com"

    def test_verify_token_invalid(self):
        """Test token verification with invalid token."""
        # Arrange
        invalid_token = "invalid.token.here"
        
        # Act
        result = verify_token(invalid_token)
        
        # Assert - Should return None for invalid tokens
        assert result is None

    def test_verify_token_expired(self):
        """Test token verification with expired token."""
        # Arrange - Create token that expires immediately
        data = {"sub": "expired@example.com"}
        expired_delta = timedelta(seconds=-1)  # Already expired
        expired_token = create_access_token(data=data, expires_delta=expired_delta)
        
        # Act
        result = verify_token(expired_token)
        
        # Assert - Should return None for expired tokens
        assert result is None

    def test_verify_token_wrong_signature(self):
        """Test token verification with wrong signature."""
        # Arrange - Create token with different secret
        wrong_secret = "wrong_secret_key"
        data = {"sub": "wrong@example.com"}
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        wrong_token = jwt.encode(to_encode, wrong_secret, algorithm="HS256")
        
        # Act
        result = verify_token(wrong_token)
        
        # Assert - Should return None for invalid signature
        assert result is None

    def test_password_hashing_consistency(self):
        """Test password hashing produces consistent results."""
        # Arrange
        password = "testpassword123"
        
        # Act
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Assert - Hashes should be different (due to salt) but both should verify
        assert hash1 != hash2  # Different due to random salt
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_password_verification_wrong_password(self):
        """Test password verification with wrong password."""
        # Arrange
        correct_password = "correct123"
        wrong_password = "wrong456"
        hashed = get_password_hash(correct_password)
        
        # Act & Assert
        assert verify_password(correct_password, hashed) is True
        assert verify_password(wrong_password, hashed) is False

    def test_password_verification_empty_strings(self):
        """Test password verification with empty strings."""
        # Arrange
        empty_password = ""
        normal_password = "normal123"
        
        # Act
        empty_hash = get_password_hash(empty_password)
        normal_hash = get_password_hash(normal_password)
        
        # Assert
        assert verify_password(empty_password, empty_hash) is True
        assert verify_password(empty_password, normal_hash) is False
        assert verify_password(normal_password, empty_hash) is False

    def test_password_special_characters(self):
        """Test password handling with special characters."""
        # Arrange
        special_passwords = [
            "password!@#$%^&*()",
            "pássword123",  # Unicode
            "pass\nword",   # Newline
            "pass\tword",   # Tab
            "pass word",    # Space
        ]
        
        # Act & Assert
        for password in special_passwords:
            hashed = get_password_hash(password)
            assert verify_password(password, hashed) is True
            assert verify_password(password + "x", hashed) is False

    def test_password_length_extremes(self):
        """Test password handling with extreme lengths."""
        # Arrange
        short_password = "a"
        long_password = "a" * 1000
        
        # Act & Assert
        short_hash = get_password_hash(short_password)
        long_hash = get_password_hash(long_password)
        
        assert verify_password(short_password, short_hash) is True
        assert verify_password(long_password, long_hash) is True
        assert verify_password(short_password, long_hash) is False
        assert verify_password(long_password, short_hash) is False

    def test_token_with_future_expiration(self):
        """Test token with far future expiration."""
        # Arrange
        data = {"sub": "future@example.com"}
        future_delta = timedelta(days=365)  # 1 year
        
        # Act
        token = create_access_token(data=data, expires_delta=future_delta)
        
        # Assert
        assert token is not None
        email = verify_token(token)
        assert email == "future@example.com"
        
        # Verify far future expiration by decoding payload directly
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        time_diff = exp_time - now
        
        # Should be approximately 1 year
        assert 31500000 <= time_diff.total_seconds() <= 31600000  # ~1 year in seconds

    def test_token_algorithm_verification(self):
        """Test token uses correct algorithm."""
        # Arrange
        data = {"sub": "algo@example.com"}
        token = create_access_token(data=data)
        
        # Act - Try to decode with wrong algorithm should fail
        try:
            jwt.decode(token, settings.secret_key, algorithms=["HS512"])  # Wrong algorithm
            assert False, "Should have failed with wrong algorithm"
        except JWTError:
            pass  # Expected
        
        # Should work with correct algorithm
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        assert payload["sub"] == "algo@example.com"

    def test_concurrent_token_creation(self):
        """Test concurrent token creation."""
        import threading
        tokens = []
        errors = []
        
        def create_token(index):
            try:
                data = {"sub": f"concurrent{index}@example.com", "index": index}
                token = create_access_token(data=data)
                tokens.append(token)
            except Exception as e:
                errors.append(e)
        
        # Create tokens concurrently
        threads = []
        for i in range(10):
            thread = threading.Thread(target=create_token, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for completion
        for thread in threads:
            thread.join()
        
        # Verify all tokens were created successfully
        assert len(errors) == 0
        assert len(tokens) == 10
        
        # Verify all tokens are unique and valid
        token_set = set(tokens)
        assert len(token_set) == 10  # All tokens should be unique
        
        for token in tokens:
            email = verify_token(token)
            assert email is not None
            assert "@example.com" in email
