# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router
from procurements.routes import router as procurements_router  # Import new router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(procurements_router)  # Include procurement endpoints

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
