"""
SwatchX FastAPI Application Entry Point

This is the main application module that initializes the FastAPI application,
configures middleware, includes routers, and sets up the core application
structure. It serves as the central hub for all API functionality.

Features:
- FastAPI application initialization
- CORS middleware configuration
- Database table creation
- Router inclusion (auth, expenses)
- Health check endpoints
- API documentation setup

The application provides a RESTful API for expense management with
authentication, file handling, and comprehensive expense tracking.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routers.auth import router as auth_router
from .routers.expenses import router as expenses_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwatchX API",
    description="A full-stack web application API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],  # Include both possible Vite ports and common dev ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(expenses_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to SwatchX API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
