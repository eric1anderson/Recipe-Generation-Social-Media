from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, not_
from database import get_db
from models import User, Recipe, Ingredient
import openai
import json
from pydantic import BaseModel
from routers.auth import get_current_user  # Import the dependency

router = APIRouter()

# Set your OpenAI API key
openai.api_key = 'API_KEY'

class RecipeBase(BaseModel):
    title: str
    content: str

class RecipeLLM(RecipeBase):
    ingredients: List[str]
    userGenerated: bool
    
class RecipeOutput(BaseModel):
    RecipeID: str
    UserID: str
    RecipeName: str
    RecipeContent: str
    Visibility: bool

    class Config:
        orm_mode = True

@router.post('/generate-recipe')
async def generate_recipe(
    question: str,
    ingredients: List[str] = Query(...),
    dietary_restrictions: List[str] = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prompt = f"Create a recipe using the following ingredients: {ingredients}. Dietary restrictions: {dietary_restrictions}. Question: {question}"
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    # Call GPT-4o to generate a recipe with structured output
    response = openai.beta.chat.completions.parse(
        model="gpt-4o",
        messages= [
            { "role": "system", "content": """You create recipes using given ingredients. 
             Include the ingredients in the contents. Return only the names of ingredients
               in a comma separated manner without any quantites.""" },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format=RecipeLLM,
    )
    recipe_data = response.choices[0].message.content

    try:
        recipe_json = json.loads(recipe_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse recipe data from OpenAI response.")

    return JSONResponse(status_code=201, content=recipe_json)

@router.post('/recipes')
def create_recipe(
    recipe: RecipeLLM,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_recipe = Recipe(
        UserID=current_user.UserID,
        RecipeName=recipe.title,
        RecipeContent=recipe.content,
        UserGenerated=recipe.userGenerated,
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)  # Refresh to get the RecipeID
    print("new_recipe", new_recipe.RecipeID)
    # add ingredients to the database
    for ingredient in recipe.ingredients:
        new_ingredient = Ingredient(
            RecipeID=new_recipe.RecipeID,
            IngredientName=ingredient
        )
        db.add(new_ingredient)
    db.commit()
    return JSONResponse(status_code=201, content={"message": "Recipe created successfully.", "id": new_recipe.RecipeID})


@router.get('/recipes/{recipe_id}', response_model=RecipeOutput)
@router.get('/recipesall', response_model=List[RecipeOutput])
def read_recipes(
    recipe_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):    
    if recipe_id:
        recipe = db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return recipe
    else:
        recipes = db.query(Recipe).filter_by(UserID=current_user.UserID).all()
        return recipes

@router.put('/recipes/{recipe_id}', response_model=RecipeOutput)
def update_recipe(
    recipe_id: str,
    recipe: RecipeBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_recipe = db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    db_recipe.RecipeName = recipe.title
    db_recipe.RecipeContent = recipe.content
    db.commit()
    return db_recipe

@router.delete('/recipes/{recipe_id}')
def delete_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_recipe = db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID).delete()
    db.query(Ingredient).filter_by(RecipeID=db_recipe.RecipeID).delete()
    db.commit()
    return JSONResponse(status_code=200, content={"message": "Recipe deleted successfully"})


@router.get('/search_recipes')
def search_recipes(
        ingredient_filter: str = Query(None, description="Comma-separated list of ingredients to include"),
        dietary_restriction_filter: str = Query(None, description="Comma-separated list of ingredients to exclude"),
        db: Session = Depends(get_db)
):
    ingredient_filter_list = []
    if ingredient_filter:
        ingredient_filter_list = [s.strip().lower() for s in ingredient_filter.split(',') if s.strip()]

    dietary_restriction_filter_list = []
    if dietary_restriction_filter:
        dietary_restriction_filter_list = [s.strip().lower() for s in dietary_restriction_filter.split(',') if
                                           s.strip()]

    # Start with the base query for public recipes
    query = db.query(Recipe).filter(Recipe.Visibility == True)

    # If ingredient filters are provided
    if ingredient_filter_list:
        # Join with Ingredient and filter recipes that have at least one of the specified ingredients (case-insensitive)
        query = query.join(Recipe.ingredients).filter(
            func.lower(Ingredient.IngredientName).in_(ingredient_filter_list)
        )

    # If dietary restrictions are provided
    if dietary_restriction_filter_list:
        # Subquery to find RecipeIDs that should be excluded (case-insensitive)
        subq = db.query(Recipe.RecipeID).join(Recipe.ingredients).filter(
            func.lower(Ingredient.IngredientName).in_(dietary_restriction_filter_list)
        )
        # Exclude recipes that have any of the restricted ingredients
        query = query.filter(~Recipe.RecipeID.in_(subq))

    # Ensure distinct recipes in case of multiple joins
    query = query.distinct()

    # Fetch the results
    recipes = query.all()

    # Format the response
    recipe_list = []
    for recipe in recipes:
        recipe_data = {
            'RecipeID': recipe.RecipeID,
            'RecipeName': recipe.RecipeName,
            'RecipeContent': recipe.RecipeContent,
            # Include other fields as needed
        }
        recipe_list.append(recipe_data)
    if not recipe_list:
        return {
            "recipes": "No recipes found"
        }

    return {'recipes': recipe_list}