# test_shopping_list.py

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db
from models import User, Recipe, Ingredient, ShoppingListItem
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

def test_get_recipes(create_test_user):
    """
    Test retrieving user recipes.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Test Recipe",
        UserID=create_test_user.UserID,
        RecipeContent = "Test content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    # Create test ingredients
    ingredient1 = Ingredient(
        RecipeID=recipe.RecipeID,
        IngredientName="Test Ingredient 1"
    )
    ingredient2 = Ingredient(
        RecipeID=recipe.RecipeID,
        IngredientName="Test Ingredient 2"
    )
    db.add_all([ingredient1, ingredient2])
    db.commit()
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
    response = client.get("/recipes", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "recipes" in data
    assert isinstance(data["recipes"], list)
    assert len(data["recipes"]) > 0

def test_add_to_shopping_list(create_test_user):
    """
    Test adding a recipe's ingredients to the shopping list.
    """
    # First, create a test recipe for the user
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeName="Test Recipe for Shopping List",
        UserID=create_test_user.UserID,
        RecipeContent = "Test Content",
        Visibility=True
    )

    # Create test ingredients and associate them via the relationship
    ingredient1 = Ingredient(IngredientName="Shopping Ingredient 1")
    ingredient2 = Ingredient(IngredientName="Shopping Ingredient 2")
    recipe.ingredients = [ingredient1, ingredient2]

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

    # Add the recipe to the shopping list
    response = client.get(f"/add_to_shopping_list/{recipe.RecipeID}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Ingredients added to shopping list"

def test_view_shopping_list(create_test_user):
    """
    Test retrieving the shopping list.
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
    response = client.get("/shopping_list", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "shopping_list" in data
    assert isinstance(data["shopping_list"], list)
    assert len(data["shopping_list"]) > 0

def test_update_shopping_list(create_test_user):
    """
    Test updating the shopping list with new items.
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

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    shopping_list_items = "Milk\nEggs\nBread"
    response = client.post(
        "/shopping_list",
        data={"shopping_list": shopping_list_items},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Shopping list updated"

    # Verify the update
    response = client.get("/shopping_list", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["shopping_list"] == ["Milk", "Eggs", "Bread"]

def test_save_shopping_list(create_test_user):
    """
    Test saving the shopping list.
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
    response = client.get("/save_shopping_list", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "shopping_list" in data
    shopping_list_text = data["shopping_list"]
    assert isinstance(shopping_list_text, str)
    assert shopping_list_text == "Milk\nEggs\nBread"
