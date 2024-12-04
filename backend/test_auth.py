import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from routers.auth import router, get_current_user, SECRET_KEY, ALGORITHM  # Import necessary items
from database import get_db
from fastapi import FastAPI, Depends, Response, status

from jose import jwt
from datetime import datetime, timedelta

# Import all models to register them with Base
import models
from models import Base, User  # Now Base includes all models

# Use a file-based SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"

# Create the test database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Initialize the FastAPI app and include the router
app = FastAPI()
app.include_router(router)

# Override dependencies
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)


def test_signup_success():
    response = client.post(
        "/signup",
        data={
            "email": "user@example.com",
            "password": "strongpassword",
            "name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == True  # Assuming default role is user

def test_signup_existing_email():
    # Sign up the first time
    client.post(
        "/signup",
        data={
            "email": "user@example.com",
            "password": "strongpassword",
            "name": "Test User"
        }
    )
    # Attempt to sign up again with the same email
    response = client.post(
        "/signup",
        data={
            "email": "user@example.com",
            "password": "anotherpassword",
            "name": "Another User"
        }
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

def test_signup_missing_fields():
    response = client.post(
        "/signup",
        data={
            "email": "user@example.com",
            # Missing password and name
        }
    )
    assert response.status_code == 422  # Unprocessable Entity

def test_login_success():
    # First, sign up a user
    client.post(
        "/signup",
        data={
            "email": "user@example.com",
            "password": "strongpassword",
            "name": "Test User"
        }
    )
    # Now, attempt to log in
    response = client.post(
        "/login",
        data={
            "email": "user@example.com",
            "password": "strongpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == True

def test_login_wrong_password():
    # First, sign up a user
    client.post(
        "/signup",
        data={
            "email": "user@example.com",
            "password": "strongpassword",
            "name": "Test User"
        }
    )
    # Attempt to log in with wrong password
    response = client.post(
        "/login",
        data={
            "email": "user@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Incorrect email or password"}
    assert response.headers["www-authenticate"] == "Bearer"

def test_login_nonexistent_user():
    response = client.post(
        "/login",
        data={
            "email": "nonexistent@example.com",
            "password": "anyPassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Incorrect email or password"}
    assert response.headers["www-authenticate"] == "Bearer"



def test_invalid_token():
    # Add a protected route for testing
    @app.get("/protected")
    def protected_route(current_user: User = Depends(get_current_user)):
        return {"email": current_user.Email}

    # Access the protected route with an invalid token
    response = client.get(
        "/protected",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Could not validate credentials"}
    assert response.headers["www-authenticate"] == "Bearer"

def test_expired_token():
    # Create a token that is already expired
    expired_token = jwt.encode(
        {"sub": "some_user_id", "exp": datetime.utcnow() - timedelta(minutes=1)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    # Add a protected route for testing
    @app.get("/protected")
    def protected_route(current_user: User = Depends(get_current_user)):
        return {"email": current_user.Email}

    # Access the protected route with the expired token
    response = client.get(
        "/protected",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {"detail": "Could not validate credentials"}
    assert response.headers["www-authenticate"] == "Bearer"
