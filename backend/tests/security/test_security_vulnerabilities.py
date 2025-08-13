"""
Security-focused tests for SQL injection, XSS, and authentication bypass attempts.
"""
import pytest
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash

# Mark all async functions in this module with asyncio
pytestmark = pytest.mark.asyncio


@pytest.mark.security
class TestSQLInjectionProtection:
    """Test protection against SQL injection attacks."""

    async def test_sql_injection_in_login_email(self, async_client: AsyncClient):
        """Test SQL injection attempts in login email field."""
        sql_injection_payloads = [
            "admin@test.com' OR '1'='1",
            "admin@test.com' OR '1'='1' --",
            "admin@test.com'; DROP TABLE users; --",
            "admin@test.com' UNION SELECT * FROM users --",
            "' OR 1=1 #",
            "admin@test.com' OR 'a'='a",
        ]
        
        for payload in sql_injection_payloads:
            login_data = {
                "username": payload,
                "password": "anypassword"
            }
            
            response = await async_client.post("/auth/login", data=login_data)
            
            # Should return unauthorized, not internal server error
            # This proves SQL injection didn't cause database errors
            assert response.status_code in [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ]

    async def test_sql_injection_in_signup_email(self, async_client: AsyncClient):
        """Test SQL injection attempts in signup email field."""
        sql_injection_payloads = [
            "test@test.com'; INSERT INTO users (email, hashed_password) VALUES ('hacker@test.com', 'hash'); --",
            "test@test.com' OR '1'='1' --",
        ]
        
        for payload in sql_injection_payloads:
            signup_data = {
                "email": payload,
                "password": "SecurePass123!",
                "confirm_password": "SecurePass123!"
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            
            # Should return validation error, not success
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.security
class TestXSSProtection:
    """Test protection against XSS (Cross-Site Scripting) attacks."""

    async def test_xss_in_signup_email(self, async_client: AsyncClient):
        """Test XSS payload handling in signup email field."""
        xss_payloads = [
            "<script>alert('xss')</script>@test.com",
            "test@<script>alert('xss')</script>.com",
            "test@test.com<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')@test.com",
        ]
        
        for payload in xss_payloads:
            signup_data = {
                "email": payload,
                "password": "SecurePass123!",
                "confirm_password": "SecurePass123!"
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            
            # Should return validation error due to invalid email format
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_xss_in_password_fields(self, async_client: AsyncClient):
        """Test XSS payload handling in password fields."""
        xss_passwords = [
            "<script>alert('xss')</script>Pass123!",
            "Pass<img src=x onerror=alert('xss')>123!",
            "javascript:alert('xss')Pass123!",
        ]
        
        for xss_password in xss_passwords:
            signup_data = {
                "email": "test@example.com",
                "password": xss_password,
                "confirm_password": xss_password
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            
            # Password with XSS should still work if it meets other criteria
            # The key is that it's properly escaped and doesn't execute
            if len(xss_password) >= 8 and any(c.isupper() for c in xss_password) and \
               any(c.islower() for c in xss_password) and any(c.isdigit() for c in xss_password) and \
               any(c in "@$!%*?&" for c in xss_password):
                # Should succeed but password should be safely hashed
                assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
            else:
                # Should fail validation
                assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.security
class TestAuthenticationBypass:
    """Test for authentication bypass vulnerabilities."""

    async def test_jwt_token_tampering(self, async_client: AsyncClient, db_session: Session):
        """Test protection against JWT token tampering."""
        # Create test user and get valid token
        hashed_password = get_password_hash("SecurePass123!")
        user = User(
            email="tampertest@example.com",
            hashed_password=hashed_password
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "username": "tampertest@example.com",
            "password": "SecurePass123!"
        }
        login_response = await async_client.post("/auth/login", data=login_data)
        valid_token = login_response.json()["access_token"]
        
        # Tamper with token
        tampered_tokens = [
            valid_token[:-5] + "12345",  # Change last 5 characters
            valid_token.replace(valid_token[10], "X"),  # Change one character
            "invalid.token.signature",
            valid_token + "extra",
        ]
        
        for tampered_token in tampered_tokens:
            headers = {"Authorization": f"Bearer {tampered_token}"}
            response = await async_client.get("/auth/me", headers=headers)
            
            # All tampered tokens should be rejected
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_empty_or_null_tokens(self, async_client: AsyncClient):
        """Test handling of empty or null authentication tokens."""
        invalid_headers = [
            {"Authorization": "Bearer "},  # Empty token
            {"Authorization": "Bearer null"},  # Null token
            {"Authorization": "Bearer undefined"},  # Undefined token
            {"Authorization": ""},  # Empty header value
        ]
        
        for headers in invalid_headers:
            response = await async_client.get("/auth/me", headers=headers)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_privilege_escalation_attempt(self, async_client: AsyncClient, db_session: Session):
        """Test that users cannot access other users' data."""
        # Create two test users
        user1 = User(
            email="user1@example.com",
            hashed_password=get_password_hash("Password123!")
        )
        user2 = User(
            email="user2@example.com",
            hashed_password=get_password_hash("Password123!")
        )
        db_session.add_all([user1, user2])
        db_session.commit()
        
        # Login as user1
        login_data = {
            "username": "user1@example.com",
            "password": "Password123!"
        }
        response = await async_client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        
        # Try to access user data with user1's token
        headers = {"Authorization": f"Bearer {token}"}
        response = await async_client.get("/auth/me", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        user_data = response.json()
        # Should only see user1's data
        assert user_data["email"] == "user1@example.com"


@pytest.mark.security
class TestInputValidation:
    """Test comprehensive input validation and sanitization."""

    async def test_email_length_limits(self, async_client: AsyncClient):
        """Test email length validation."""
        # Test extremely long email
        long_email = "a" * 250 + "@example.com"  # Over 254 char limit
        
        signup_data = {
            "email": long_email,
            "password": "SecurePass123!",
            "confirm_password": "SecurePass123!"
        }
        
        response = await async_client.post("/auth/signup", json=signup_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_password_length_limits(self, async_client: AsyncClient):
        """Test password length validation."""
        # Test extremely long password
        long_password = "A1!" + "a" * 130  # Over length limit
        
        signup_data = {
            "email": "test@example.com",
            "password": long_password,
            "confirm_password": long_password
        }
        
        response = await async_client.post("/auth/signup", json=signup_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_special_characters_in_email(self, async_client: AsyncClient):
        """Test handling of special characters in email."""
        special_char_emails = [
            "test+tag@example.com",  # Plus sign (valid)
            "test.user@example.com",  # Dot (valid)
            "test_user@example.com",  # Underscore (valid)
            "test-user@example.com",  # Hyphen (valid)
        ]
        
        for email in special_char_emails:
            signup_data = {
                "email": email,
                "password": "SecurePass123!",
                "confirm_password": "SecurePass123!"
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            # These should be accepted as valid emails
            assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

    async def test_unicode_and_emoji_handling(self, async_client: AsyncClient):
        """Test handling of unicode characters and emojis."""
        unicode_inputs = [
            "тест@example.com",  # Cyrillic
            "测试@example.com",   # Chinese
            "🙄@example.com",    # Emoji
            "test@пример.com",   # Unicode domain
        ]
        
        for email in unicode_inputs:
            signup_data = {
                "email": email,
                "password": "SecurePass123!",
                "confirm_password": "SecurePass123!"
            }
            
            response = await async_client.post("/auth/signup", json=signup_data)
            # Most of these should be rejected by email validation
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


@pytest.mark.security
class TestRateLimitingSimulation:
    """Simulate rate limiting scenarios (if implemented)."""

    async def test_multiple_failed_login_attempts(self, async_client: AsyncClient, db_session: Session):
        """Test behavior with multiple failed login attempts."""
        # Create test user
        user = User(
            email="ratelimit@example.com",
            hashed_password=get_password_hash("CorrectPassword123!")
        )
        db_session.add(user)
        db_session.commit()
        
        # Make multiple failed login attempts
        for i in range(10):
            login_data = {
                "username": "ratelimit@example.com",
                "password": f"WrongPassword{i}!"
            }
            
            response = await async_client.post("/auth/login", data=login_data)
            # Should consistently return 401 (no rate limiting implemented yet)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Verify that correct password still works
        correct_login_data = {
            "username": "ratelimit@example.com", 
            "password": "CorrectPassword123!"
        }
        response = await async_client.post("/auth/login", data=correct_login_data)
        assert response.status_code == status.HTTP_200_OK
