from backend.graph.state import AgentState
from backend.tools.gemini_vision import analyze_crop_image

import time

def disease_agent(state: AgentState) -> AgentState:
    """
    AI-Powered Disease Agent.
    Invokes Gemini Vision to analyze the crop image and updates the graph state keys.
    
    Supports in-memory image bytes (production) with fallback to file path (local dev legacy).
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    # Prefer in-memory bytes (production) over file path (legacy local dev) from FarmerCase
    image_bytes = case.uploaded_images.image_bytes
    image_path = case.uploaded_images.image_path
    image_source = image_bytes if image_bytes is not None else image_path

    crop_name = case.crop_details.crop_name
    query = case.crop_details.query
    
    if image_source:
        analysis = analyze_crop_image(image_source, crop_name, query)
    else:
        analysis = {
            "disease_name": "Undiagnosed (No Image)",
            "confidence": 0,
            "severity": "Low",
            "symptoms": ["No image file provided"],
            "recommendation": "Please upload a crop image for visual diagnostics."
        }
        
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Disease Agent")
    
    # Update FarmerCase sections
    case.disease_analysis.disease_name = analysis.get("disease_name")
    case.disease_analysis.severity = analysis.get("severity")
    case.disease_analysis.recommendation = analysis.get("recommendation")
    case.disease_analysis.result = {
        "agent": "Disease Agent",
        "message": f"Completed analysis for crop: {crop_name}.",
        **analysis
    }
    case.confidence_scores.confidence = analysis.get("confidence")
    case.symptoms = analysis.get("symptoms", [])
    
    # Record tracking details
    if "Disease Agent" not in case.executed_agents:
        case.executed_agents.append("Disease Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Disease Agent"] = duration
    
    # Log workflow history
    case.log_workflow(
        "Disease Agent", 
        f"Completed analysis. Diagnosed: {analysis.get('disease_name')} (Confidence: {analysis.get('confidence')}%)"
    )
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

