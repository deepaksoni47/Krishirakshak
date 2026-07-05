from backend.graph.state import AgentState

import time
from backend.config import (
    DISEASE_CONFIDENCE_THRESHOLD,
    LOCATION_REQUIRED,
    CROP_STAGE_REQUIRED,
    SPRAY_STATUS_REQUIRED
)

def clarification_agent(state: AgentState) -> AgentState:
    """
    Clarification Agent Node.
    Audits the case state for missing or insufficient parameters, generates clarification questions,
    and transitions the workflow into a paused state if information is missing.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Clarification Agent")
    
    # 1. Audit missing information and generate targeted questions
    questions = []
    missing_items = []
    
    # A) Missing Image (if Disease Diagnosis requested)
    if case.planner_output.intent == "DiseaseDiagnosis" and not case.uploaded_images.image_uploaded:
        q = "Please upload a crop image for visual diagnostics."
        questions.append(q)
        missing_items.append("High-quality leaf image")
        
    # B) Blurry Image (low confidence disease analysis)
    elif case.uploaded_images.image_uploaded and case.confidence_scores.confidence is not None:
        if case.confidence_scores.confidence < DISEASE_CONFIDENCE_THRESHOLD:
            q = "Please upload a clearer close-up of the affected leaf."
            questions.append(q)
            missing_items.append("Clearer crop image showing symptoms")
            
    # C) Missing Location
    if LOCATION_REQUIRED:
        loc = (case.farmer_info.location or "").strip()
        if not loc or loc.lower() in ("unknown", "none"):
            q = "Which district and state is your farm located in?"
            questions.append(q)
            missing_items.append("Location (district and state)")
            
    # D) Missing Crop Stage
    if CROP_STAGE_REQUIRED and not case.crop_stage:
        q = "Is your crop in the seedling, vegetative, flowering, or fruiting stage?"
        questions.append(q)
        missing_items.append("Crop growth stage")
        
    # E) Missing Spray Status
    if SPRAY_STATUS_REQUIRED and not case.sprayed_recently:
        q = "Has this crop already been sprayed in the last seven days?"
        questions.append(q)
        missing_items.append("Previous pesticide usage")
        
    # 2. Update missing_information list on FarmerCase
    for item in missing_items:
        if item not in case.missing_information:
            case.missing_information.append(item)
            
    # 3. Handle question staging
    new_questions_found = False
    for q in questions:
        if q not in case.requested_questions:
            case.requested_questions.append(q)
            case.remaining_questions.append(q)
            new_questions_found = True
            
    # 4. Update clarification block
    if case.remaining_questions:
        case.clarification.required = True
        case.clarification.status = "waiting"
        case.clarification.questions = list(case.remaining_questions)
        case.clarification.reason = f"Missing required details: {', '.join(missing_items)}"
        
        msg = "Clarification required. Please provide the requested details."
        case.disease_analysis.message = msg
        case.disease_analysis.result = {
            "agent": "Clarification Agent",
            "message": msg,
            "questions": list(case.remaining_questions)
        }
        action_text = f"Paused workflow and requested {len(case.remaining_questions)} clarification questions"
    else:
        case.clarification.required = False
        case.clarification.status = "satisfied"
        action_text = "All clarifications satisfied"
        
    # Record tracking details
    if "Clarification Agent" not in case.executed_agents:
        case.executed_agents.append("Clarification Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Clarification Agent"] = duration
    
    # Log workflow history
    case.log_workflow("Clarification Agent", action_text)
    print(f"\nClarification requested: {case.remaining_questions}\n" if case.remaining_questions else "\nClarification satisfied.\n")
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

