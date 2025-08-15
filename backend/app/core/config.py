"""
Application Configuration and Settings Management

This module manages all application configuration including environment variables,
database settings, security keys, and application metadata. It provides a centralized
way to access configuration values and handles both development and production environments.

Key Features:
- Environment-based configuration (dev/prod)
- Database path management for different platforms
- Security settings (JWT, tokens, etc.)
- Automatic data directory creation
- Support for .env file configuration

Classes:
- Settings: Main configuration class with Pydantic validation
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional
import os
import sys
from pathlib import Path

def get_data_directory():
    """Get the appropriate directory for storing application data."""
    if getattr(sys, 'frozen', False):  # Running as exe (PyInstaller)
        # For exe: use %APPDATA%\SwatchX on Windows
        if os.name == 'nt':  # Windows
            data_dir = Path(os.getenv('APPDATA', '')) / 'SwatchX'
        else:  # Linux/Mac
            data_dir = Path.home() / '.swatchx'
    else:  # Development mode
        data_dir = Path('./data')
    
    # Create directory if it doesn't exist
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir

class Settings(BaseSettings):
    app_name: str = "SwatchX API"
    debug: bool = True
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    @property
    def database_url(self) -> str:
        """Get database URL with appropriate path for development or production."""
        data_dir = get_data_directory()
        db_path = data_dir / 'swatchx.db'
        return f"sqlite:///{db_path}"
    
    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"  # Allow extra fields for backward compatibility
    )

settings = Settings()
