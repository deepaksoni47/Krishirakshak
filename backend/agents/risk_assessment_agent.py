from backend.graph.state import AgentState

def risk_assessment_agent(state: AgentState) -> AgentState:
    """
    Risk Assessment Agent Node.
    Aggregates disease parameters and weather indicators to determine overall crop health risk.
    """
    # 1. Disease Severity Score
    severity = state.get("severity") or "Low"
    if severity == "High":
        severity_score = 40
    elif severity == "Medium":
        severity_score = 25
    else:
        severity_score = 10
        
    # 2. Disease Confidence Score
    confidence = state.get("confidence") or 0
    if confidence >= 80:
        confidence_score = 20
    elif confidence >= 60:
        confidence_score = 10
    else:
        confidence_score = 0
        
    # 3. Rain Probability Score
    rain_probability = state.get("rain_probability") or 0.0
    if rain_probability >= 80:
        rain_score = 20
    elif rain_probability >= 50:
        rain_score = 10
    else:
        rain_score = 0
        
    # 4. Humidity Score
    humidity = state.get("humidity") or 0.0
    if humidity >= 80:
        humidity_score = 15
    elif humidity >= 60:
        humidity_score = 8
    else:
        humidity_score = 0
        
    # 5. Compute Total Risk Score
    risk_score = severity_score + confidence_score + rain_score + humidity_score
    
    # 6. Risk Level Classification
    if risk_score >= 90:
        risk_level = "Critical"
    elif risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    # 7. Priority Assignment
    if risk_level == "Critical":
        priority = "Immediate Intervention"
    elif risk_level == "High":
        priority = "Action Required"
    elif risk_level == "Medium":
        priority = "Monitor"
    else:
        priority = "Routine"
        
    # 8. Generate Risk Factors Explanation List
    risk_factors = []
    if severity == "High":
        risk_factors.append("High disease severity")
    elif severity == "Medium":
        risk_factors.append("Medium disease severity")
    else:
        risk_factors.append("Low disease severity")
        
    if rain_probability >= 80:
        risk_factors.append("Heavy rainfall expected")
    elif rain_probability >= 50:
        risk_factors.append("Moderate rainfall expected")
        
    if humidity >= 80:
        risk_factors.append("Humidity above 80%")
    elif humidity >= 60:
        risk_factors.append("Moderate humidity levels")
        
    # 9. Update trace path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Risk Assessment Agent")
    
    return {
        **state,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "priority": priority,
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Risk Assessment Agent",
            "message": f"Assessed crop risk level as {risk_level} (Score: {risk_score}).",
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "priority": priority
        }
    }
