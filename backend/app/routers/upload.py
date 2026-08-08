from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.imagekit_client import upload_image_to_imagekit

router = APIRouter(prefix="/api/upload-image", tags=["Upload"])

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
        
    url = upload_image_to_imagekit(file_bytes, file.filename or "photo.jpg")
    return {"url": url}
