# SwatchX Development Guide

## 🚀 Getting Started (3 Easy Options)

### Option 1: NPM Script (Recommended for developers)
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start both servers simultaneously
npm run dev
```

### Option 2: Platform Scripts
```bash
# Windows
start.bat              # Command prompt
# or
.\start.ps1             # PowerShell

# Linux/macOS  
./start.sh
```

### Option 3: Manual (Two terminals)
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📝 Development Workflow

1. **Start Development**: Use any of the options above
2. **Access Application**: 
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:8000
   - API Docs: http://127.0.0.1:8000/docs

3. **Make Changes**: 
   - Both servers support hot reload
   - Frontend changes reflect immediately
   - Backend changes trigger automatic restart

4. **Test Features**:
   - Create account with strong password
   - Login and access home page
   - Verify authentication flow

## 🔧 Development Commands

```bash
# Root directory commands
npm run dev              # Start both servers
npm run dev:frontend     # Start only frontend  
npm run dev:backend      # Start only backend
npm run install:all      # Install all dependencies
npm run build           # Build frontend for production

# Frontend specific (cd frontend)
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Backend specific (cd backend)  
python -m uvicorn app.main:app --reload    # Start with hot reload
python -m uvicorn app.main:app             # Start normally
```

## 🛠 Tech Stack Details

### Frontend Architecture
- **React 18** with functional components and hooks
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Mantine v7** for UI components and styling
- **React Router v6** for client-side routing
- **@mantine/form** for form validation

### Backend Architecture  
- **FastAPI** with async/await support
- **SQLAlchemy 2.0** with declarative models
- **Pydantic v2** for data validation and serialization
- **SQLite** database with automatic setup
- **JWT** authentication with secure token handling
- **bcrypt** password hashing

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

## 🔐 Authentication Flow

1. **Signup**: Email validation + password complexity requirements
2. **Password Hashing**: bcrypt with salt rounds
3. **JWT Token**: Secure token generation with expiration
4. **Frontend Storage**: localStorage for token persistence
5. **Protected Routes**: Automatic redirect for unauthenticated users

## 📁 Code Organization

```
SwatchX/
├── frontend/src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx     # AppShell layout with navbar
│   │   └── ProtectedRoute.tsx
│   ├── pages/             # Route-based page components
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── HomePage.tsx
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.ts
│   └── services/          # API communication layer
│       └── auth.ts
├── backend/app/
│   ├── models/            # SQLAlchemy database models
│   │   └── user.py
│   ├── schemas/           # Pydantic request/response schemas
│   │   └── user.py
│   ├── routers/           # FastAPI route handlers
│   │   └── auth.py
│   └── core/              # Configuration and utilities
│       ├── config.py      # Environment-based settings
│       ├── database.py    # Database connection setup
│       └── security.py    # JWT and password utilities
```

## 🎨 UI/UX Guidelines

### Mantine Best Practices
- Use `Container` for content width management
- Use `Flex` and `Grid` for layouts
- Use `AppShell` for application structure  
- Use built-in responsive props (`span={{ base: 12, md: 6 }}`)
- Follow Mantine's spacing system (`xs`, `sm`, `md`, `lg`, `xl`)

### Component Patterns
- Functional components with TypeScript
- Custom hooks for business logic
- Context for global state management
- Service layer for API calls

## 🚀 Performance Optimizations

### Frontend
- Vite for fast hot module replacement
- React 18 concurrent features
- Mantine's tree-shaking for smaller bundles
- Responsive images and lazy loading ready

### Backend
- FastAPI's async performance  
- SQLAlchemy connection pooling
- Pydantic validation caching
- JWT stateless authentication

## 🔍 Debugging Tips

### Frontend Issues
```bash
# Check browser console for errors
# Use React Developer Tools
# Inspect network tab for API calls
```

### Backend Issues  
```bash
# Check terminal output for FastAPI logs
# Visit http://127.0.0.1:8000/docs for API testing
# Use Python debugger (pdb) if needed
```

### Database Issues
```bash
# Database file location: data/swatchx.db
# Reset database: delete the file and restart
# Use SQLite browser tools for inspection
```

Happy coding! 🎉
