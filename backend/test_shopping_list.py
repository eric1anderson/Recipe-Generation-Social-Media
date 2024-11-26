
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt
from models import User, Recipe, Ingredient, ShoppingListItem
from database import Base, get_db
from main import app

# Set the DATABASE_URL environment variable
os.environ['DATABASE_URL'] = 'sqlite:///./test_database.db'

# Create the engine and session
engine = create_engine(
    os.environ['DATABASE_URL'], connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Initialize the TestClient
client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():

    # Clean up the database before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.rollback()
    session.close()

@pytest.fixture(scope="function")
def test_user(db_session):
    password = "testpassword"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(Email="testuser@example.com", Password=hashed_password, Name="Test User")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def authenticated_client(test_user):
    with TestClient(app) as client:
        response = client.post("/login", data={"email": test_user.Email, "password": "testpassword"},headers={"Content-Type": "application/x-www-form-urlencoded"},  allow_redirects=False)
        if response.status_code != 200:
            print("Login failed")
            print("Response status code:", response.status_code)
            print("Response text:", response.text)
        assert response.status_code == 200
        yield client

def test_recipes_authenticated(authenticated_client, db_session, test_user):
    # Add a recipe for the test user
    recipe = Recipe(RecipeName="Test Recipe", UserID=test_user.UserID, RecipeContent="Test Content")
    db_session.add(recipe)
    db_session.commit()

    response = authenticated_client.get("/recipes")
    print(f"Response: {response}")
    assert response.status_code == 200
    data = response.json()
    assert "recipes" in data
    assert len(data["recipes"]) == 1
    assert data["recipes"][0]["RecipeName"] == "Test Recipe"

def test_recipes_unauthenticated():
    response = client.get("/recipes")
    assert response.status_code == 401
    assert response.json() == {"error": "Unauthorized"}

def test_add_to_shopping_list_valid(authenticated_client, db_session, test_user):
    # Create a recipe with ingredients
    recipe = Recipe(RecipeName="Test Recipe", UserID=test_user.UserID, RecipeContent="Test Content")
    db_session.add(recipe)
    db_session.commit()
    db_session.refresh(recipe)

    ingredient1 = Ingredient(RecipeID=recipe.RecipeID, IngredientName="Ingredient 1")
    ingredient2 = Ingredient(RecipeID=recipe.RecipeID, IngredientName="Ingredient 2")
    db_session.add_all([ingredient1, ingredient2])
    db_session.commit()

    response = authenticated_client.get(f"/add_to_shopping_list/{recipe.RecipeID}")
    assert response.status_code == 200
    assert response.json() == {"message": "Ingredients added to shopping list"}

    # Verify that ingredients are added to the shopping list
    shopping_list_response = authenticated_client.get("/shopping_list")
    assert shopping_list_response.status_code == 200
    shopping_list = shopping_list_response.json()["shopping_list"]
    assert "Ingredient 1" in shopping_list
    assert "Ingredient 2" in shopping_list

def test_add_to_shopping_list_invalid_recipe(authenticated_client):
    response = authenticated_client.get("/add_to_shopping_list/invalid_id")
    assert response.status_code == 404
    assert response.json() == {"error": "Recipe not found"}

def test_add_to_shopping_list_unauthenticated(db_session, test_user):
    # Create a recipe
    recipe = Recipe(RecipeName="Test Recipe", UserID=test_user.UserID, RecipeContent="Test Content")
    db_session.add(recipe)
    db_session.commit()

    response = client.get(f"/add_to_shopping_list/{recipe.RecipeID}")
    assert response.status_code == 401
    assert response.json() == {"error": "Unauthorized"}

def test_view_shopping_list_authenticated(authenticated_client, db_session, test_user):
    # Add items to the shopping list
    item1 = ShoppingListItem(UserID=test_user.UserID, IngredientName="Ingredient 1")
    item2 = ShoppingListItem(UserID=test_user.UserID, IngredientName="Ingredient 2")
    db_session.add_all([item1, item2])
    db_session.commit()

    response = authenticated_client.get("/shopping_list")
    assert response.status_code == 200
    data = response.json()
    assert "shopping_list" in data
    assert len(data["shopping_list"]) == 2
    assert "Ingredient 1" in data["shopping_list"]
    assert "Ingredient 2" in data["shopping_list"]

def test_view_shopping_list_unauthenticated():
    response = client.get("/shopping_list")
    assert response.status_code == 401
    assert response.json() == {"error": "Unauthorized"}

def test_update_shopping_list_authenticated(authenticated_client, db_session, test_user):
    shopping_list_input = "Milk\nEggs\nBread"
    response = authenticated_client.post("/shopping_list", data={"shopping_list": shopping_list_input})
    assert response.status_code == 200
    assert response.json() == {"message": "Shopping list updated"}

    # Verify that the shopping list is updated
    response = authenticated_client.get("/shopping_list")
    assert response.status_code == 200
    data = response.json()
    assert "shopping_list" in data
    assert len(data["shopping_list"]) == 3
    assert "Milk" in data["shopping_list"]
    assert "Eggs" in data["shopping_list"]
    assert "Bread" in data["shopping_list"]

def test_update_shopping_list_unauthenticated():
    shopping_list_input = "Milk\nEggs\nBread"
    response = client.post("/shopping_list", data={"shopping_list": shopping_list_input})
    assert response.status_code == 401
    assert response.json() == {"error": "Unauthorized"}

def test_save_shopping_list_authenticated(authenticated_client, db_session, test_user):
    # Add items to the shopping list
    item1 = ShoppingListItem(UserID=test_user.UserID, IngredientName="Ingredient 1")
    item2 = ShoppingListItem(UserID=test_user.UserID, IngredientName="Ingredient 2")
    db_session.add_all([item1, item2])
    db_session.commit()

    response = authenticated_client.get("/save_shopping_list")
    assert response.status_code == 200
    data = response.json()
    assert "shopping_list" in data
    shopping_list_text = data["shopping_list"]
    assert "Ingredient 1" in shopping_list_text
    assert "Ingredient 2" in shopping_list_text

def test_save_shopping_list_empty(authenticated_client):
    response = authenticated_client.get("/save_shopping_list")
    assert response.status_code == 400
    assert response.json() == {"error": "Your shopping list is empty."}

def test_save_shopping_list_unauthenticated():
    response = client.get("/save_shopping_list")
    assert response.status_code == 401
