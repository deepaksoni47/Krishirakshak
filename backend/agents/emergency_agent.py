from backend.graph.state import AgentState

def emergency_agent(state: AgentState) -> AgentState:
    """
    Emergency Agent Node.
    Invoked when crop risk score is High or Critical (risk_score >= 70).
    Sets urgent warnings and updates execution paths.
    """
    warning_msg = "Crop is at critical risk."
    priority_level = state.get("priority") or "Immediate Intervention"
    
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Emergency Agent")
    
    return {
        **state,
        "warning": warning_msg,
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Emergency Agent",
            "message": warning_msg,
            "warning": warning_msg,
            "priority": priority_level
        }
    }
