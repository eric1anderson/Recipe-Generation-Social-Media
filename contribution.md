- Aparajith Raghuvir:
  - Tech stack: python, fastapi, sqlalchemy, nextjs
  - Created the LLM recipe generator workflow, the LLM recipe generator endpoint.
  - Created all recipe related endpoints
  - Created all allergy endpoints
  - Integrated recipe and LLM gen endpoints with the frontend
  - Integrated the admin page workflow with admin and recipe edit, delete endpoints
  - Created tests for recipe and LLM recipe generation related endpoints
  - Created the final video submission
- Jeet Sharma:  
  - Tech stack: Python, FastAPI, SQLAlchemy, NextJs
  - Developed the backend for social media functionality, including:  
    - Social media feed with the ability to auto filter recipes based on user allergens.  
    - Features to comment on recipes in the social media feed.  
    - Feature to like recipes on the social media feed.  
    - Implemented recipe bookmarking functionality, allowing users to save recipes to a private folder.  
  - Integrated all social media-related endpoints with the frontend templates.  
  - Created test files for social media endpoints.  
  - Contributed to `models.py` by creating models for social media features.  

- Tarun Gowda:
  - Tech stack: Python, FastAPI, Next.js, Tailwind CSS
  - Designed the UI/UX for the website.
  - Wrote the verify endpoint for bearer token verification.
  - Created authorization and authentication in frontend with route protection and session.
  - Role based authorization.
  - Created login, signup, bookmark pages.
  - Created filters for the main page.
  - Upload recipes for user.
  - Final optimization, type language, UI changes.
- Sheng-Kai Wen:
  - Tech stack: Next.js, Tailwind CSS, TypeScript
  - Developed Navbar, Footer, CommentList, DialogBox, RecipeList and RecipePageList components.
  - Implemented page templates for admin page, edit-recipe-page, shoppinglist-page, upload-recipe, user-page and user-profile page to facilitate integration.
  - Implemented the confirm password functionality for the registration page.
  - Created the user-profile page, displaying the user's name and allowing them to add allergy ingredients.
  - Built the shopping-list page, enabling users to view, update, and delete items in their shopping list.
- Eric Anderson:
  - Tech stack: python, fastapi, sqlalchemy
  - Created models.py which defines the database used throughout the project. Defines Users, Recipes, Ingredients, Allergy, Social Media, Comments, Bookmarks, Shopping List Items. Used by every backend endpoint.
  - Created all authorization endpoints in auth.py which is connected to frontend login page created by Tarun. Auth is used to get current users information in all other backend endpoints.
  - Created all shopping list endpoints in shoppinglist.py which is connected to frontend pages created by Sheng-Kai. Functionality allows users to export recipes to shopping list, edit, and save shopping lists.
  - Created test_auth.py and test_shopping_list.py to ensure all auth and shopping list endpoints are running properly.
  - Created test_data.py which adds an admin user to the program.