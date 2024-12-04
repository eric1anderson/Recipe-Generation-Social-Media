from fastapi import APIRouter, Request, Response, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from database import get_db
from models import User
import json
import uuid


# Initialize the API router
router = APIRouter()

# Set up password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = "your_secret_key"  # Replace with a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def generate_uuid():
    # Generate a unique identifier for a new user
    return str(uuid.uuid4())

def verify_password(plain_password, hashed_password):
    # Verify if the provided password matches the hashed password
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    # Create a JWT access token with an expiration time

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    # Encode the token with the secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post('/signup')
def signup(
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    db: Session = Depends(get_db)
):
    # Check if the email is already registered
    user = db.query(User).filter_by(Email=email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash the password
    hashed_password = get_password_hash(password)
    # Create a new user instance
    new_user = User(
        UserID = generate_uuid(),
        Email=email,
        Password=hashed_password,
        Name=name,
        Role=True  # Default role is user; change as needed
    )
    # Add the user to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Create an access token for the new user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.UserID)}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.Role
    }

@router.post('/login')
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Retrieve the user from the database based on the email
    user = db.query(User).filter_by(Email=email).first()
    # Verify the password and check if the user exists
    if user and verify_password(password, user.Password):
        # Create an access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.UserID)}, expires_delta=access_token_expires
        )
        # Return the access token, token type, user role, and name
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user.Role,
            "name": user.Name
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Exception to be raised if credentials are invalid
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT token to retrieve the user ID
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
    # Fetch the user from the database using the user ID
    user = db.query(User).filter_by(UserID=user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.get('/auth/verify')
def verify_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    
    return {
        "user_id": user.UserID,
        "role": user.Role,
        "email": user.Email,
    }
