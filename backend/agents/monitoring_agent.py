from backend.graph.state import AgentState

def monitoring_agent(state: AgentState) -> AgentState:
    """
    Monitoring Agent Node.
    Invoked when crop risk score is Low or Medium (risk_score < 70).
    Sets general preventive messages and updates execution paths.
    """
    message_text = "Continue monitoring crop condition."
    
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Monitoring Agent")
    
    return {
        **state,
        "message": message_text,
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Monitoring Agent",
            "message": message_text
        }
    }
