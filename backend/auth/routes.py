from fastapi import APIRouter, HTTPException
from auth.models import User, Login
from auth.hashing import hash_password, verify_password
from database import db, users_collection

router = APIRouter()

@router.post("/register")
async def register(user: User):
    try:
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # Hash the password and insert the user
        hashed_password = hash_password(user.password)
        user_data = {
            "full_name": user.full_name,
            "email": user.email,
            "password": hashed_password,
        }

        # Insert into the database
        result = await users_collection.insert_one(user_data)
        print(f"Inserted User ID: {result.inserted_id}")  # Log the inserted ID

        return {"message": "User registered successfully"}
    except Exception as e:
        print(f"Error during registration: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login")
async def login(credentials: Login):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful"}
