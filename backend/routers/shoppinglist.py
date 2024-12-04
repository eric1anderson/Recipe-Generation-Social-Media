from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, Response, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe, ShoppingListItem
import json
from routers.auth import get_current_user  # Import the dependency

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get('/recipes')
def recipes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieve recipes for the current user.
    """
    recipes = [
        {'RecipeID': recipe.RecipeID, 'RecipeName': recipe.RecipeName}
        for recipe in current_user.recipes
    ]
    return Response(
            content=json.dumps({ "recipes": recipes}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )
    # return templates.TemplateResponse(
    #     'recipes.html',
    #     {
    #         'request': request,
    #         'recipes': user.recipes,
    #         'user_id': request.session.get('user_id')
    #     }
    # )

@router.get('/add_to_shopping_list/{recipe_id}')
def add_to_shopping_list(
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add ingredients from a recipe to the user's shopping list.
    """
    recipe = db.query(Recipe).filter_by(RecipeID=recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing_items = db.query(ShoppingListItem).filter_by(UserID=current_user.UserID).all()
    existing_ingredient_names = {item.IngredientName for item in existing_items}

    new_items = [
        ShoppingListItem(UserID=current_user.UserID, IngredientName=ingredient.IngredientName)
        for ingredient in recipe.ingredients
        if ingredient.IngredientName not in existing_ingredient_names
    ]
    db.add_all(new_items)
    db.commit()
    return Response(
            content=json.dumps({ "message": "Ingredients added to shopping list"}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )


@router.get('/shopping_list')
def view_shopping_list_get(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    View the user's shopping list.
    """
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=current_user.UserID).all()
    shopping_list = [item.IngredientName for item in shopping_list_items]
    return Response(
            content=json.dumps({ "shopping_list": shopping_list}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )

@router.post('/shopping_list')
async def view_shopping_list_post(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the user's shopping list with new items.
    """
    form = await request.form()
    shopping_list_input = form.get('shopping_list', '').split('\n')
    shopping_list_input = [item.strip() for item in shopping_list_input if item.strip()]

    # Delete existing items
    # db.query(ShoppingListItem).filter_by(UserID=current_user.UserID).delete()

    # Add new items
    new_items = [
        ShoppingListItem(UserID=current_user.UserID, IngredientName=item)
        for item in shopping_list_input
    ]
    db.add_all(new_items)
    db.commit()
    return Response(
            content=json.dumps({ "message": "Shopping list updated"}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )


@router.get('/save_shopping_list')
def save_shopping_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save the user's shopping list as a text response.
    """
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=current_user.UserID).all()
    if not shopping_list_items:
        raise HTTPException(status_code=400, detail="Your shopping list is empty.")

    shopping_list = [item.IngredientName for item in shopping_list_items]
    shopping_list_text = '\n'.join(shopping_list)
    return Response(
            content=json.dumps({ "shopping_list": shopping_list_text}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )

@router.on_event("startup")
def startup_event():
    """
    Startup event to print public recipes.
    """
    db = next(get_db())
    public_recipes = db.query(Recipe).filter_by(Visibility=True).all()
    for recipe in public_recipes:
        print(f"Recipe: {recipe.RecipeName}, Author: {recipe.user.Name}")
    db.close()