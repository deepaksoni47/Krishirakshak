from backend.graph.state import AgentState

import time

def emergency_agent(state: AgentState) -> AgentState:
    """
    Emergency Agent Node.
    Invoked when crop risk score is High or Critical (risk_score >= 70).
    Sets urgent warnings and updates execution paths.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    warning_msg = "Crop is at critical risk."
    priority_level = case.risk_assessment.priority or "Immediate Intervention"
    
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Emergency Agent")
    
    # Update FarmerCase sections
    case.risk_assessment.warning = warning_msg
    case.risk_assessment.result = {
        "agent": "Emergency Agent",
        "message": warning_msg,
        "warning": warning_msg,
        "priority": priority_level
    }
    
    # Record tracking details
    if "Emergency Agent" not in case.executed_agents:
        case.executed_agents.append("Emergency Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Emergency Agent"] = duration
    
    # Log workflow history
    case.log_workflow("Emergency Agent", f"Triggered emergency response: {warning_msg}")
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

