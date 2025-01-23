# database.py
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)

db = client["SecureGovtDB"]  
users_collection = db["users"]

# Add collection for digital procurement
digital_procurements_collection = db["digital_procurements"]
