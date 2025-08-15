from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.config import settings
from ..models.user import User
from ..schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    SecurityQuestionsSetup, SecurityQuestionsResponse, 
    PasswordResetRequest, PasswordResetVerify, PasswordChangeRequest,
    SecurityQuestionUpdate
)

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    from ..core.security import verify_token
    email = verify_token(token)
    if email is None:
        raise credentials_exception
        
    user = get_user(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def user_has_security_questions(user: User) -> bool:
    """Check if user has set up security questions"""
    return (
        user.security_question_1 is not None and user.security_answer_1_hash is not None and
        user.security_question_2 is not None and user.security_answer_2_hash is not None and
        user.security_question_3 is not None and user.security_answer_3_hash is not None
    )

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists (case-insensitive)
    db_user = get_user(db, email=user.email.lower())
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email.lower(),
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    # Include security questions status in response
    user_response = UserResponse.model_validate(db_user)
    user_response.has_security_questions = user_has_security_questions(db_user)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user_obj = authenticate_user(db, form_data.username.lower(), form_data.password)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    # Include security questions status in response
    user_response = UserResponse.model_validate(user_obj)
    user_response.has_security_questions = user_has_security_questions(user_obj)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    user_response = UserResponse.model_validate(current_user)
    user_response.has_security_questions = user_has_security_questions(current_user)
    return user_response

@router.post("/security-questions", response_model=dict)
def setup_security_questions(
    questions_data: SecurityQuestionsSetup,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set up security questions for password reset"""
    
    # Hash the answers
    current_user.security_question_1 = questions_data.questions[0].question
    current_user.security_answer_1_hash = get_password_hash(questions_data.questions[0].answer)
    current_user.security_question_2 = questions_data.questions[1].question
    current_user.security_answer_2_hash = get_password_hash(questions_data.questions[1].answer)
    current_user.security_question_3 = questions_data.questions[2].question
    current_user.security_answer_3_hash = get_password_hash(questions_data.questions[2].answer)
    
    db.commit()
    
    return {"message": "Security questions set up successfully"}

@router.get("/security-questions", response_model=SecurityQuestionsResponse)
def get_security_questions(current_user: User = Depends(get_current_user)):
    """Get current user's security questions (without answers)"""
    return SecurityQuestionsResponse(
        question_1=current_user.security_question_1,
        question_2=current_user.security_question_2,
        question_3=current_user.security_question_3,
        has_security_questions=user_has_security_questions(current_user)
    )

@router.put("/security-questions", response_model=dict)
def update_security_questions(
    questions_data: SecurityQuestionsSetup,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update security questions"""
    
    # Hash the new answers
    current_user.security_question_1 = questions_data.questions[0].question
    current_user.security_answer_1_hash = get_password_hash(questions_data.questions[0].answer)
    current_user.security_question_2 = questions_data.questions[1].question
    current_user.security_answer_2_hash = get_password_hash(questions_data.questions[1].answer)
    current_user.security_question_3 = questions_data.questions[2].question
    current_user.security_answer_3_hash = get_password_hash(questions_data.questions[2].answer)
    
    db.commit()
    
    return {"message": "Security questions updated successfully"}

@router.put("/security-questions/individual", response_model=dict)
def update_individual_security_question(
    question_data: SecurityQuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an individual security question with password verification"""
    
    # Verify current password
    if not verify_password(question_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update the specific question and answer
    if question_data.question_index == 0:
        current_user.security_question_1 = question_data.question
        current_user.security_answer_1_hash = get_password_hash(question_data.answer)
    elif question_data.question_index == 1:
        current_user.security_question_2 = question_data.question
        current_user.security_answer_2_hash = get_password_hash(question_data.answer)
    elif question_data.question_index == 2:
        current_user.security_question_3 = question_data.question
        current_user.security_answer_3_hash = get_password_hash(question_data.answer)
    
    db.commit()
    
    return {"message": f"Security question {question_data.question_index + 1} updated successfully"}

@router.post("/password/change", response_model=dict)
def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user"""
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/password/reset-request", response_model=SecurityQuestionsResponse)
def request_password_reset(reset_request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset - returns security questions if user has them"""
    
    user = get_user(db, email=reset_request.email)
    if not user:
        # Don't reveal if email exists or not
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="If this email is registered and has security questions set up, they will be displayed."
        )
    
    if not user_has_security_questions(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No security questions found for this account. Please contact support."
        )
    
    return SecurityQuestionsResponse(
        question_1=user.security_question_1,
        question_2=user.security_question_2,
        question_3=user.security_question_3,
        has_security_questions=True
    )

@router.post("/password/reset-verify", response_model=dict)
def verify_password_reset(reset_data: PasswordResetVerify, db: Session = Depends(get_db)):
    """Verify security answers and reset password"""
    
    user = get_user(db, email=reset_data.email)
    if not user or not user_has_security_questions(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset request"
        )
    
    # Verify all security answers
    if not (
        verify_password(reset_data.answers[0], user.security_answer_1_hash) and
        verify_password(reset_data.answers[1], user.security_answer_2_hash) and
        verify_password(reset_data.answers[2], user.security_answer_3_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more security answers are incorrect"
        )
    
    # Reset password
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}
