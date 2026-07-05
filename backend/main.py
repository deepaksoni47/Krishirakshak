import os
import io
import uvicorn
import uuid
import json
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
from backend.db.repository import CaseRepository, CaseEventRepository

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
    request_id: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    case_id: Optional[str] = Form(None)
):
    """
    Submit analysis request to the multi-agent system.
    Supports dynamic planning, performance timing, and the clarification loop with pause/resume capabilities.
    """
    image_bytes = None
    is_resume = False
    existing_case = None
    config = None
    
    if request_id:
        config = {"configurable": {"thread_id": request_id}}
        state_snapshot = compiled_graph.get_state(config)
        if state_snapshot.values and "farmer_case" in state_snapshot.values:
            is_resume = True
            existing_case = state_snapshot.values["farmer_case"]
            
    # 1. Validate image upload if checked (and not already stored in checkpoint)
    if image_uploaded:
        if not image:
            if not is_resume or not existing_case or not existing_case.uploaded_images.image_bytes:
                raise HTTPException(status_code=400, detail="Image asset required when image_uploaded is checked.")
        else:
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

    # 2. Setup or resume LangGraph state dict with FarmerCase
    import datetime
    from backend.schemas.farmer_case import FarmerCase, FarmerInfo, CropDetails, UploadedImages, Metadata
    
    if is_resume and existing_case:
        farmer_case = existing_case
        req_id = request_id
        
        # Merge new image inputs if provided on resume
        if image_uploaded and image_bytes:
            farmer_case.uploaded_images.image_bytes = image_bytes
            farmer_case.uploaded_images.image_uploaded = True
            # Resolve image clarification questions
            for q in list(farmer_case.remaining_questions):
                if any(k in q.lower() for k in ["image", "photo", "picture", "clearer", "blurry"]):
                    farmer_case.remaining_questions.remove(q)
                    farmer_case.answered_questions.append(q)
                    
        # Merge text answers if query is provided
        if query:
            query_lower = query.lower()
            farmer_case.crop_details.query = query
            
            import re
            remaining = list(farmer_case.remaining_questions)
            for q in remaining:
                if "district" in q.lower() or "located" in q.lower():
                    farmer_case.farmer_info.location = location or query
                    if q in farmer_case.remaining_questions:
                        farmer_case.remaining_questions.remove(q)
                        farmer_case.answered_questions.append(q)
                elif "stage" in q.lower() or "growth" in q.lower():
                    for stage, keywords in [
                        ("seedling", [r"\bseedling\b"]),
                        ("vegetative", [r"\bvegetative\b", r"\bveg\b"]),
                        ("flowering", [r"\bflowering\b", r"\bflower\b"]),
                        ("fruiting", [r"\bfruiting\b", r"\bfruit\b"])
                    ]:
                        if any(re.search(pat, query_lower) for pat in keywords):
                            farmer_case.crop_stage = stage
                            if q in farmer_case.remaining_questions:
                                farmer_case.remaining_questions.remove(q)
                                farmer_case.answered_questions.append(q)
                            break
                elif "sprayed" in q.lower() or "pesticide" in q.lower():
                    if any(re.search(rf"\b{w}\b", query_lower) for w in ["yes", "no", "sprayed", "treatment", "fungicide", "applied"]):
                        farmer_case.sprayed_recently = "yes" if any(re.search(rf"\b{w}\b", query_lower) for w in ["yes", "applied"]) else "no"
                        if q in farmer_case.remaining_questions:
                            farmer_case.remaining_questions.remove(q)
                            farmer_case.answered_questions.append(q)
                            
        # Re-evaluate clarification status
        if not farmer_case.remaining_questions:
            farmer_case.clarification.required = False
            farmer_case.clarification.status = "satisfied"
            print(f"[main.py] Clarification satisfied. Resuming execution for thread {req_id}.")
        else:
            farmer_case.clarification.questions = list(farmer_case.remaining_questions)
        # Reset execution history flags so all downstream agents can run with the updated information
        farmer_case.executed_agents = ["Supervisor Agent"]
        
        farmer_case.log_workflow("Supervisor Agent", "Resumed workflow execution")
        
        # Update checkpoint state with merged information
        compiled_graph.update_state(config, {"farmer_case": farmer_case}, as_node="Supervisor Agent")
        
        # Invoke compiled graph with None to resume from checkpoint
        final_state = compiled_graph.invoke(None, config)
        final_case = final_state.get("farmer_case")
    else:
        # Create a new session
        req_id = request_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": req_id}}
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        
        # Resolve DB Case / Event baseline context
        case_record = None
        is_follow_up = False
        previous_event_id = None
        
        if case_id:
            case_record = CaseRepository.get_case(case_id)
            if case_record:
                is_follow_up = True
                prev_evt = CaseEventRepository.get_latest_event(case_id)
                if prev_evt:
                    previous_event_id = prev_evt.event_id
                    
        if not case_record:
            # Fallback or create new case
            case_record = CaseRepository.create_case(crop=crop_name, location=location or "Dhamtari, Chhattisgarh")
            case_id = case_record.case_id
            
        # Parse query for initial inputs if user already typed stage/location in original request
        import re
        crop_stage = None
        query_lower = query.lower()
        for stage, keywords in [
            ("seedling", [r"\bseedling\b"]),
            ("vegetative", [r"\bvegetative\b", r"\bveg\b"]),
            ("flowering", [r"\bflowering\b", r"\bflower\b"]),
            ("fruiting", [r"\bfruiting\b", r"\bfruit\b"])
        ]:
            if any(re.search(pat, query_lower) for pat in keywords):
                crop_stage = stage
                break
                
        sprayed_recently = None
        if any(re.search(rf"\b{w}\b", query_lower) for w in ["yes", "no", "sprayed", "treatment", "fungicide", "applied"]):
            sprayed_recently = "yes" if any(re.search(rf"\b{w}\b", query_lower) for w in ["yes", "applied"]) else "no"
            
        farmer_case = FarmerCase(
            farmer_info=FarmerInfo(location=location),
            crop_details=CropDetails(crop_name=crop_name, query=query),
            uploaded_images=UploadedImages(
                image_uploaded=image_uploaded,
                image_path=None,
                image_bytes=image_bytes
            ),
            metadata=Metadata(
                created_at=now_str,
                updated_at=now_str,
                request_id=req_id
            ),
            crop_stage=crop_stage,
            sprayed_recently=sprayed_recently
        )
        
        # Populate case_context properties
        farmer_case.case_context.case_id = case_id
        farmer_case.case_context.is_follow_up = is_follow_up
        farmer_case.case_context.previous_event_id = previous_event_id
        farmer_case.case_context.current_case_status = case_record.status
        
        initial_state = {
            "farmer_case": farmer_case,
            "workflow_path": [],
            "route": None
        }
        
        # Invoke compiled graph to start a new thread run
        final_state = compiled_graph.invoke(initial_state, config)
        final_case = final_state.get("farmer_case")

    # 3. Extract final executing agent's result to preserve backward compatibility
    workflow_path = final_state.get("workflow_path", [])
    last_agent = workflow_path[-1] if workflow_path else None
    result = None
    if final_case:
        if last_agent == "Scheme Advisor Agent":
            result = final_case.government_schemes.result
        elif last_agent == "Treatment Agent":
            result = final_case.treatment_plan.result
        elif last_agent in ("Emergency Agent", "Risk Assessment Agent"):
            result = final_case.risk_assessment.result
        elif last_agent in ("Monitoring Agent", "Clarification Agent", "Disease Agent", "Advisory Agent"):
            result = final_case.disease_analysis.result
        elif last_agent == "Weather Agent":
            result = final_case.weather_analysis.result
            
    # Resolve previous risk score for response mapping
    resolved_prev_risk_score = 0
    if final_case and final_case.case_context.case_id and final_case.case_context.is_follow_up:
        prev_evt = CaseEventRepository.get_latest_event(final_case.case_context.case_id)
        if prev_evt:
            resolved_prev_risk_score = prev_evt.risk_score or 0
            
    # Save to database only if workflow completed successfully (not paused)
    if final_case and not final_case.clarification.required:
        # Update status and summary in Case Table
        CaseRepository.update_case_status(
            case_id=final_case.case_context.case_id,
            status=final_case.case_context.current_case_status,
            latest_summary=final_case.disease_analysis.message
        )
        # Prepare snapshot dict, setting binary image bytes to None to permit clean JSON serialization
        case_dump = final_case.model_dump()
        if "uploaded_images" in case_dump and "image_bytes" in case_dump["uploaded_images"]:
            case_dump["uploaded_images"]["image_bytes"] = None
        snapshot_json = json.dumps(case_dump, default=str)
        
        # Create persistent event snap
        CaseEventRepository.create_event(
            case_id=final_case.case_context.case_id,
            event_type="follow_up" if final_case.case_context.is_follow_up else "diagnosis",
            snapshot=snapshot_json,
            disease_name=final_case.disease_analysis.disease_name,
            confidence=final_case.confidence_scores.confidence,
            severity=final_case.disease_analysis.severity,
            risk_score=final_case.risk_assessment.overall_score,
            risk_level=final_case.risk_assessment.risk_level,
            treatment_summary=", ".join(final_case.treatment_plan.recommended_actions) if final_case.treatment_plan.recommended_actions else None,
            critic_outcome=final_case.critic_review.status,
            clarification_state=final_case.clarification.status
        )
        print(f"[main.py] Case {final_case.case_context.case_id} event saved successfully.")
        
    # 4. Clarification Loop API mappings
    status_val = "success"
    questions_val = None
    wf_status_val = "completed"
    
    if final_case and final_case.clarification.required:
        status_val = "needs_clarification"
        questions_val = final_case.clarification.questions
        wf_status_val = "paused"
        print(f"[main.py] Workflow paused for request {req_id}. Missing: {final_case.clarification.reason}")
    else:
        print(f"[main.py] Workflow completed for request {req_id}.")
        
    # 5. Map final state values to response schema
    return AnalyzeResponse(
        workflow_path=workflow_path,
        route=final_state.get("route"),
        disease_name=final_case.disease_analysis.disease_name if final_case else None,
        confidence=final_case.confidence_scores.confidence if final_case else None,
        severity=final_case.disease_analysis.severity if final_case else None,
        symptoms=final_case.symptoms if final_case else None,
        recommendation=final_case.disease_analysis.recommendation if final_case else None,
        message=final_case.disease_analysis.message if final_case else None,
        temperature=final_case.weather_analysis.temperature if final_case else None,
        humidity=final_case.weather_analysis.humidity if final_case else None,
        rain_probability=final_case.weather_analysis.rain_probability if final_case else None,
        weather_risk=final_case.weather_analysis.weather_risk if final_case else None,
        alert=final_case.weather_analysis.alert if final_case else None,
        alert_advice=final_case.weather_analysis.alert_advice if final_case else None,
        risk_score=final_case.risk_assessment.risk_score if final_case else None,
        risk_level=final_case.risk_assessment.risk_level if final_case else None,
        risk_factors=final_case.risk_assessment.risk_factors if final_case else None,
        priority=final_case.risk_assessment.priority if final_case else None,
        warning=final_case.risk_assessment.warning if final_case else None,
        result=result,
        # Phase 6: Treatment & Intervention Agent
        treatment_plan=final_case.treatment_plan.treatment_plan if final_case else None,
        recommended_actions=final_case.treatment_plan.recommended_actions if final_case else None,
        action_timeline=final_case.treatment_plan.action_timeline if final_case else None,
        estimated_cost=final_case.treatment_plan.estimated_cost if final_case else None,
        expected_recovery_days=final_case.treatment_plan.expected_recovery_days if final_case else None,
        intervention_priority=final_case.treatment_plan.intervention_priority if final_case else None,
        # Phase 7: Government Scheme Advisor Agent
        eligible_schemes=final_case.government_schemes.eligible_schemes if final_case else None,
        scheme_recommendations=final_case.government_schemes.scheme_recommendations if final_case else None,
        financial_support_score=final_case.government_schemes.financial_support_score if final_case else None,
        # Phase 8: Clarification Loop Response Mapping
        status=status_val,
        questions=questions_val,
        workflow_status=wf_status_val,
        # Phase 9: Critic / Safety Layer Response Mapping
        critic_status=final_case.critic_review.status if final_case else None,
        cautious_recommendation=final_case.cautious_recommendation if final_case else None,
        critic_issues=[i.dict() for i in final_case.critic_review.issues] if (final_case and final_case.critic_review.issues) else None,
        # Phase 10: Explainable Risk Engine Response Mapping
        risk_confidence=final_case.risk_assessment.confidence if final_case else None,
        top_risk_drivers=final_case.risk_assessment.top_drivers if final_case else None,
        risk_factor_breakdown=[f.dict() for f in final_case.risk_assessment.factors] if (final_case and final_case.risk_assessment.factors) else None,
        risk_reasoning_summary=final_case.risk_assessment.reasoning_summary if final_case else None,
        # Phase 11: Case Memory & Monitoring Response Mapping
        case_id=final_case.case_context.case_id if final_case else None,
        is_follow_up=final_case.case_context.is_follow_up if final_case else False,
        progress_assessment=final_case.monitoring.progress_assessment if final_case else None,
        previous_risk_score=resolved_prev_risk_score,
        current_risk_score=final_case.risk_assessment.overall_score if final_case else None,
        escalation_required=final_case.monitoring.escalation_required if final_case else False,
        follow_up_recommended=final_case.monitoring.follow_up_recommended if final_case else False,
        next_follow_up_guidance=final_case.disease_analysis.message if final_case else None
    )



if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
