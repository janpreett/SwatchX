from pydantic import BaseModel, field_validator, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    confirm_password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if len(v) > 254:
            raise ValueError('Email address is too long')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&)')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v

class SecurityQuestion(BaseModel):
    question: str
    answer: str
    current_password: str
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Security question must be at least 10 characters long')
        if len(v) > 500:
            raise ValueError('Security question is too long')
        return v.strip()
    
    @field_validator('answer')
    @classmethod
    def validate_answer(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Security answer must be at least 2 characters long')
        if len(v) > 100:
            raise ValueError('Security answer is too long')
        return v.strip().lower()  # Store answers in lowercase for consistent comparison

    @field_validator('current_password')
    @classmethod
    def validate_current_password(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Current password is required')
        return v.strip()

class SecurityQuestionUpdate(BaseModel):
    question: str
    answer: str
    current_password: str
    question_index: int
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Security question must be at least 10 characters long')
        if len(v) > 500:
            raise ValueError('Security question is too long')
        return v.strip()
    
    @field_validator('answer')
    @classmethod
    def validate_answer(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Security answer must be at least 2 characters long')
        if len(v) > 100:
            raise ValueError('Security answer is too long')
        return v.strip().lower()

    @field_validator('current_password')
    @classmethod
    def validate_current_password(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Current password is required')
        return v.strip()

    @field_validator('question_index')
    @classmethod
    def validate_question_index(cls, v):
        if v not in [0, 1, 2]:
            raise ValueError('Question index must be 0, 1, or 2')
        return v

class SecurityQuestionsSetup(BaseModel):
    questions: List[SecurityQuestion]
    
    @field_validator('questions')
    @classmethod
    def validate_questions(cls, v):
        if len(v) != 3:
            raise ValueError('Exactly 3 security questions are required')
        
        # Check for duplicate questions
        questions = [q.question.lower() for q in v]
        if len(set(questions)) != len(questions):
            raise ValueError('All security questions must be unique')
        
        return v

class SecurityQuestionsResponse(BaseModel):
    question_1: Optional[str] = None
    question_2: Optional[str] = None
    question_3: Optional[str] = None
    has_security_questions: bool = False

class PasswordResetRequest(BaseModel):
    email: EmailStr
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return v.lower()

class PasswordResetVerify(BaseModel):
    email: EmailStr
    answers: List[str]
    new_password: str
    confirm_password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return v.lower()
    
    @field_validator('answers')
    @classmethod
    def validate_answers(cls, v):
        if len(v) != 3:
            raise ValueError('All 3 security answers are required')
        return [answer.strip().lower() for answer in v]
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&)')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password is too long')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&)')
        return v
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return v.lower()

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    has_security_questions: bool = False
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
