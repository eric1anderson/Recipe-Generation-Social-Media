from fastapi import FastAPI, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from sqlalchemy import create_engine
import uvicorn
from sqlalchemy.orm import sessionmaker, scoped_session
import bcrypt

from models import *

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key='your_secret_key')  # Replace with a secure secret key

templates = Jinja2Templates(directory="templates")

# Database setup
engine = create_engine('sqlite:///mydatabase.db', connect_args={'check_same_thread': False})
Base.metadata.bind = engine
DBSession = scoped_session(sessionmaker(bind=engine))

# Helper function to get the current database session
def get_db_session():
    return DBSession()

@app.get('/login', response_class=HTMLResponse)
async def login_get(request: Request):
    error = None
    return templates.TemplateResponse('login.html', {'request': request, 'error': error})

@app.post('/login')
async def login_post(request: Request):
    db_session = get_db_session()
    form = await request.form()
    email = form.get('email')
    password = form.get('password').encode('utf-8')
    user = db_session.query(User).filter_by(Email=email).first()
    if user and bcrypt.checkpw(password, user.Password.encode('utf-8')):
        request.session.clear()
        request.session['user_id'] = user.UserID
        return RedirectResponse(url='/recipes', status_code=302)
    else:
        error = 'Invalid email or password.'
        return templates.TemplateResponse('login.html', {'request': request, 'error': error})

@app.get('/logout')
async def logout(request: Request):
    request.session.pop('user_id', None)
    request.session.clear()
    return RedirectResponse(url='/login', status_code=302)

@app.get('/recipes', response_class=HTMLResponse)
async def recipes(request: Request):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    db_session = get_db_session()
    user = db_session.query(User).filter_by(UserID=request.session['user_id']).first()
    return templates.TemplateResponse(
        'recipes.html',
        {
            'request': request,
            'recipes': user.recipes,
            'user_id': request.session.get('user_id')
        }
    )

@app.get('/add_to_shopping_list/{recipe_id}')
async def add_to_shopping_list(request: Request, recipe_id):
    print(f"Recipe ID: {recipe_id}")
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    db_session = get_db_session()
    recipe = db_session.query(Recipe).filter_by(RecipeID=str(recipe_id)).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    user = db_session.query(User).filter_by(UserID=request.session['user_id']).first()
    print(f"Current UserID: {user.UserID}")
    # Add ingredients to the shopping list
    existing_items = db_session.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
    existing_ingredient_names = set(item.IngredientName for item in existing_items)

    new_items = []
    for ingredient in recipe.ingredients:
        if ingredient.IngredientName not in existing_ingredient_names:
            new_item = ShoppingListItem(
                UserID=user.UserID,
                IngredientName=ingredient.IngredientName
            )
            new_items.append(new_item)
    print(f"Ingredient names: {new_items}")
    db_session.add_all(new_items)
    db_session.commit()
    return RedirectResponse(url='/shopping_list', status_code=302)

@app.get('/shopping_list', response_class=HTMLResponse)
async def view_shopping_list_get(request: Request):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    db_session = get_db_session()
    user = db_session.query(User).filter_by(UserID=request.session['user_id']).first()
    shopping_list_items = db_session.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
    shopping_list = [item.IngredientName for item in shopping_list_items]
    return templates.TemplateResponse(
        'shopping_list.html',
        {
            'request': request,
            'shopping_list': shopping_list,
            'user_id': request.session.get('user_id')
        }
    )

@app.post('/shopping_list', response_class=HTMLResponse)
async def view_shopping_list_post(request: Request):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    db_session = get_db_session()
    user = db_session.query(User).filter_by(UserID=request.session['user_id']).first()
    form = await request.form()
    shopping_list_input = form.get('shopping_list').split('\n')
    shopping_list_input = [item.strip() for item in shopping_list_input if item.strip()]
    shopping_list = shopping_list_input

    # Clear existing shopping list items
    db_session.query(ShoppingListItem).filter_by(UserID=user.UserID).delete()

    # Add updated shopping list items
    new_items = [
        ShoppingListItem(UserID=user.UserID, IngredientName=item)
        for item in shopping_list_input
    ]
    db_session.add_all(new_items)
    db_session.commit()

    return templates.TemplateResponse(
        'shopping_list.html',
        {
            'request': request,
            'shopping_list': shopping_list,
            'user_id': request.session.get('user_id')
        }
    )

@app.get('/save_shopping_list')
async def save_shopping_list(request: Request):
    if 'user_id' not in request.session:
        return RedirectResponse(url='/login', status_code=302)
    db_session = get_db_session()
    shopping_list_items = db_session.query(ShoppingListItem).filter_by(UserID=request.session['user_id']).all()
    if not shopping_list_items:
        return Response(content="Your shopping list is empty.", status_code=400)

    shopping_list = [item.IngredientName for item in shopping_list_items]
    shopping_list_text = '\n'.join(shopping_list)

    # Create a response object to download the file
    response = Response(content=shopping_list_text, media_type='text/plain')
    response.headers['Content-Disposition'] = 'attachment; filename=shopping_list.txt'
    return response

@app.on_event("startup")
def startup_event():
    db_session = get_db_session()
    public_recipes = db_session.query(Recipe).filter_by(Visibility=True).all()
    for recipe in public_recipes:
        print(f"Recipe: {recipe.RecipeName}, Author: {recipe.user.Name}")
    db_session.close()

if __name__ == "__main__":

    uvicorn.run("shoppinglist:app", port=5000, log_level="info", reload=True)
