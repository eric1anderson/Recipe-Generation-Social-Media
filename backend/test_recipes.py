import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db
from models import User, Recipe, Ingredient
from routers.auth import get_password_hash  # Import your password hashing function

# Create a new database URL for testing
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create the test database engine
engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the dependency override
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Replace with valid test credentials
TEST_USER_EMAIL = "testuser5@example.com"
TEST_USER_PASSWORD = "password123"

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="session")
def create_test_user():
    db = TestingSessionLocal()
    user = db.query(User).filter_by(Email=TEST_USER_EMAIL).first()
    if not user:
        user = User(
            Email=TEST_USER_EMAIL,
            Password=get_password_hash(TEST_USER_PASSWORD),
            Role=False,
            Name="Test User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user

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

def test_create_recipe(create_test_user):
    """
    Test creating a new recipe.
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
    response = client.post("/recipes", json={"title": "Test Recipe", "content": "Test Content"}, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Recipe created successfully."

def test_read_all_recipes(create_test_user):
    """
    Test retrieving all user recipes.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Test Recipe",
        UserID=create_test_user.UserID,
        RecipeContent="Test Content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

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
    response = client.get("/recipesall", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_read_recipe_by_id(create_test_user):
    """
    Test retrieving a recipe by ID.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Test Recipe",
        UserID=create_test_user.UserID,
        RecipeContent="Test Content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

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
    response = client.get(f"/recipes/{recipe.RecipeID}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["RecipeName"] == "Test Recipe"

def test_update_recipe(create_test_user):
    """
    Test updating a recipe.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Old Recipe",
        UserID=create_test_user.UserID,
        RecipeContent="Old Content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

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
    response = client.put(f"/recipes/{recipe.RecipeID}", json={"title": "Updated Recipe", "content": "Updated Content"}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["RecipeName"] == "Updated Recipe"

def test_delete_recipe(create_test_user):
    """
    Test deleting a recipe.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Recipe to Delete",
        UserID=create_test_user.UserID,
        RecipeContent="Content to Delete",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

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
    response = client.delete(f"/recipes/{recipe.RecipeID}", headers=headers)
    assert response.status_code == 204

    response = client.get(f"/recipes/{recipe.RecipeID}", headers=headers)
    assert response.status_code == 404