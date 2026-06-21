from backend.graph.state import AgentState

def rain_alert_agent(state: AgentState) -> AgentState:
    """
    Rain Alert Agent Node.
    Generates agronomic warnings and alerts when forecasted rain exceeds threshold parameters.
    """
    # 1. Define rain alert and advice guidelines
    alert_msg = "Heavy rainfall expected."
    alert_advice = "Avoid fungicide spraying today."
    
    # 2. Append executing agent to workflow trace list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Rain Alert Agent")
    
    # 3. Update state keys and return payload dict
    return {
        **state,
        "alert": alert_msg,
        "alert_advice": alert_advice,
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Rain Alert Agent",
            "message": f"Rain Alert: {alert_msg} Advice: {alert_advice}",
            "alert": alert_msg,
            "advice": alert_advice
        }
    }
