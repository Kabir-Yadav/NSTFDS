# models.py (extend existing content)
from pydantic import BaseModel, EmailStr
from datetime import date

class User(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

# New model for Digital Procurement entries
class DigitalProcurement(BaseModel):
    date: date
    device_category: str
    status: str            # e.g., "shipped" or "just deployed"
    serial_id: str
    photo_url: str         # URL/path to the stored photo
