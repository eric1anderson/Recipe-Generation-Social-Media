from flask import Flask, render_template, request, redirect, url_for, session, make_response
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import bcrypt

from models import *

import uvicorn


app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure secret key

# Database setup
engine = create_engine('sqlite:///mydatabase.db', connect_args={'check_same_thread': False})
Base.metadata.bind = engine
DBSession = scoped_session(sessionmaker(bind=engine))



# Helper function to get the current database session
def get_db_session():
    return DBSession()

#### **User Authentication Routes**
@app.route('/login', methods=['GET', 'POST'])
def login():
    db_session = get_db_session()
    error = None
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password'].encode('utf-8')
        user = db_session.query(User).filter_by(Email=email).first()
        if user and bcrypt.checkpw(password, user.Password.encode('utf-8')):
            session.clear()
            session['user_id'] = user.UserID
            return redirect(url_for('recipes'))
        else:
            error = 'Invalid email or password.'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.clear()
    return redirect(url_for('login'))

@app.route('/recipes')
def recipes():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    db_session = get_db_session()
    user = db_session.query(User).filter_by(UserID=session['user_id']).first()
    return render_template('recipes.html', recipes=user.recipes)

@app.route('/add_to_shopping_list/<recipe_id>')
def add_to_shopping_list(recipe_id):
    print(f"Recipe ID: {recipe_id}")
    if 'user_id' not in session:
        return redirect(url_for('login'))
    db_session = get_db_session()
    recipe = db_session.query(Recipe).filter_by(RecipeID=recipe_id).first()
    if not recipe:
        return "Recipe not found.", 404

    user = db_session.query(User).filter_by(UserID=session['user_id']).first()
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
    return redirect(url_for('view_shopping_list'))

@app.route('/shopping_list', methods=['GET', 'POST'])
def view_shopping_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    db_session = get_db_session()
    user = db_session.query(User).filter_by(UserID=session['user_id']).first()

    if request.method == 'POST':
        # Update shopping list from form input
        shopping_list_input = request.form.get('shopping_list').split('\n')
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
    else:
        shopping_list_items = db_session.query(ShoppingListItem).filter_by(UserID=user.UserID).all()
        shopping_list = [item.IngredientName for item in shopping_list_items]

    return render_template('shopping_list.html', shopping_list=shopping_list)


@app.route('/save_shopping_list')
def save_shopping_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    db_session = get_db_session()
    shopping_list_items = db_session.query(ShoppingListItem).filter_by(UserID=session['user_id']).all()
    if not shopping_list_items:
        return "Your shopping list is empty.", 400

    shopping_list = [item.IngredientName for item in shopping_list_items]
    shopping_list_text = '\n'.join(shopping_list)

    # Create a response object to download the file
    response = make_response(shopping_list_text)
    response.headers['Content-Disposition'] = 'attachment; filename=shopping_list.txt'
    response.mimetype = 'text/plain'
    return response

if __name__ == "__main__":

    public_recipes = session.query(Recipe).filter_by(Visibility=True).all()
    for recipe in public_recipes:
        print(f"Recipe: {recipe.RecipeName}, Author: {recipe.user.Name}")
    session.close()
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)