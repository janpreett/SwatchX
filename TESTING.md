# Testing Documentation

This document provides comprehensive information about the testing setup for SwatchX.

## Overview

SwatchX has a complete testing suite covering:

- **Backend**: Unit, integration, security, and performance tests
- **Frontend**: Unit, integration, and end-to-end tests
- **Security**: Automated vulnerability scanning
- **Performance**: Load testing and response time validation
- **Accessibility**: WCAG compliance testing

## Test Coverage Requirements

All code must maintain **90%+ test coverage** at all times. The CI/CD pipeline will fail if coverage drops below this threshold.

## Running Tests Locally

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m security      # Security tests only
pytest -m performance   # Performance tests only

# Run with coverage report
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run tests in parallel (faster)
pytest -n auto
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless
```

### Security Scanning

```bash
# Backend security scans
cd backend
bandit -r app/          # Python security scan
safety check            # Dependency vulnerability scan

# Frontend security scan
cd frontend
npm audit               # Node.js dependency scan
```

### Load Testing

```bash
# Start backend server
cd backend
uvicorn app.main:app --reload

# Run load tests (in another terminal)
locust -f locustfile.py --host=http://localhost:8000

# Or run headless load tests
locust -f locustfile.py --headless --users 100 --spawn-rate 10 --run-time 5m --host=http://localhost:8000
```

## Test Structure

### Backend Tests (`backend/tests/`)

```
tests/
├── __init__.py
├── unit/
│   ├── __init__.py
│   ├── test_models.py      # User model and schema tests
│   └── test_security.py    # Password hashing and JWT tests
├── integration/
│   ├── __init__.py
│   └── test_auth_endpoints.py  # API endpoint tests
├── security/
│   ├── __init__.py
│   └── test_security_vulnerabilities.py  # SQL injection, XSS tests
└── performance/
    ├── __init__.py
    └── test_api_performance.py  # Response time and load tests
```

### Frontend Tests (`frontend/src/test/`)

```
src/test/
├── setup.ts              # Test configuration
├── utils/
│   ├── test-utils.tsx    # Custom render with providers
│   └── mocks.ts          # MSW API mocks
├── components/           # Component unit tests
├── pages/
│   ├── SignupPage.test.tsx
│   └── LoginPage.test.tsx
├── hooks/                # Custom hook tests
└── utils/                # Utility function tests
```

### E2E Tests (`frontend/cypress/`)

```
cypress/
├── e2e/
│   ├── auth-flow.cy.ts       # Authentication flow tests
│   └── accessibility.cy.ts   # Accessibility tests
└── support/
    ├── commands.ts           # Custom Cypress commands
    └── e2e.ts               # Global test setup
```

## Test Categories

### Unit Tests
- Test individual functions, components, and classes in isolation
- Mock external dependencies
- Fast execution (< 1 second per test)
- High coverage of business logic

### Integration Tests
- Test interactions between components
- Test API endpoints with real database (in-memory SQLite)
- Test React components with full provider tree
- Moderate execution time (< 5 seconds per test)

### End-to-End Tests
- Test complete user workflows
- Test real browser interactions
- Test across multiple pages and components
- Slower execution (< 30 seconds per test)

### Security Tests
- SQL injection protection
- XSS vulnerability scanning
- Authentication bypass attempts
- Input validation testing

### Performance Tests
- Response time validation
- Concurrent request handling
- Database query performance
- Memory usage patterns

## Writing New Tests

### Backend Test Example

```python
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

@pytest.mark.integration
async def test_signup_success(async_client: AsyncClient, db_session: Session):
    """Test successful user signup."""
    signup_data = {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "confirm_password": "SecurePass123!"
    }
    
    response = await async_client.post("/auth/signup", json=signup_data)
    
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
```

### Frontend Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { SignupPage } from '../../pages/SignupPage'

describe('SignupPage', () => {
  it('submits form with valid data', async () => {
    const mockSignup = vi.fn().mockResolvedValue(undefined)
    
    render(<SignupPage />)
    
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled()
    })
  })
})
```

### E2E Test Example

```typescript
describe('Authentication Flow', () => {
  it('should successfully sign up a new user', () => {
    cy.visit('/signup')
    
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('SecurePass123!')
    cy.get('[data-testid="confirm-password-input"]').type('SecurePass123!')
    cy.get('[data-testid="terms-checkbox"]').check()
    cy.get('[data-testid="signup-submit-button"]').click()
    
    cy.get('[data-testid="success-message"]').should('be.visible')
    cy.url().should('include', '/login')
  })
})
```

## Test Data Management

### Fixtures
- Use pytest fixtures for backend test data
- Create reusable user, token, and database fixtures
- Ensure test isolation with fresh data for each test

### Mocking
- Mock external API calls
- Mock authentication tokens
- Mock file uploads and external services
- Use MSW for frontend API mocking

### Test Databases
- Backend uses in-memory SQLite for speed
- Each test gets a fresh database instance
- No shared state between tests

## Continuous Integration

### GitHub Actions Workflow
The CI/CD pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Stages
1. **Backend Tests**: Unit, integration, security, performance
2. **Frontend Tests**: Unit, integration, linting
3. **Security Scans**: Bandit, Safety, npm audit
4. **E2E Tests**: Full application workflow testing
5. **Load Tests**: Performance under load (main branch only)
6. **Build & Deploy**: Production deployment (main branch only)

### Pipeline Requirements
- All tests must pass
- Coverage must be ≥ 90%
- Security scans must show no high/critical vulnerabilities
- E2E tests must pass in headless mode

## Best Practices

### Test Naming
- Use descriptive test names that explain the scenario
- Follow the pattern: `should [expected behavior] when [condition]`
- Use `test_` prefix for backend tests

### Test Organization
- Group related tests in the same file
- Use `describe` blocks to group related functionality
- Keep tests focused and atomic

### Assertions
- Use specific assertions (not just truthy/falsy)
- Test both positive and negative cases
- Include edge cases and error conditions

### Test Data
- Use realistic but anonymous test data
- Avoid hardcoded values where possible
- Clean up test data after each test

### Performance
- Keep tests fast and focused
- Use mocks to avoid external dependencies
- Run tests in parallel when possible

## Debugging Tests

### Backend Debugging
```bash
# Run specific test with verbose output
pytest tests/unit/test_models.py::TestUserModel::test_user_creation -v -s

# Add breakpoint in test
import pdb; pdb.set_trace()

# Run with coverage to see what's not tested
pytest --cov=app --cov-report=html
```

### Frontend Debugging
```bash
# Run specific test file
npm test SignupPage.test.tsx

# Run with debugging output
npm test -- --verbose

# Open browser for E2E debugging
npm run test:e2e  # Opens Cypress UI
```

## Maintenance

### Regular Tasks
- Update test dependencies monthly
- Review and update security scan thresholds
- Add tests for new features immediately
- Refactor tests when code changes

### Monitoring
- Monitor test execution times
- Track test coverage trends
- Review security scan results
- Monitor E2E test flakiness

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library Documentation](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
