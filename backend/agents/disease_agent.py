from backend.graph.state import AgentState
from backend.tools.gemini_vision import analyze_crop_image

def disease_agent(state: AgentState) -> AgentState:
    """
    AI-Powered Disease Agent.
    Invokes Gemini Vision to analyze the crop image and updates the graph state keys.
    
    Supports in-memory image bytes (production) with fallback to file path (local dev legacy).
    """
    # Prefer in-memory bytes (production) over file path (legacy local dev)
    image_bytes = state.get("image_bytes")
    image_path = state.get("image_path")
    image_source = image_bytes if image_bytes is not None else image_path

    crop_name = state.get("crop_name", "")
    query = state.get("query", "")
    
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
    
    return {
        **state,
        "disease_name": analysis.get("disease_name"),
        "confidence": analysis.get("confidence"),
        "severity": analysis.get("severity"),
        "symptoms": analysis.get("symptoms"),
        "recommendation": analysis.get("recommendation"),
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Disease Agent",
            "message": f"Completed analysis for crop: {crop_name}.",
            **analysis
        }
    }
