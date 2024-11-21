import os
import tempfile
import uuid
import bcrypt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import init_db, get_db, Base
from models import User, Recipe

# Create a temporary database file
db_fd, db_path = tempfile.mkstemp(suffix=".db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def test_db():
    init_db()
    yield
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture(scope="module")
def test_user(test_db):
    db = TestingSessionLocal()
    hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
    user = User(
        UserID=str(uuid.uuid4()),
        Email="testuser@example.com",
        Password=hashed_password.decode('utf-8'),
        Role=True,
        Name="Test User"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

@pytest.fixture(scope="module")
def authenticated_client(test_user):
    client = TestClient(app)
    response = client.post("/login", data={"email": test_user.Email, "password": "password123"})
    assert response.status_code == 200
    return client

def test_create_recipe(authenticated_client):
    response = authenticated_client.post("/recipes", json={"title": "Test Recipe", "content": "Test Content"})
    assert response.status_code == 201

def test_read_all_recipes(authenticated_client, test_user):
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeID=str(uuid.uuid4()),
        UserID=test_user.UserID,
        RecipeName="Test Recipe",
        RecipeContent="Test Content",
        Visibility=True
    )
    db.add(recipe)
    recipe = Recipe(
        RecipeID=str(uuid.uuid4()),
        UserID=test_user.UserID,
        RecipeName="Test Recipe 2",
        RecipeContent="Test Content 2",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()
    response = authenticated_client.get("/recipesall")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_recipe_by_id(authenticated_client, test_user):
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeID=str(uuid.uuid4()),
        UserID=test_user.UserID,
        RecipeName="Test Recipe",
        RecipeContent="Test Content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

    response = authenticated_client.get(f"/recipes/{recipe.RecipeID}")
    assert response.status_code == 200
    assert response.json()["RecipeName"] == "Test Recipe"

def test_update_recipe(authenticated_client, test_user):
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeID=str(uuid.uuid4()),
        UserID=test_user.UserID,
        RecipeName="Old Recipe",
        RecipeContent="Old Content",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

    response = authenticated_client.put(f"/recipes/{recipe.RecipeID}", json={"title": "Updated Recipe", "content": "Updated Content"})
    assert response.status_code == 200
    assert response.json()["RecipeName"] == "Updated Recipe"

def test_delete_recipe(authenticated_client, test_user):
    db = TestingSessionLocal()
    recipe = Recipe(
        RecipeID=str(uuid.uuid4()),
        UserID=test_user.UserID,
        RecipeName="Recipe to Delete",
        RecipeContent="Content to Delete",
        Visibility=True
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    db.close()

    response = authenticated_client.delete(f"/recipes/{recipe.RecipeID}")
    assert response.status_code == 204

    response = authenticated_client.get(f"/recipes/{recipe.RecipeID}")
    assert response.status_code == 404
