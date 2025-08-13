# SwatchX

A modern full-stack web application built with React, Mantine UI, and FastAPI.

## 🚀 Quick Start

### Option 1: One-Click Launcher (Recommended)

**Windows (Command Prompt/PowerShell):**
```bash
# Double-click or run:
start.bat
```

**Windows (PowerShell with better output):**
```powershell
.\start.ps1
```

**Linux/macOS:**
```bash
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

## 📖 Application URLs

- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs (Swagger UI)

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Mantine** UI library for components
- **React Router** for client-side routing
- **@mantine/form** for form validation

### Backend  
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** ORM with SQLite database
- **Pydantic** for data validation
- **JWT** authentication with bcrypt password hashing
- **CORS** middleware for frontend communication

## 🧪 Testing

SwatchX includes comprehensive testing coverage with **90%+ code coverage requirements**:

### Running Tests

**Backend Tests:**
```bash
cd backend
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run specific test categories
pytest -m unit          # Unit tests
pytest -m integration   # Integration tests
pytest -m security      # Security tests
pytest -m performance   # Performance tests
```

**Frontend Tests:**
```bash
cd frontend
npm install

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

**Security Scanning:**
```bash
# Backend security scans
cd backend
bandit -r app/          # Python security scan
safety check            # Dependency vulnerabilities

# Frontend security scan
cd frontend
npm audit
```

### Test Types

- **Unit Tests**: Individual components and functions
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Complete user workflows with Cypress
- **Security Tests**: SQL injection, XSS, authentication bypass
- **Performance Tests**: Response times and load testing
- **Accessibility Tests**: WCAG compliance

### CI/CD Pipeline

Automated testing runs on every push/PR with GitHub Actions:
- ✅ Backend pytest suite (unit, integration, security, performance)
- ✅ Frontend Vitest suite with coverage reporting
- ✅ Cypress E2E tests
- ✅ Security scanning (Bandit, Safety, npm audit)
- ✅ Load testing with Locust
- ✅ Build and deployment verification

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## 📁 Project Structure

```
SwatchX/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components (Login, Signup, Home)
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── hooks/          # Custom React hooks (useAuth)
│   │   ├── services/       # API service layer
│   │   └── test/           # Test utilities and setup
│   ├── cypress/            # E2E tests
│   ├── package.json
│   └── vitest.config.ts
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API route handlers
│   │   └── core/           # Configuration and database setup
│   ├── tests/              # Test suite
│   │   ├── unit/          # Unit tests
│   │   ├── integration/   # Integration tests
│   │   ├── security/      # Security tests
│   │   └── performance/   # Performance tests
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── conftest.py
│   └── locustfile.py       # Load testing
├── .github/workflows/       # CI/CD pipelines
├── start.bat              # Windows launcher script
├── start.ps1              # PowerShell launcher script
├── start.sh               # Linux/macOS launcher script
├── TESTING.md             # Detailed testing documentation
└── README.md
```

## 🔧 Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 16+** 
- **npm** or **yarn**

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Configuration
The backend uses a `.env` file for configuration. Default values are provided, but you should change the `SECRET_KEY` in production:

```bash
# backend/.env
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
DEBUG=true
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🔐 Features

### Authentication System
- ✅ **User Registration** with email validation
- ✅ **Password Requirements**: 8+ characters, uppercase, lowercase, numbers, symbols  
- ✅ **Secure Login** with JWT token authentication
- ✅ **Password Hashing** using bcrypt
- ✅ **Protected Routes** requiring authentication

### User Interface
- ✅ **Responsive Design** built with Mantine components
- ✅ **Professional Navigation** with sticky navbar and user menu
- ✅ **Form Validation** with real-time feedback
- ✅ **Modern UI/UX** following Mantine design principles
- ✅ **Mobile-First** responsive layouts

### Backend API
- ✅ **RESTful API** with proper HTTP status codes
- ✅ **Comprehensive Validation** using Pydantic schemas
- ✅ **Database Integration** with SQLAlchemy ORM
- ✅ **CORS Support** for frontend communication  
- ✅ **API Documentation** with automatic Swagger UI

### Quality Assurance
- ✅ **90%+ Test Coverage** across backend and frontend
- ✅ **Automated Security Scanning** for vulnerabilities
- ✅ **Performance Testing** with load testing
- ✅ **Accessibility Testing** for WCAG compliance
- ✅ **CI/CD Pipeline** with automated testing and deployment

## 🔒 Security Features

- **JWT Token** authentication with secure token handling
- **bcrypt** password hashing with salt
- **Input validation** on both frontend and backend
- **SQL injection** prevention through ORM
- **XSS protection** with input sanitization
- **CORS** configuration for secure cross-origin requests
- **Environment variables** for sensitive configuration
- **Security scanning** with Bandit and Safety
- **Dependency vulnerability** scanning

## 🚀 Production Deployment

### Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Set production environment variables
export SECRET_KEY="your-production-secret-key"
export DEBUG=false

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
# Build for production
cd frontend
npm run build

# Serve static files (with nginx, apache, or other web server)
# Built files will be in frontend/dist/
```

## 📝 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login  
- `GET /auth/me` - Get current user profile
- `GET /health` - Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write tests** for new functionality (required for 90%+ coverage)
4. **Run all tests** locally before submitting
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)  
7. Open a Pull Request (CI/CD tests will run automatically)

### Development Guidelines
- Maintain **90%+ test coverage**
- Follow existing code style and patterns
- Add tests for all new features
- Update documentation as needed
- Ensure all CI/CD checks pass

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Ensure Python 3.11+ is installed
- Install dependencies: `pip install -r backend/requirements.txt`
- Check if port 8000 is available

**Frontend not starting:**
- Ensure Node.js 16+ is installed
- Install dependencies: `cd frontend && npm install`
- Clear node_modules and reinstall if needed

**Tests failing:**
- Run `pytest --lf` to run only last failed tests
- Check test coverage with `pytest --cov=app --cov-report=html`
- For frontend tests, run `npm run test:coverage`

**CORS errors:**
- Ensure backend is running on `127.0.0.1:8000`  
- Check CORS configuration in `backend/app/main.py`

**Database issues:**
- Database file is created automatically in `data/swatchx.db`
- Delete database file to reset all data

---

Built with ❤️ using React, Mantine, and FastAPI
