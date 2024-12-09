# Recipe App

<iframe src="https://drive.google.com/file/d/1IuPFd4boW2R30m0xGxJ30KKvfTrpbwIp/preview" width="250" height="200" allow="autoplay"></iframe>

## Motivation
Upon moving to Amherst, many individuals often realize that their cooking skills may need improvement. 
They frequently find themselves searching through multiple blogs for recipes, only to discover that some required ingredients are missing or cannot be used due to allergies. This experience has inspired the idea of creating a more efficient way to find and generate recipes that align with what is already available in one's pantry. 
The goal of this web app is to simplify meal preparation and ensure that cooking becomes a less stressful and more enjoyable experience, especially for those who are still learning.

## Objective
The aim of this web app is to offer users a flexible and convenient platform to explore and create customized recipes. 
The app enables users to select recipes based on dietary preferences, allergies, or available ingredients and generates recipes through a large language model (LLM). 
Users can share this creation, generate shopping lists from selected recipes, and streamline their cooking experience. The app aims to eliminate the frustration of missing ingredients and make cooking more accessible and enjoyable.


## Frontend
- Nextjs
- Tailwind

## Backend
- FastAPI

### Initial Setup
```bash
git clone https://github.com/ibizabroker/520-project.git


# frontend
cd frontend
npm install
npm run dev # should run on port 3000


# backend
cd ../backend # if in root folder: cd backend
pip install virtualenv
virtualenv venv
# activate the environment
.\venv\Scripts\activate # windows
source venv/bin/activate # mac

pip install -r requirements.txt
# IMPORTANT: Add your OpenAI API key to backend/routers/recipes.py
# Add your secret key to backend/routers/auth.py
python3 init_db.py
python3 test_data.py # to optionally populate the database with content and to add an admin user
python3 main.py # should run on port 5000

# testing
# navigate to /backend
# the backend nor frontend need to be active for these tests
pytest test_auth.py # to test authentication endpoints
pytest test_llm_recipes.py # to test recipe generation endpoints
pytest test_recipes.py # to test recipe endpoints
pytest test_shopping_list.py # to test shopping list endpoints
pytest test_social_media.py # to test social media endpoints  
```

## User Guide
- Start by registering with your email, name and password
- On the homepage (user-page) you'll find your social media feed displaying public recipes, options to filter by cuisines types and an option to generate recipes.
- Before diving in, you'll want to start by selecting your profile name and adding any dietary restrictions you have.
- Click 'Recipe App' to return to the home page. To generate a recipe, enter the name of the dish you want to create. Be sure to add the list of ingredients that you have available as well as any dietary restrictions. (Type the name of the ingredient then press enter to add it.)
- Once your recipe is generated you can save it
- You can also upload your own recipes by clicking on 'Upload Recipe'. Here you can fill out the name of your dish, the type of cuisine, any ingredients, and the recipe itself.
- Back on your home you'll find your recipes. You can like, bookmark, comment on, or add this recipe to your Shopping List. These social media posts are public so other users are free to interact with and save your recipe as well.
- If you find a recipe you plan to cook, be sure to add it to your shopping list. Navigating to the Shopping List tab, you'll find your current shopping list where you can add or remove any ingredients.


## Admin Guide
- Admins are added manually to the database to prevent regular users access from creating a privileged account. 
- An admin account can be activated by running backend/test_data.py. Here, example users are added to the database as well as an admin account with the email: 'admin@example.com' and password: 'root'
- Admins have access to edit and delete any recipes on the platform

### Endpoints
#### Auth
1. POST at `http://127.0.0.1:5000/signup`
```bash
request - name, email, password
response - {
  "access_token": string,
  "username": string,
  "token_type": string,
  "role": boolean
}
```

2. POST at `http://127.0.0.1:5000/login`
```bash
request - email, password
response - {
  "access_token": string,
  "token_type": string,
  "role": boolean,
  "name": string
}
```

3. GET at `http://127.0.0.1:5000/auth/verify`
```bash
response - {
  "user_id": uuid,
  "role": boolean,
  "email": email,
}
```

#### Recipes
1. POST at `http://127.0.0.1:5000/generate-recipe`
```bash
response - {
  "title": string,
  "content": string,
  "ingredients": List[string],
  "userGenerated": boolean,
  "cuisine": string,
}
```

2. POST at `http://127.0.0.1:5000/recipes`
```bash
request - ingredients, userGenerated, cuisine
response - {
  "message": string, 
  "id": uuid
}
```

3. GET at `http://127.0.0.1:5000/recipes/{recipe_id}`
```bash
response - {
  "recipeID": string,
  "userID": string,
  "recipeName": string,
  "recipeContent": string,
  "cuisine": string,
  "visibility": boolean
}
```

