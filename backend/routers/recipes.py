from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe, Ingredient, Allergy
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
        if not current_user.Role:
            recipe = db.query(Recipe).filter_by(RecipeID=recipe_id).first()
        else:
            recipe = db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return recipe
    else:
        if not current_user.Role:
            recipes = db.query(Recipe).all()
            return recipes
        recipes = db.query(Recipe).filter_by(UserID=current_user.UserID).all()
        return recipes

@router.put('/recipes/{recipe_id}', response_model=RecipeOutput)
def update_recipe(
    recipe_id: str,
    recipe: RecipeBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.Role:
        db_recipe = db.query(Recipe).filter_by(RecipeID=recipe_id).first()
    else:
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
    if not current_user.Role:
        db_recipe = db.query(Recipe).filter_by(RecipeID=recipe_id)
    else:
        db_recipe = db.query(Recipe).filter_by(RecipeID=recipe_id, UserID=current_user.UserID)
    
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")    
    db.query(Ingredient).filter_by(RecipeID=db_recipe.first().RecipeID).delete()
    db_recipe.delete()
    db.commit()
    return JSONResponse(status_code=200, content={"message": "Recipe deleted successfully"})

# create CRUD endpoints for allergy creation, reading, updating, and deletion
@router.post('/allergies')
def create_allergy(
    ingredient: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_allergy = Allergy(
        UserID=current_user.UserID,
        IngredientName=ingredient
    )
    db.add(new_allergy)
    db.commit()
    return JSONResponse(status_code=201, content={"message": "Allergy created successfully."})

@router.get('/allergies/{allergy_id}')
def read_allergy(
    allergy_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.Role:
        allergy = db.query(Allergy).filter_by(AllergyID=allergy_id).first()
    else:
        allergy = db.query(Allergy).filter_by(AllergyID=allergy_id, UserID=current_user.UserID).first()
    if not allergy:
        raise HTTPException(status_code=404, detail="Allergy not found")
    return allergy

@router.get('/allergiesall')
def read_allergies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.Role:
        allergies = db.query(Allergy).all()
        return allergies
    allergies = db.query(Allergy).filter_by(UserID=current_user.UserID).all()
    return allergies

@router.put('/allergies/{allergy_id}')
def update_allergy(
    allergy_id: str,
    ingredient: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.Role:
        db_allergy = db.query(Allergy).filter_by(AllergyID=allergy_id).first()
    else:
        db_allergy = db.query(Allergy).filter_by(AllergyID=allergy_id, UserID=current_user.UserID).first()
    if not db_allergy:
        raise HTTPException(status_code=404, detail="Allergy not found")
    db_allergy.IngredientName = ingredient
    db.commit()
    return db_allergy