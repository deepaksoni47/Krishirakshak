import time
from backend.graph.state import AgentState
from backend.validation_policy import validate_case

def critic_agent(state: AgentState) -> AgentState:
    """
    Critic Agent Node (Phase 4).
    Validates FarmerCase recommendations against safety and quality policies.
    Determines if results can be finalized, replanned, clarified, or downgraded.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Critic Agent")
    
    # 1. Run safety validation policy check
    review = validate_case(case)
    
    # 2. Handle Downgraded Recommendations adjustments
    if review.status == "downgraded":
        # Check specific issues to write context-aware cautious recommendations
        weather_conflict = any(i.type == "weather_conflict" for i in review.issues)
        low_confidence = any(i.type == "low_confidence_spray" for i in review.issues)
        
        if low_confidence:
            disease_name = case.disease_analysis.disease_name or "detected anomaly"
            conf = case.confidence_scores.confidence or 0
            cautious_msg = f"Possible {disease_name}, but confidence is low ({conf}%). Please upload a clearer close-up before applying fungicide."
            case.cautious_recommendation = cautious_msg
            if case.treatment_plan:
                case.treatment_plan.recommended_actions = [cautious_msg] + case.treatment_plan.recommended_actions
                case.treatment_plan.result["message"] = f"CRITIC DOWNGRADE: {cautious_msg}"
            case.disease_analysis.message = f"CRITIC WARNING: {cautious_msg}"
        elif weather_conflict:
            cautious_msg = "Rain risk is high today, so postpone spraying and monitor symptoms for 24 hours."
            case.cautious_recommendation = cautious_msg
            if case.treatment_plan:
                # Add to recommended actions warning
                case.treatment_plan.recommended_actions = [cautious_msg] + case.treatment_plan.recommended_actions
                case.treatment_plan.result["message"] = f"CRITIC DOWNGRADE: {cautious_msg}"
            case.disease_analysis.message = f"CRITIC WARNING: {cautious_msg}"
        else:
            cautious_msg = "Recommendation quality has low confidence. Exercise caution and verify visual symptoms."
            case.cautious_recommendation = cautious_msg
            case.disease_analysis.message = f"CRITIC WARNING: {cautious_msg}"
            
    # 3. Log into case audit lists
    case.critic_review = review
    # Append past reviews to history
    case.critic_history.append(review)
    
    issue_msgs = [i.message for i in review.issues]
    reasoning = f"Review Status: {review.status.upper()}. recommended_action: {review.recommended_action.upper()}. Issues: {'; '.join(issue_msgs) or 'None'}"
    case.critic_decision_reasoning = reasoning
    
    # Record tracking details
    if "Critic Agent" not in case.executed_agents:
        case.executed_agents.append("Critic Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Critic Agent"] = duration
    
    # Log workflow history
    case.log_workflow("Critic Agent", f"Completed safety audit: {reasoning}")
    print(f"\n[Critic Agent] safety review result: {reasoning}\n")
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }
