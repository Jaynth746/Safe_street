from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import shutil
import os
import uuid
from typing import Optional
from model_service import predict_damage
from email_service import send_email_report

app = FastAPI(title="Safe Street API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon/mobile
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files to serve images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Safe Street Backend is Running!"}

@app.post("/analyze")
async def analyze_road_image(
    roadImage: UploadFile = File(...), 
    email: Optional[str] = "admin@safestreet.com" # Default to admin if not provided
):
    try:
        # Generate unique filename
        file_extension = roadImage.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(roadImage.file, buffer)
            
        # 1. Analyze Image (ViT)
        analysis_result = predict_damage(file_path)
        
        # 2. Add Image URL to result
        # For emulator, we need the IP. For now, sending relative path or assuming localhost handling in app
        analysis_result["image_url"] = f"/uploads/{file_name}"
        
        # 3. Send Email Report
        email_sent = send_email_report(email, analysis_result)
        
        # 4. Return Response
        return {
            "success": True,
            "data": {
                "damageType": analysis_result["damage_type"],
                "severity": analysis_result["severity"],
                "confidence": analysis_result["confidence"],
                "description": analysis_result["summary"],
                "email_sent": email_sent
            }
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
