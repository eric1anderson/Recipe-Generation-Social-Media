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
# Add your OpenAI API key to backend/routers/recipes.py
# Add your secret key to backend/routers/auth.py
python3 main.py # should run on port 5000
```
