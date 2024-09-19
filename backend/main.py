from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def test_endpoint():
  return {"Hello": "World"}

if __name__ == "__main__":
  uvicorn.run("main:app", port=5000, log_level="info", reload=True)