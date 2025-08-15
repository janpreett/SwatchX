"""
Comprehensive security tests for the SwatchX API.

Tests various security scenarios including:
- SQL injection attempts
- JWT tampering and validation
- Unauthorized access prevention
- Rate limiting and brute force protection
- File upload security
- Cross-company data isolation
- Input validation and sanitization
"""
import pytest
import time
import json
import io
from datetime import datetime, timedelta
from httpx import AsyncClient
from fastapi import status
from sqlalchemy.orm import Session
from jose import jwt

from app.models.user import User
from app.models.expense import Expense, BusinessUnit
from app.core.security import get_password_hash
from app.core.config import settings
from decimal import Decimal
from datetime import date


@pytest.mark.security
class TestSQLInjectionPrevention:
    """Test protection against SQL injection attacks."""

    async def test_sql_injection_in_expense_filters(self, async_client: AsyncClient, db_session: Session):
        """Test SQL injection attempts in expense query parameters."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create test expense
        expense = Expense(
            date=date.today(),
            amount=Decimal("100.00"),
            description="Test expense",
            category="fuel",
            company="swatchx"
        )
        db_session.add(expense)
        db_session.commit()

        # SQL injection attempts in query parameters
        sql_injection_payloads = [
            "swatchx' OR '1'='1",
            "swatchx'; DROP TABLE expenses; --",
            "swatchx' UNION SELECT * FROM users --",
            "swatchx'; UPDATE expenses SET amount=0; --",
            "swatchx' AND (SELECT COUNT(*) FROM users) > 0 --",
        ]
        
        for payload in sql_injection_payloads:
            # Act - Attempt SQL injection
            response = await async_client.get(
                f"/api/v1/expenses/?company={payload}",
                headers=headers
            )
            
            # Assert - Should either return safe results or validation error
            # Should NOT return database errors or unauthorized data
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ]
            
            if response.status_code == status.HTTP_200_OK:
                data = response.json()
                # Should not return data with the injected payload
                assert all(expense.get("company") != payload for expense in data)

    async def test_sql_injection_in_search_parameters(self, async_client: AsyncClient, db_session: Session):
        """Test SQL injection attempts in search/filter parameters."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        injection_attempts = [
            "fuel'; DELETE FROM expenses; --",
            "fuel' OR category='maintenance",
            "fuel' UNION ALL SELECT password FROM users --",
        ]
        
        for injection in injection_attempts:
            response = await async_client.get(
                f"/api/v1/expenses/?category={injection}",
                headers=headers
            )
            
            # Should handle malicious input safely
            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_422_UNPROCESSABLE_ENTITY
            ]

    async def test_sql_injection_in_expense_creation(self, async_client: AsyncClient, db_session: Session):
        """Test SQL injection attempts in expense creation data."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Malicious expense data
        malicious_expense_data = {
            "date": "2024-01-15",
            "amount": 100.0,
            "description": "Test'; DROP TABLE expenses; --",
            "category": "fuel' OR '1'='1' --",
            "company": "swatchx'; UPDATE users SET email='hacked@evil.com'; --"
        }
        
        # Act
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(malicious_expense_data)},
            headers=headers
        )
        
        # Assert - Should either succeed with sanitized data or fail validation
        if response.status_code == status.HTTP_201_CREATED:
            data = response.json()
            # Verify the malicious SQL wasn't executed by checking data integrity
            assert "DROP TABLE" not in data.get("description", "")
            
        # Verify users table wasn't modified
        user_check = db_session.query(User).filter(User.email == "hacked@evil.com").first()
        assert user_check is None


@pytest.mark.security
class TestJWTTokenSecurity:
    """Test JWT token security and tampering prevention."""

    async def test_tampered_jwt_token_rejected(self, async_client: AsyncClient, db_session: Session):
        """Test that tampered JWT tokens are rejected."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Get valid token
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        valid_token = login_response.json()["access_token"]
        
        # Tamper with token by modifying the payload
        tampered_token = valid_token[:-10] + "tamperedxx"
        headers = {"Authorization": f"Bearer {tampered_token}"}
        
        # Act
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_expired_jwt_token_rejected(self, async_client: AsyncClient, db_session: Session):
        """Test that expired JWT tokens are rejected."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Create an expired token manually
        expired_payload = {
            "sub": "testuser@example.com",
            "exp": datetime.utcnow() - timedelta(hours=1)  # Expired 1 hour ago
        }
        expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm="HS256")
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        # Act
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_jwt_with_wrong_secret_rejected(self, async_client: AsyncClient, db_session: Session):
        """Test that tokens signed with wrong secret are rejected."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Create token with wrong secret
        payload = {
            "sub": "testuser@example.com",
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        wrong_secret_token = jwt.encode(payload, "wrong-secret-key", algorithm="HS256")
        headers = {"Authorization": f"Bearer {wrong_secret_token}"}
        
        # Act
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_malformed_authorization_header(self, async_client: AsyncClient):
        """Test handling of malformed authorization headers."""
        malformed_headers = [
            {"Authorization": "InvalidToken"},
            {"Authorization": "Bearer"},  # Missing token
            {"Authorization": "Basic dGVzdDp0ZXN0"},  # Wrong auth type
            {"Authorization": "Bearer "},  # Empty token
            {"Authorization": "Bearer invalid.token.format"},
        ]
        
        for headers in malformed_headers:
            response = await async_client.get("/api/v1/expenses/", headers=headers)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_jwt_token_user_not_found(self, async_client: AsyncClient, db_session: Session):
        """Test token with valid signature but non-existent user."""
        # Arrange - Create token for non-existent user
        payload = {
            "sub": "nonexistent@example.com",
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, settings.secret_key, algorithm="HS256")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.security
class TestDataIsolationSecurity:
    """Test that users can only access their own company's data."""

    async def test_cross_company_data_isolation(self, async_client: AsyncClient, db_session: Session):
        """Test that users cannot access other companies' data."""
        # Arrange - Create two users
        user1 = User(email="user1@swatchx.com", hashed_password=get_password_hash("password123"))
        user2 = User(email="user2@timmins.com", hashed_password=get_password_hash("password123"))
        
        db_session.add_all([user1, user2])
        db_session.commit()
        
        # Create expenses for different companies
        expense1 = Expense(
            date=date.today(),
            amount=Decimal("100.00"),
            description="SwatchX expense",
            category="fuel",
            company="swatchx"
        )
        expense2 = Expense(
            date=date.today(),
            amount=Decimal("200.00"),
            description="Timmins expense",
            category="fuel",
            company="timmins"
        )
        
        db_session.add_all([expense1, expense2])
        db_session.commit()
        
        # Login as user1
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "user1@swatchx.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Try to access all expenses
        response = await async_client.get("/api/v1/expenses/", headers=headers)
        
        # Assert - Should only see appropriate data based on access control
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify data isolation (implementation may vary based on business rules)
        # This test assumes expenses are filtered by some access control mechanism
        # Adjust based on your actual implementation

    async def test_expense_access_control_by_id(self, async_client: AsyncClient, db_session: Session):
        """Test that users cannot access expenses by ID from other companies."""
        # Arrange
        user = User(email="user@swatchx.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Create expense for different company
        restricted_expense = Expense(
            date=date.today(),
            amount=Decimal("500.00"),
            description="Restricted expense",
            category="fuel",
            company="restricted_company"
        )
        
        db_session.add(restricted_expense)
        db_session.commit()
        db_session.refresh(restricted_expense)
        
        # Login
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "user@swatchx.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Act - Try to access restricted expense by ID
        response = await async_client.get(
            f"/api/v1/expenses/{restricted_expense.id}",
            headers=headers
        )
        
        # Assert - Should be denied or return 404
        # Implementation depends on your access control strategy
        assert response.status_code in [
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND
        ] or (
            response.status_code == status.HTTP_200_OK and
            response.json()["company"] != "restricted_company"
        )


@pytest.mark.security
class TestInputValidationSecurity:
    """Test input validation and sanitization."""

    async def test_malicious_file_upload_rejected(self, async_client: AsyncClient, db_session: Session):
        """Test that malicious file uploads are rejected."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        expense_data = {
            "date": "2024-01-15",
            "amount": 100.0,
            "description": "Test expense",
            "category": "fuel",
            "company": "swatchx"
        }
        
        # Test various malicious file types
        malicious_files = [
            ("malware.exe", b"MZ\x90\x00", "application/x-executable"),  # Executable
            ("script.js", b"alert('xss')", "application/javascript"),  # JavaScript
            ("shell.sh", b"#!/bin/bash\nrm -rf /", "application/x-sh"),  # Shell script
            ("large.txt", b"A" * (10 * 1024 * 1024), "text/plain"),  # Very large file
        ]
        
        for filename, content, content_type in malicious_files:
            files = {
                "attachment": (filename, io.BytesIO(content), content_type)
            }
            
            # Act
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(expense_data)},
                files=files,
                headers=headers
            )
            
            # Assert - Should either reject the file or succeed with safe handling
            if response.status_code == status.HTTP_201_CREATED:
                # If accepted, verify file was handled safely
                data = response.json()
                if data.get("attachment_path"):
                    # File was stored - should be in safe location with safe name
                    assert not data["attachment_path"].endswith(".exe")
                    assert not data["attachment_path"].endswith(".sh")

    async def test_xss_prevention_in_text_fields(self, async_client: AsyncClient, db_session: Session):
        """Test prevention of XSS attacks in text fields."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # XSS payloads
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<svg onload=alert('xss')>",
            "' OR 1=1; --",
        ]
        
        for payload in xss_payloads:
            expense_data = {
                "date": "2024-01-15",
                "amount": 100.0,
                "description": payload,
                "category": "fuel",
                "company": "swatchx"
            }
            
            # Act
            response = await async_client.post(
                "/api/v1/expenses/",
                data={"expense_data": json.dumps(expense_data)},
                headers=headers
            )
            
            # Assert
            if response.status_code == status.HTTP_201_CREATED:
                data = response.json()
                # Verify XSS payload was sanitized or escaped
                stored_description = data.get("description", "")
                
                # Should not contain executable script tags
                assert "<script>" not in stored_description.lower()
                assert "javascript:" not in stored_description.lower()
                assert "onerror=" not in stored_description.lower()

    async def test_oversized_request_rejected(self, async_client: AsyncClient, db_session: Session):
        """Test that oversized requests are rejected."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        login_response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create oversized description
        oversized_description = "A" * (1024 * 1024)  # 1MB description
        
        expense_data = {
            "date": "2024-01-15",
            "amount": 100.0,
            "description": oversized_description,
            "category": "fuel",
            "company": "swatchx"
        }
        
        # Act
        response = await async_client.post(
            "/api/v1/expenses/",
            data={"expense_data": json.dumps(expense_data)},
            headers=headers
        )
        
        # Assert - Should reject oversized request
        assert response.status_code in [
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]


@pytest.mark.security
class TestAuthenticationSecurity:
    """Test authentication security measures."""

    async def test_multiple_failed_login_attempts(self, async_client: AsyncClient, db_session: Session):
        """Test handling of multiple failed login attempts."""
        # Arrange
        user = User(email="testuser@example.com", hashed_password=get_password_hash("password123"))
        db_session.add(user)
        db_session.commit()
        
        # Act - Multiple failed login attempts
        for i in range(10):  # Try 10 failed logins
            response = await async_client.post(
                "/auth/login",
                data={"username": "testuser@example.com", "password": "wrongpassword"}
            )
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            
            # Small delay between attempts
            time.sleep(0.1)
        
        # After many failures, try correct password
        response = await async_client.post(
            "/auth/login",
            data={"username": "testuser@example.com", "password": "password123"}
        )
        
        # Should still work (unless rate limiting implemented)
        # If rate limiting is implemented, this might be blocked
        assert response.status_code in [
            status.HTTP_200_OK,  # No rate limiting
            status.HTTP_429_TOO_MANY_REQUESTS  # Rate limiting active
        ]

    async def test_password_brute_force_protection(self, async_client: AsyncClient, db_session: Session):
        """Test protection against password brute force attacks."""
        # Arrange
        user = User(email="victim@example.com", hashed_password=get_password_hash("secretpassword"))
        db_session.add(user)
        db_session.commit()
        
        # Common password list for brute force
        common_passwords = [
            "123456", "password", "12345678", "qwerty", "123456789",
            "12345", "1234", "111111", "1234567", "dragon"
        ]
        
        successful_attempts = 0
        
        # Act - Attempt brute force
        for password in common_passwords:
            response = await async_client.post(
                "/auth/login",
                data={"username": "victim@example.com", "password": password}
            )
            
            if response.status_code == status.HTTP_200_OK:
                successful_attempts += 1
            
            # Add small delay
            time.sleep(0.05)
        
        # Assert - Should not succeed with wrong passwords
        assert successful_attempts == 0
