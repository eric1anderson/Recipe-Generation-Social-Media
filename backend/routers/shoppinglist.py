from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import get_db
from models import User, Recipe, ShoppingListItem

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get('/recipes', response_class=HTMLResponse)
async def recipes(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    return templates.TemplateResponse(
        'recipes.html',
        {
            'request': request,
            'recipes': user.recipes,
            'user_id': request.session.get('user_id')
        }
    )

@router.get('/add_to_shopping_list/{recipe_id}')
async def add_to_shopping_list(request: Request, recipe_id, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    recipe = db.query(Recipe).filter_by(RecipeID=str(recipe_id)).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found.")

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
    return RedirectResponse(url='/shopping_list', status_code=302)

@router.get('/shopping_list', response_class=HTMLResponse)
async def view_shopping_list_get(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    user = db.query(User).filter_by(UserID=request.session['user_id']).first()
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
    shopping_list = [item.IngredientName for item in shopping_list_items]
    return templates.TemplateResponse(
        'shopping_list.html',
        {
            'request': request,
            'shopping_list': shopping_list,
            'user_id': request.session.get('user_id')
        }
    )

@router.post('/shopping_list', response_class=HTMLResponse)
async def view_shopping_list_post(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
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

    return templates.TemplateResponse(
        'shopping_list.html',
        {
            'request': request,
            'shopping_list': shopping_list,
            'user_id': request.session.get('user_id')
        }
    )

@router.get('/save_shopping_list')
async def save_shopping_list(request: Request, db: Session = Depends(get_db)):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    shopping_list_items = db.query(ShoppingListItem).filter_by(UserID=request.session['user_id']).all()
    if not shopping_list_items:
        return Response(content="Your shopping list is empty.", status_code=400)

    shopping_list = [item.IngredientName for item in shopping_list_items]
    shopping_list_text = '\n'.join(shopping_list)

    response = Response(content=shopping_list_text, media_type='text/plain')
    response.headers['Content-Disposition'] = 'attachment; filename=shopping_list.txt'
    return response

@router.on_event("startup")
def startup_event():
    db = next(get_db())
    public_recipes = db.query(Recipe).filter_by(Visibility=True).all()
    for recipe in public_recipes:
        print(f"Recipe: {recipe.RecipeName}, Author: {recipe.user.Name}")
    db.close()