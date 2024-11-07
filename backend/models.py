from sqlalchemy import (
    create_engine, Column, String, Boolean, Integer, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = 'users'

    UserID = Column(String(36), primary_key=True, default=generate_uuid)
    Email = Column(String, nullable=False, unique=True)
    Password = Column(String, nullable=False)
    Role = Column(Boolean, default=True)  # True for user, False for admin
    Name = Column(String, nullable=False)

    recipes = relationship('Recipe', back_populates='user')
    allergies = relationship('Allergy', back_populates='user')
    comments = relationship('Comment', back_populates='user')
    bookmarks = relationship('Bookmark', back_populates='user')
    shopping_list_items = relationship('ShoppingListItem', back_populates='user', cascade='all, delete-orphan')

class Recipe(Base):
    __tablename__ = 'recipe'

    RecipeID = Column(String(36), primary_key=True, default=generate_uuid)
    UserID = Column(String(36), ForeignKey('users.UserID'), nullable=False)
    RecipeName = Column(String, nullable=False)
    RecipeContent = Column(Text, nullable=False)
    Visibility = Column(Boolean, default=False)  # False for private, True for public

    user = relationship('User', back_populates='recipes')
    ingredients = relationship('Ingredient', back_populates='recipe')
    social_media = relationship('SocialMedia', back_populates='recipe')
    comments = relationship('Comment', back_populates='recipe')
    bookmarks = relationship('Bookmark', back_populates='recipe')

class Ingredient(Base):
    __tablename__ = 'ingredients'
    __table_args__ = (UniqueConstraint( 'RecipeID','IngredientName', name='uq_recipe_ingredient'),)

    IngredientID = Column(String(36), primary_key=True, default=generate_uuid)
    RecipeID = Column(String(36), ForeignKey('recipe.RecipeID'), nullable=False)
    IngredientName = Column(String, nullable=False)

    recipe = relationship('Recipe', back_populates='ingredients')

class Allergy(Base):
    __tablename__ = 'allergy'

    AllergyID = Column(String(36), primary_key=True, default=generate_uuid)
    UserID = Column(String(36), ForeignKey('users.UserID'), nullable=False)
    IngredientName = Column(String, ForeignKey('ingredients.IngredientName'), nullable=False)

    user = relationship('User', back_populates='allergies')

class SocialMedia(Base):
    __tablename__ = 'social_media'

    SMID = Column(String(36), primary_key=True, default=generate_uuid)
    RecipeID = Column(String(36), ForeignKey('recipe.RecipeID'), nullable=False)
    Likes = Column(Integer, default=0)

    recipe = relationship('Recipe', back_populates='social_media')

class Comment(Base):
    __tablename__ = 'comments'

    CommentID = Column(String(36), primary_key=True, default=generate_uuid)
    RecipeID = Column(String(36), ForeignKey('recipe.RecipeID'), nullable=False)
    UserID = Column(String(36), ForeignKey('users.UserID'), nullable=False)
    CommentText = Column(Text, nullable=False)

    recipe = relationship('Recipe', back_populates='comments')
    user = relationship('User', back_populates='comments')

class Bookmark(Base):
    __tablename__ = 'bookmark'

    BookmarkID = Column(String(36), primary_key=True, default=generate_uuid)
    UserID = Column(String(36), ForeignKey('users.UserID'), nullable=False)
    RecipeID = Column(String(36), ForeignKey('recipe.RecipeID'), nullable=False)

    user = relationship('User', back_populates='bookmarks')
    recipe = relationship('Recipe', back_populates='bookmarks')


class ShoppingListItem(Base):
    __tablename__ = 'shopping_list_items'

    ItemID = Column(String(36), primary_key=True, default=generate_uuid)
    UserID = Column(String(36), ForeignKey('users.UserID'), nullable=False)
    IngredientName = Column(String, nullable=False)
    user = relationship('User', back_populates='shopping_list_items')

