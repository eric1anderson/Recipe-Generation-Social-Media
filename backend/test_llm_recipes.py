import os
import tempfile
import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db
from models import User, Recipe
from routers.auth import get_password_hash  # Import your password hashing function

# Create a temporary database file
db_fd, db_path = tempfile.mkstemp(suffix=".db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

# Replace with valid test credentials
TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "password123"

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    os.close(db_fd)
    os.remove(db_path)

@pytest.fixture(scope="module")
def create_test_user():
    db = TestingSessionLocal()
    user = db.query(User).filter_by(Email=TEST_USER_EMAIL).first()
    if not user:
        hashed_password = get_password_hash(TEST_USER_PASSWORD)
        user = User(
            Email=TEST_USER_EMAIL,
            Password=hashed_password,
            Role=True,
            Name="Test User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def test_login(create_test_user):
    """
    Test user login and token retrieval.
    """
    response = client.post(
        "/login",
        data={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_generate_recipe(create_test_user):
    """
    Test generating a new recipe using LLM.
    """
    # Log in to get the token
    response = client.post(
        "/login",
        data={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    data = response.json()
    token = data["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/generate-recipe",
        params={
            "question": "Create a recipe for a chocolate cake",
            "ingredients": ["chocolate", "flour", "sugar"],
            "dietary_restrictions": ["None"]
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert "title" in data
    assert "content" in data

def test_generate_recipe_without_prompt(create_test_user):
    """
    Test generating a recipe without a prompt.
    """
    # Log in to get the token
    response = client.post(
        "/login",
        data={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    data = response.json()
    token = data["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/generate-recipe", json={"question": "", "ingredients": ["chocolate", "flour", "sugar"], "dietary_restrictions": []}, headers=headers)
    assert response.status_code == 400
    assert response.json() == {"detail": "Prompt is required."}

def test_generate_recipe_unauthorized():
    """
    Test generating a recipe without logging in.
    """
    response = client.post("/generate-recipe", json={"question": "Create a recipe for a chocolate cake", "ingredients": ["chocolate", "flour", "sugar"], "dietary_restrictions": []})
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}