4. GET at `http://127.0.0.1:5000/recipesall`
```bash
response - [{
  "recipeID": string,
  "userID": string,
  "recipeName": string,
  "recipeContent": string,
  "cuisine": string,
  "visibility": boolean
}]
```

5. PUT at `http://127.0.0.1:5000/recipes/{recipe_id}`
```bash
request - recipeID, recipeName, recipeContent
response - {
  "recipeID": string,
  "userID": string,
  "recipeName": string,
  "recipeContent": string,
  "cuisine": string,
  "visibility": boolean
}
```

6. DELETE at `http://127.0.0.1:5000/recipes/{recipe_id}`
```bash
request - recipeID
response - {
  "message": "Recipe deleted successfully"
}
```

7. POST at `http://127.0.0.1:5000/allergies`
```bash
request - ingredient
response - {
  "message": "Allergy created successfully."
}
```

8. GET at `http://127.0.0.1:5000/allergies/{allergy_id}`
```bash
response -  [{
  "allergyID": uuid,
  "ingredientName": string
}]
```

9. PUT at `http://127.0.0.1:5000/allergies/{allergy_id}`
```bash
request - allergy_id, ingredient
response - {
  "allergyID": uuid,
  "ingredientName": string
}
```

10. DELETE at `http://127.0.0.1:5000/allergies/{allergy_id}`
```bash
response - {
  "message": "Allergy deleted successfully"
}
```

11. GET at `http://127.0.0.1:5000/check_allergens/{recipe_id}`
```bash
response - {
  "result": 0 // 0 or 1 depending on yes or no
}
```

12. GET at `http://127.0.0.1:5000/ingredients/{recipe_id}`
```bash
response - {
  "ingredients": List[string]
}
```

#### Shopping List
1. GET at `http://127.0.0.1:5000/recipes`
```bash
response - [{
  "recipeID": uuid,
  "recipeName": string
}]
```

2. GET at `http://127.0.0.1:5000/add_to_shopping_list/{recipe_id}`
```bash
response - { 
  "message": "Ingredients added to shopping list"
}
```

3. GET at `http://127.0.0.1:5000/shopping_list`
```bash
respoonse - {
  "shopping_list": List[string]
}
```

4. POST at `http://127.0.0.1:5000/shopping_list`
```bash
request - shoppingList
response - {
  { "message": "Shopping list updated"}
}
```

5. DELETE at `http://127.0.0.1:5000/delete_ingredient/{ingredient_name}`
```bash
response - {
  "message": "Shopping list updated"
}
```

6. GET at `http://127.0.0.1:5000/save_shopping_list`
```bash 
response - { 
  "shopping_list": List[string]
}
```

#### Social Media
1. POST at `http://127.0.0.1:5000/add_post`
```bash
request - recipeID
response - {
  "message": "Recipe visibility updated to public and added to social media",
  "SMID": uuid
}
```

2. GET at `http://127.0.0.1:5000/posts`
```bash
response - {
  "posts": [{
      "SMID": uuid,
      "Likes": integer,
      "Recipe": {
        "recipeID": string,
        "userID": string,
        "recipeName": string,
        "recipeContent": string,
        "cuisine": string,
        "visibility": boolean
      }
  }]
}
```

3. GET at `http://127.0.0.1:5000/posts/{SMID}`
```bash
response - {
  "post": {
    "SMID": uuid,
    "Likes": integer,
    "Recipe": {
      "recipeID": string,
      "userID": string,
      "recipeName": string,
      "recipeContent": string,
      "cuisine": string,
      "visibility": boolean
    }
  }
}
```

4. POST at `http://127.0.0.1:5000/like_post/{SMID}`
```bash
response - {
  "message": "Post liked successfully", 
  "Likes": integer
}
```

5. POST at `http://127.0.0.1:5000/unlike_post`
```bash
response - {
  "message": "Post unliked successfully"
}
```

6. POST at `http://127.0.0.1:5000/add_bookmark`
```bash
request - recipeID
response - {
  "message": "Bookmark added successfully"
}
```

7. GET at `http://127.0.0.1:5000/bookmark`
```bash
response - {
  "bookmarks": [{
    "SMID": uuid,
    "BookmarkID": uuid,
    "Recipe": {
      "recipeID": string,
      "userID": string,
      "recipeName": string,
      "recipeContent": string,
      "cuisine": string,
      "visibility": boolean
    }
  }]
}
```

8. POST at `http://127.0.0.1:5000/add_comment`
```bash
request - SMID, comment_text
response - {
  "message": "Comment added successfully"
}
```

9. GET at `http://127.0.0.1:5000/comments/{smid}`
```bash
{
  "comments": {
    "CommentID": uuid,
    "CommentText": string,
    "UserID": uuid,
    "UserName": string,
  }
}
```