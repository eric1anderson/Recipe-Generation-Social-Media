from fastapi import FastAPI
import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from database import init_db
from routers import shoppinglist, auth, llm_recipes, social_media
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# app.add_middleware(SessionMiddleware, secret_key='your_secret_key')  # Replace with a secure secret key
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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