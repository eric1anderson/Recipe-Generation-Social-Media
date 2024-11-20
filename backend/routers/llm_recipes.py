from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe
import openai
import json
from pydantic import BaseModel

router = APIRouter()

# Set your OpenAI API key
openai.api_key = 'KEY'

class recipe(BaseModel):
    title: str
    content: str
    
@router.post('/generate_recipe')
async def generate_recipe(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return JSONResponse(status_code=401, content={"message": "Unauthorized"})
    
    form = await request.form()
    prompt = form.get('prompt')
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required.")

    # Call GPT-4o to generate a recipe with structured output
    response = openai.beta.chat.completions.parse(
        model="gpt-4o",
        messages= [
            { "role": "system", "content": "You create recipes using given ingredients." },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        response_format=recipe,
    )
    recipe_data = response.choices[0].message.content

    try:
        recipe_json = json.loads(recipe_data)
        recipe_name = recipe_json.get('title', 'Generated Recipe')
        recipe_content = recipe_json.get('content', '')
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse recipe data from OpenAI response.")

    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    new_recipe = Recipe(        
        UserID=user.UserID,
        RecipeName=recipe_name,
        RecipeContent=recipe_content,
        Visibility=True
    )
    db.add(new_recipe)
    db.commit()

    return JSONResponse(status_code=201, content={"message": "Recipe generated and stored successfully."})