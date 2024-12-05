from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Recipe, Ingredient
import bcrypt
import uuid

def generate_uuid():
    return str(uuid.uuid4())

def add_test_data(email, password, is_admin = False):
    engine = create_engine('sqlite:///mydatabase.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    if is_admin:
        user = User(
            UserID=generate_uuid(),
            Email=email,
            Password=hashed_password.decode('utf-8'),
            Role=False,
            Name='Test User'
        )

    else:

        user = User(
            UserID=generate_uuid(),
            Email=email,
            Password=hashed_password.decode('utf-8'),
            Role=True,
            Name='Test User'
        )
    session.add(user)
    session.commit()
    print(f"User '{email}' added.")

    recipe1 = Recipe(
        RecipeID=generate_uuid(),
        UserID=user.UserID,
        RecipeName='Spaghetti Bolognese',
        RecipeContent='Boil pasta. Cook sauce...',
        Cuisine="Italian",
        Visibility=True
    )
    session.add(recipe1)

    recipe2 = Recipe(
        RecipeID=generate_uuid(),
        UserID=user.UserID,
        RecipeName='Chicken Curry',
        RecipeContent='Cook chicken. Add spices...',
        Cuisine="Indian",
        Visibility=True
    )
    session.add(recipe2)
    session.commit()
    print("Recipes added.")

    ingredients1 = [
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe1.RecipeID,
            IngredientName='Spaghetti'
        ),
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe1.RecipeID,
            IngredientName='Ground Beef'
        ),
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe1.RecipeID,
            IngredientName='Tomato Sauce'
        )
    ]
    session.add_all(ingredients1)

    ingredients2 = [
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe2.RecipeID,
            IngredientName='Chicken'
        ),
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe2.RecipeID,
            IngredientName='Curry Powder'
        ),
        Ingredient(
            IngredientID=generate_uuid(),
            RecipeID=recipe2.RecipeID,
            IngredientName='Coconut Milk'
        )
    ]
    session.add_all(ingredients2)
    session.commit()
    print("Ingredients added.")

    session.close()

if __name__ == '__main__':
    add_test_data('testuser@example.com', 'password123')
    add_test_data('testuser2@example.com', 'password1234')
    add_test_data('admin@example.com', 'root', is_admin=True)