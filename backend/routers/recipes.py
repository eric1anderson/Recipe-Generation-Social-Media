from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe
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
    ingredients: str
    
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
    recipe: RecipeBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_recipe = Recipe(
        UserID=current_user.UserID,
        RecipeName=recipe.title,
        RecipeContent=recipe.content,
        Visibility=True
    )
    db.add(new_recipe)
    db.commit()
    return JSONResponse(status_code=201, content={"message": "Recipe created successfully."})


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

    db.delete(db_recipe)
    db.commit()
    return JSONResponse(status_code=204, content={"message": "Recipe deleted successfully"})