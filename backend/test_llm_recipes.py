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
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

client = TestClient(app)

def generate_uuid():
    return str(uuid.uuid4())

@pytest.fixture(scope="module")
def setup_module():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    hashed_password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
    user = User(
        UserID=generate_uuid(),
        Email=f'testuser@example.com',
        Password=hashed_password.decode('utf-8'),
        Role=True,
        Name='Test User'
    )
    db.add(user)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    os.close(db_fd)
    os.remove(db_path)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def test_generate_recipe(setup_module):
    # Login as the test user
    response = client.post('/login', data={'email': 'testuser@example.com', 'password': 'password123'})
    assert response.status_code == 200

    # Generate a recipe
    response = client.post('/generate_recipe', data={'prompt': 'Create a recipe for a chocolate cake'})
    assert response.status_code == 201
    assert response.json() == {"message": "Recipe generated and stored successfully."}

    # Check if the recipe is stored in the database
    db = next(override_get_db())
    user = db.query(User).filter_by(Email='testuser@example.com').first()
    assert len(user.recipes) > 0
    assert user.recipes[0].RecipeContent is not None
    db.close()

def test_generate_recipe_without_prompt(setup_module):
    # Login as the test user
    response = client.post('/login', data={'email': 'testuser@example.com', 'password': 'password123'})
    assert response.status_code == 200

    # Attempt to generate a recipe without a prompt
    response = client.post('/generate_recipe', data={})
    assert response.status_code == 400
    assert response.json() == {"detail": "Prompt is required."}

def test_generate_recipe_unauthorized(setup_module):
    # Attempt to generate a recipe without logging in
    response = client.post('/generate_recipe', data={'prompt': 'Create a recipe for a chocolate cake'})
    assert response.status_code == 401
    assert response.json() == {"message": "Unauthorized"}