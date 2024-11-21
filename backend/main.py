from fastapi import FastAPI
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from database import init_db
from routers import shoppinglist, auth, llm_recipes, social_media

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key='your_secret_key')  # Replace with a secure secret key

init_db()

app.include_router(shoppinglist.router)
app.include_router(auth.router)
app.include_router(llm_recipes.router)
app.include_router(social_media.router)

@app.get("/")
async def test_endpoint():
    return {"Hello": "World"}

if __name__ == "__main__":
    uvicorn.run("main:app", port=5000, log_level="info", reload=True)