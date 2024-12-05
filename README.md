# Recipe App

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
