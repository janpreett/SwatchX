"""
User Database Model

This module defines the User model for authentication and user management.
It includes user profile information, security questions for password reset,
and authentication-related fields.

Fields:
- id: Primary key identifier
- email: Unique email address for login
- name: User's display name
- hashed_password: Bcrypt-hashed password
- is_active: Account status flag
- created_at/updated_at: Automatic timestamps
- security_questions: Three security questions for password reset

The model supports secure authentication with JWT tokens and includes
security question functionality for account recovery.
"""

from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Security questions for password reset
    security_question_1 = Column(String(500), nullable=True)
    security_answer_1_hash = Column(String(255), nullable=True)
    security_question_2 = Column(String(500), nullable=True)
    security_answer_2_hash = Column(String(255), nullable=True)
    security_question_3 = Column(String(500), nullable=True)
    security_answer_3_hash = Column(String(255), nullable=True)
