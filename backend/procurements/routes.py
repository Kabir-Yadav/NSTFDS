# procurements/routes.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import shutil
from datetime import date
from auth.models import DigitalProcurement  # Ensure correct import based on your project structure
from database import digital_procurements_collection
from datetime import datetime as dt, date as dte
from fastapi.encoders import jsonable_encoder


router = APIRouter()

@router.post("/digital-procurements/")
async def create_digital_procurement(
    date: dte = Form(...),
    device_category: str = Form(...),
    status: str = Form(...),
    serial_id: str = Form(...),
    photo: UploadFile = File(...)
):
    try:
        import os, shutil
        os.makedirs("static/uploads", exist_ok=True)

        photo_path = f"static/uploads/{photo.filename}"
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = f"/static/uploads/{photo.filename}"

        procurement_data = DigitalProcurement(
            date=date,
            device_category=device_category,
            status=status,
            serial_id=serial_id,
            photo_url=photo_url
        )

        from datetime import datetime as dt, date as dte
        record = procurement_data.dict()

        # Convert datetime.date to datetime.datetime if necessary
        if isinstance(record.get("date"), dte) and not isinstance(record.get("date"), dt):
            record["date"] = dt.combine(record["date"], dt.min.time())

        print("Attempting to insert record:", record)

        result = await digital_procurements_collection.insert_one(record)
        print("Insertion result:", result.inserted_id)

        created_record = await digital_procurements_collection.find_one({"_id": result.inserted_id})
        if created_record and "_id" in created_record:
            created_record["_id"] = str(created_record["_id"])

        # Use jsonable_encoder to handle non-serializable objects like datetime
        return JSONResponse(jsonable_encoder(created_record))
    except Exception as e:
        print(f"Error in /digital-procurements/: {e}")
        raise HTTPException(status_code=500, detail=str(e))
