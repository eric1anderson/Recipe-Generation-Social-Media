from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, Response, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe, ShoppingListItem
import json

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get('/recipes', response_class=HTMLResponse)
def recipes(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return Response(
            content=json.dumps({ "error": "Unauthorized"}),
            status_code=401,
            headers={
                "Content-Type": "application/json"
            }
        )
    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    recipes = [{'RecipeID': recipe.RecipeID, 'RecipeName': recipe.RecipeName} for recipe in user.recipes]
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
def add_to_shopping_list(request: Request, recipe_id, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return Response(
            content=json.dumps({ "error": "Unauthorized"}),
            status_code=401,
            headers={
                "Content-Type": "application/json"
            }
        )
    recipe = db.query(Recipe).filter_by(RecipeID=str(recipe_id)).first()
    if not recipe:
        return Response(
            content=json.dumps({ "error": "Recipe not found"}),
            status_code=404,
            headers={
                "Content-Type": "application/json"
            }
        )

    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    existing_items = db.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
    existing_ingredient_names = set(item.IngredientName for item in existing_items)

    new_items = []
    for ingredient in recipe.ingredients:
        if ingredient.IngredientName not in existing_ingredient_names:
            new_item = ShoppingListItem(
                UserID=user.UserID,
                IngredientName=ingredient.IngredientName
            )
            new_items.append(new_item)
    db.add_all(new_items)
    db.commit()
    return Response(
            content=json.dumps({ "message": "Ingredients added to shopping list"}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )
    # return RedirectResponse(url='/shopping_list', status_code=302)

@router.get('/shopping_list', response_class=HTMLResponse)
def view_shopping_list_get(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return Response(
            content=json.dumps({ "error": "Unauthorized"}),
            status_code=401,
            headers={
                "Content-Type": "application/json"
            }
        )
    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
    shopping_list = [item.IngredientName for item in shopping_list_items]
    return Response(
            content=json.dumps({ "shopping_list": shopping_list}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )
    # return templates.TemplateResponse(
    #     'shopping_list.html',
    #     {
    #         'request': request,
    #         'shopping_list': shopping_list,
    #         'user_id': request.session.get('user_id')
    #     }
    # )

@router.post('/shopping_list', response_class=HTMLResponse)
async def view_shopping_list_post(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return Response(
            content=json.dumps({ "error": "Unauthorized"}),
            status_code=401,
            headers={
                "Content-Type": "application/json"
            }
        )
    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    form = await request.form()
    shopping_list_input = form.get('shopping_list').split('\n')
    shopping_list_input = [item.strip() for item in shopping_list_input if item.strip()]
    shopping_list = shopping_list_input

    db.query(ShoppingListItem).filter_by(UserID=user.UserID).delete()

    new_items = [
        ShoppingListItem(UserID=user.UserID, IngredientName=item)
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
    # return templates.TemplateResponse(
    #     'shopping_list.html',
    #     {
    #         'request': request,
    #         'shopping_list': shopping_list,
    #         'user_id': request.session.get('user_id')
    #     }
    # )

@router.get('/save_shopping_list')
def save_shopping_list(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return Response(
            content=json.dumps({ "error": "Unauthorized"}),
            status_code=401,
            headers={
                "Content-Type": "application/json"
            }
        )
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=request.session['user_id']).all()
    if not shopping_list_items:
        return Response(
            content=json.dumps({ "error": "Your shopping list is empty."}),
            status_code=400,
            headers={
                "Content-Type": "application/json"
            }
        )


    shopping_list = [item.IngredientName for item in shopping_list_items]
    shopping_list_text = '\n'.join(shopping_list)

    #response = Response(content=shopping_list_text, media_type='text/plain')
    #response.headers['Content-Disposition'] = 'attachment; filename=shopping_list.txt'
    #return response
    return Response(
            content=json.dumps({ "shopping_list": shopping_list_text}),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )

@router.on_event("startup")
def startup_event():
    db = next(get_db())
    public_recipes = db.query(Recipe).filter_by(Visibility=True).all()
    for recipe in public_recipes:
        print(f"Recipe: {recipe.RecipeName}, Author: {recipe.user.Name}")
    db.close()