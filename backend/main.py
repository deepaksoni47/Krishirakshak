import os
import io
import uvicorn
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables (required for LangSmith tracing)
load_dotenv()

# Base directory (kept for any future disk needs)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from backend.schemas.request import AnalyzeRequest, AnalyzeResponse
from backend.graph.workflow import compiled_graph

app = FastAPI(
    title="KrishiRakshak AI Backend",
    description="Multi-Agent Climate-Adaptive Farming Advisor API (Phase 6 — Treatment & Intervention)",
    version="6.0.0"
)

# (No disk uploads folder needed — images are handled in-memory)

# Configure CORS — allow localhost for dev and all Vercel/custom URLs for prod
# You can add your custom domain here too
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Extra origins from environment variable (comma-separated)
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Status endpoint to verify backend operation.
    """
    return {"message": "KrishiRakshak AI Backend Running"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_crop(
    crop_name: str = Form(...),
    query: str = Form(...),
    image_uploaded: bool = Form(...),
    location: str = Form("Dhamtari, Chhattisgarh"),
    image: Optional[UploadFile] = File(None)
):
    """
    Submit analysis request to the multi-agent system (Phase 4 LangGraph Execution with Gemini Vision & Weather).
    """
    image_bytes = None
    
    # 1. Validate image upload if checked
    if image_uploaded:
        if not image:
            raise HTTPException(status_code=400, detail="Image asset required when image_uploaded is checked.")
        
        # Validate MIME type and file extension
        allowed_types = ["image/png", "image/jpeg", "image/jpg"]
        content_type = image.content_type
        
        filename_ext = os.path.splitext(image.filename)[1].lower()
        if filename_ext not in [".png", ".jpg", ".jpeg"] or content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file extension ({filename_ext}) or MIME type ({content_type}). Only PNG, JPG, JPEG are allowed."
            )
            
        # Validate File Size (max 5MB) — read into memory
        image_bytes = await image.read()
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size exceeds 5MB limit.")

    # 2. Setup initial LangGraph state dict
    initial_state = {
        "crop_name": crop_name,
        "query": query,
        "image_uploaded": image_uploaded,
        "image_path": None,           # Deprecated — kept for schema compat
        "image_bytes": image_bytes,   # In-memory image bytes (or None)
        "route": None,
        "workflow_path": [],
        "result": None,
        "disease_name": None,
        "confidence": None,
        "severity": None,
        "symptoms": [],
        "recommendation": None,
        "message": None,
        "location": location,
        "weather_data": None,
        "rain_probability": None,
        "humidity": None,
        "temperature": None,
        "weather_risk": None,
        "alert": None,
        "alert_advice": None,
        "risk_score": None,
        "risk_level": None,
        "risk_factors": None,
        "priority": None,
        "warning": None,
        # Phase 6: Treatment & Intervention Agent
        "treatment_plan": None,
        "recommended_actions": None,
        "action_timeline": None,
        "estimated_cost": None,
        "expected_recovery_days": None,
        "intervention_priority": None,
        # Phase 7: Government Scheme Advisor Agent
        "eligible_schemes": None,
        "scheme_recommendations": None,
        "financial_support_score": None
    }
    
    # 3. Invoke compiled graph
    final_state = compiled_graph.invoke(initial_state)
    
    # 4. Map final state values to response schema
    return AnalyzeResponse(
        workflow_path=final_state.get("workflow_path", []),
        route=final_state.get("route"),
        disease_name=final_state.get("disease_name"),
        confidence=final_state.get("confidence"),
        severity=final_state.get("severity"),
        symptoms=final_state.get("symptoms"),
        recommendation=final_state.get("recommendation"),
        message=final_state.get("message"),
        temperature=final_state.get("temperature"),
        humidity=final_state.get("humidity"),
        rain_probability=final_state.get("rain_probability"),
        weather_risk=final_state.get("weather_risk"),
        alert=final_state.get("alert"),
        alert_advice=final_state.get("alert_advice"),
        risk_score=final_state.get("risk_score"),
        risk_level=final_state.get("risk_level"),
        risk_factors=final_state.get("risk_factors"),
        priority=final_state.get("priority"),
        warning=final_state.get("warning"),
        result=final_state.get("result"),
        # Phase 6: Treatment & Intervention Agent
        treatment_plan=final_state.get("treatment_plan"),
        recommended_actions=final_state.get("recommended_actions"),
        action_timeline=final_state.get("action_timeline"),
        estimated_cost=final_state.get("estimated_cost"),
        expected_recovery_days=final_state.get("expected_recovery_days"),
        intervention_priority=final_state.get("intervention_priority"),
        # Phase 7: Government Scheme Advisor Agent
        eligible_schemes=final_state.get("eligible_schemes"),
        scheme_recommendations=final_state.get("scheme_recommendations"),
        financial_support_score=final_state.get("financial_support_score")
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
