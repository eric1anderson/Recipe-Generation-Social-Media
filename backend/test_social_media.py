import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db
from models import User, Recipe, Ingredient, SocialMedia, Bookmark, Comment, Allergy
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

def test_get_posts(create_test_user):
    """
    Test retrieving all public posts.
    """
    # Login as test user
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
    token = data["access_token"]
    user_id = create_test_user.UserID

    headers = {"Authorization": f"Bearer {token}"}

    # Create a test recipe for the user
    response = client.post(
        "/recipes",
        json={
            "title": "Test Recipe",
            "content": "Test Content",
            "ingredients": ["one", "two"],
            "userGenerated": False,
            "cuisine": "Unknown"  # Explicitly set Cuisine for the test
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    recipe_id = data["id"]  # Adjust based on actual response

    # Create a social media entry for the recipe
    response = client.post(
        "/add_post",
        json={"recipe_id": recipe_id},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    smid = data["SMID"]

    # Fetch posts
    response = client.get("/posts", headers=headers)
    assert response.status_code == 200
    data = response.json()

    posts = data["posts"]
    assert len(posts) == 1
    assert posts[0]["SMID"] == smid
    assert posts[0]["Recipe"]["RecipeID"] == recipe_id
    assert posts[0]["Recipe"]["RecipeName"] == "Test Recipe"
    assert posts[0]["Recipe"]["RecipeContent"] == "Test Content"
    assert posts[0]["Recipe"]["Visibility"] == True
    assert posts[0]["Recipe"]["UserGenerated"] == False
    assert posts[0]["Recipe"]["Cuisine"] == "Unknown"
    assert posts[0]["Recipe"]["UserID"] == user_id

def test_like_post(create_test_user):
    """
    Test liking a post.
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
    token = data["access_token"]
    user_id = create_test_user.UserID

    headers = {"Authorization": f"Bearer {token}"}

    # Create a test recipe for the user
    response = client.post(
        "/recipes",
        json={
            "title": "Test Recipe",
            "content": "Test Content",
            "ingredients": ["one", "two"],
            "userGenerated": False,
            "cuisine": "Unknown"  # Explicitly set Cuisine for the test
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    recipe_id = data["id"]  # Adjust based on actual response

    # Create a social media entry for the recipe
    response = client.post(
        "/add_post",
        json={"recipe_id": recipe_id},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    smid = data["SMID"] 

    # Like the post
    response = client.post(
        f"/like_post/{smid}",
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Post liked successfully"

    # Check if the post is now liked
    response = client.get(f"/posts/{smid}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    # Verify like count and like status
    assert data["post"]["Likes"] == 1  

def test_get_bookmarks(create_test_user):
    """
    Test retrieving all user bookmarks.
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
    token = data["access_token"]
    user_id = create_test_user.UserID

    headers = {"Authorization": f"Bearer {token}"}

    # Create a test recipe for the user
    response = client.post(
        "/recipes",
        json={
            "title": "Test Recipe",
            "content": "Test Content",
            "ingredients": ["one", "two"],
            "userGenerated": False,
            "cuisine": "Unknown"  # Explicitly set Cuisine for the test
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    recipe_id = data["id"]  

    response = client.post(
        "/add_post",
        json={"recipe_id": recipe_id},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    smid = data["SMID"]

    response = client.post(
        f"/add_bookmark",
        headers=headers,
        json={"recipe_id": recipe_id}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Bookmark added successfully"

    response = client.get("/bookmarks", headers=headers)
    assert response.status_code == 200
    data = response.json()

    bookmarks = data["bookmarks"]
    assert len(bookmarks) == 1
    assert bookmarks[0]["SMID"] == smid
    assert bookmarks[0]["Recipe"]["RecipeID"] == recipe_id
    assert bookmarks[0]["Recipe"]["RecipeName"] == "Test Recipe"
    assert bookmarks[0]["Recipe"]["RecipeContent"] == "Test Content"
    assert bookmarks[0]["Recipe"]["Visibility"] == True
    assert bookmarks[0]["Recipe"]["UserGenerated"] == False
    assert bookmarks[0]["Recipe"]["Cuisine"] == "Unknown"
    assert bookmarks[0]["Recipe"]["UserID"] == user_id

def test_add_comment(create_test_user):
    """
    Test adding a comment to a post.
    """
    # Login as test user
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
    token = data["access_token"]
    user_id = create_test_user.UserID

    headers = {"Authorization": f"Bearer {token}"}

    # Create a test recipe for the user
    response = client.post(
        "/recipes",
        json={
            "title": "Test Recipe",
            "content": "Test Content",
            "ingredients": ["one", "two"],
            "userGenerated": False,
            "cuisine": "Unknown"  # Explicitly set Cuisine for the test
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    recipe_id = data["id"]

    # Create a social media entry for the recipe
    response = client.post(
        "/add_post",
        json={"recipe_id": recipe_id},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    smid = data["SMID"]

    # Add a comment to the post
    comment_text = "This is a test comment."
    response = client.post(
        "/add_comment",
        json={"smid": smid, "comment_text": comment_text},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Comment added successfully"

    # Fetch the comments for the post
    response = client.get(f"/comments/{smid}", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Check if the comment exists in the response
    comments = data["comments"]
    assert len(comments) == 1  # Only one comment should exist
    assert comments[0]["CommentText"] == comment_text
    assert comments[0]["UserID"] == user_id
    assert comments[0]["UserName"] == "Test User"  # Name from `create_test_user`
