# SwatchX Testing Documentation

## Overview

This document provides comprehensive information about the testing infrastructure for SwatchX, a fleet expense tracking application. The testing suite includes unit tests, integration tests, security tests, performance tests, and end-to-end tests to ensure robust application quality.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Configuration](#test-configuration)
- [Coverage Reports](#coverage-reports)
- [Security Testing](#security-testing)
- [Performance Testing](#performance-testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Strategy

### Test Pyramid

Our testing strategy follows the test pyramid approach:

1. **Unit Tests (70%)**: Fast, isolated tests for individual components and functions
2. **Integration Tests (20%)**: Tests for component interactions and API endpoints
3. **End-to-End Tests (10%)**: Full user flow tests across the entire application

### Testing Principles

- **Fast Feedback**: Tests run quickly to provide immediate feedback
- **Reliable**: Tests are deterministic and don't produce false positives/negatives
- **Maintainable**: Tests are easy to read, write, and maintain
- **Comprehensive**: Tests cover both happy path and edge cases
- **Realistic**: Tests simulate real user scenarios and environments

## Test Structure

```
SwatchX/
├── backend/
│   ├── tests/
│   │   ├── unit/                     # Unit tests
│   │   │   ├── test_comprehensive_models.py
│   │   │   └── test_comprehensive_security.py
│   │   ├── integration/              # Integration tests
│   │   │   ├── test_auth_endpoints.py
│   │   │   ├── test_expense_endpoints.py
│   │   │   └── test_management_endpoints.py
│   │   ├── security/                 # Security tests
│   │   │   └── test_comprehensive_security.py
│   │   ├── performance/              # Performance tests
│   │   │   ├── test_api_performance.py
│   │   │   └── test_comprehensive_performance.py
│   │   └── conftest.py               # Pytest configuration and fixtures
│   ├── pyproject.toml               # Python project configuration
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   └── test/
│   │       ├── components/           # Component tests
│   │       │   └── ExpenseList.comprehensive.test.tsx
│   │       ├── pages/                # Page tests
│   │       │   ├── LoginPage.test.tsx
│   │       │   └── SignupPage.test.tsx
│   │       ├── hooks/                # Hook tests
│   │       ├── utils/                # Utility tests
│   │       ├── setup.ts              # Test setup and configuration
│   │       └── mockHandlers.ts       # MSW mock API handlers
│   ├── vitest.config.ts             # Vitest configuration
│   └── package.json                 # Node.js dependencies
├── e2e/
│   ├── swatchx.spec.ts              # End-to-end test scenarios
│   ├── global-setup.ts              # E2E test setup
│   └── global-teardown.ts           # E2E test cleanup
├── playwright.config.ts             # Playwright configuration
└── test_pie_endpoint.py             # Quick API test script
```

## Running Tests

### Backend Tests

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term

# Run specific test types
pytest tests/unit/                    # Unit tests only
pytest tests/integration/             # Integration tests only
pytest tests/security/               # Security tests only
pytest tests/performance/            # Performance tests only

# Run specific test file
pytest tests/unit/test_comprehensive_models.py

# Run tests with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

### Frontend Tests

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test ExpenseList.test.tsx

# Run tests with UI
npm run test:ui
```

### End-to-End Tests

```powershell
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test e2e/swatchx.spec.ts

# Debug tests
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### Performance/Load Tests

```powershell
# Navigate to backend directory
cd backend

# Install locust
pip install locust

# Run load tests
locust -f locustfile.py --host=http://localhost:8000

# Run headless load test
locust -f locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 300s --headless
```

## Test Configuration

### Backend Configuration (`pyproject.toml`)

```toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "-ra -q --strict-markers --strict-config"
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
markers = [
    "unit: Unit tests",
    "integration: Integration tests", 
    "security: Security tests",
    "performance: Performance tests",
    "slow: Slow running tests"
]

[tool.coverage.run]
source = ["app"]
omit = ["*/tests/*", "*/venv/*", "*/__pycache__/*"]

[tool.coverage.report]
precision = 2
show_missing = true
skip_covered = false
```

### Frontend Configuration (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### E2E Configuration (`playwright.config.ts`)

Key configuration options:
- Multiple browser support (Chrome, Firefox, Safari, Edge)
- Mobile device testing
- Video recording on failures
- Screenshot capture
- Parallel test execution
- Test retry on failures

## Coverage Reports

### Viewing Coverage Reports

**Backend:**
```powershell
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Open coverage report
start backend/htmlcov/index.html
```

**Frontend:**
```powershell
# Generate coverage report
npm run test:coverage

# Open coverage report
start frontend/coverage/index.html
```

### Coverage Thresholds

- **Backend**: 85% minimum coverage required
- **Frontend**: 80% minimum coverage required
- **Critical paths**: 95% coverage required (authentication, payment processing)

## Security Testing

### Automated Security Tests

1. **SQL Injection Prevention**
   - Tests parameterized queries
   - Validates input sanitization
   - Checks for data leakage

2. **Authentication & Authorization**
   - JWT token validation
   - Password hashing verification
   - Role-based access control

3. **Data Isolation**
   - User data segregation
   - Multi-tenant security
   - Cross-user data access prevention

4. **Input Validation**
   - XSS prevention
   - CSRF protection
   - File upload security

### Manual Security Testing Checklist

- [ ] **Authentication Testing**
  - [ ] Test password complexity requirements
  - [ ] Test account lockout mechanisms
  - [ ] Test session management
  - [ ] Test logout functionality
  - [ ] Test remember me functionality

- [ ] **Authorization Testing**
  - [ ] Test role-based permissions
  - [ ] Test direct object references
  - [ ] Test privilege escalation attempts
  - [ ] Test horizontal access controls
  - [ ] Test vertical access controls

- [ ] **Input Validation Testing**
  - [ ] Test SQL injection in all input fields
  - [ ] Test XSS in text inputs and displays
  - [ ] Test file upload restrictions
  - [ ] Test input length limits
  - [ ] Test special character handling

- [ ] **Session Management Testing**
  - [ ] Test session timeout
  - [ ] Test concurrent sessions
  - [ ] Test session fixation
  - [ ] Test session invalidation

- [ ] **Data Security Testing**
  - [ ] Test sensitive data exposure
  - [ ] Test data encryption at rest
  - [ ] Test data transmission security
  - [ ] Test backup security
  - [ ] Test log security

### Security Scanning Tools

```powershell
# Backend security scanning
pip install bandit safety

# Run bandit security linter
bandit -r app/

# Check for known vulnerabilities
safety check

# Frontend dependency vulnerability check
npm audit

# Fix vulnerabilities
npm audit fix
```

## Performance Testing

### Backend Performance Tests

1. **Response Time Tests**
   - API endpoints respond under 200ms
   - Database queries complete under 100ms
   - File uploads process efficiently

2. **Concurrency Tests**
   - Handle 100+ concurrent users
   - Maintain performance under load
   - Graceful degradation testing

3. **Resource Usage Tests**
   - Memory consumption monitoring
   - CPU usage optimization
   - Database connection pooling

### Frontend Performance Tests

1. **Page Load Tests**
   - Initial page load under 3 seconds
   - Time to interactive under 5 seconds
   - Largest contentful paint optimization

2. **Runtime Performance**
   - Smooth animations (60fps)
   - Efficient re-rendering
   - Memory leak prevention

### Load Testing

```powershell
# Start load test with Locust
locust -f locustfile.py --host=http://localhost:8000

# Access Locust web UI
# Open http://localhost:8089 in browser

# Configure test parameters:
# - Number of users: 100
# - Spawn rate: 10 users/second
# - Duration: 300 seconds (5 minutes)
```

## Best Practices

### Writing Good Tests

1. **Clear Test Names**
   ```python
   def test_expense_creation_with_valid_data_should_return_201():
       # Test implementation
   ```

2. **Arrange-Act-Assert Pattern**
   ```python
   def test_user_login():
       # Arrange
       user = create_test_user()
       
       # Act
       response = client.post("/auth/login", json={
           "email": user.email,
           "password": "password"
       })
       
       # Assert
       assert response.status_code == 200
       assert "access_token" in response.json()
   ```

3. **Independent Tests**
   - Tests should not depend on each other
   - Use fresh test data for each test
   - Clean up after test execution

4. **Realistic Test Data**
   - Use realistic data patterns
   - Test edge cases and boundaries
   - Include invalid data scenarios

### Test Maintenance

1. **Regular Test Review**
   - Remove obsolete tests
   - Update tests for new features
   - Refactor duplicated test code

2. **Flaky Test Management**
   - Identify and fix unstable tests
   - Use proper wait conditions
   - Avoid time-based assertions

3. **Test Documentation**
   - Document test purpose and scope
   - Explain complex test scenarios
   - Maintain test data documentation

## Troubleshooting

### Common Issues

**Backend Tests Failing:**
```powershell
# Check database connection
python backend/check_db_location.py

# Reset test database
rm backend/data/swatchx_test.db
pytest tests/integration/test_auth_endpoints.py::test_database_setup
```

**Frontend Tests Failing:**
```powershell
# Clear node modules and reinstall
rm -rf frontend/node_modules
rm frontend/package-lock.json
npm install

# Clear test cache
npm run test:clear-cache
```

**E2E Tests Failing:**
```powershell
# Update browser versions
npx playwright install

# Check server availability
curl http://localhost:8000/health
curl http://localhost:5173

# Run tests in debug mode
npx playwright test --debug
```

**Performance Issues:**
```powershell
# Profile backend performance
python -m cProfile -o profile_output.prof app/main.py

# Analyze database queries
# Enable SQL logging in development

# Monitor frontend performance
# Use browser dev tools Performance tab
```

### Environment Issues

**Database Connection:**
```powershell
# Check database file exists
ls -la backend/data/

# Check database permissions
# Ensure read/write access to data directory

# Reset database schema
python backend/migrate_*.py
```

**Dependency Issues:**
```powershell
# Backend dependencies
pip install -r backend/requirements.txt --upgrade

# Frontend dependencies
cd frontend && npm install --force

# Clear pip cache
pip cache purge
```

### Getting Help

1. **Check test output and logs**
2. **Review error messages carefully**
3. **Consult documentation for testing frameworks**
4. **Run tests in verbose mode for more details**
5. **Use debugger to step through failing tests**

## Continuous Integration

### GitHub Actions Integration

Tests are configured to run automatically on:
- Pull request creation
- Push to main branch
- Scheduled daily runs

### Test Reporting

- **Coverage reports** uploaded to codecov
- **Test results** displayed in PR comments
- **Performance metrics** tracked over time
- **Security scan results** reviewed automatically

---

For additional help or questions about testing, please refer to the individual test files or create an issue in the project repository.
