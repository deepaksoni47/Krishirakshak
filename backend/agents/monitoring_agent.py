from backend.graph.state import AgentState
from backend.db.repository import CaseEventRepository, CaseRepository
from backend.monitoring_policy import evaluate_progress
import time
import json

def monitoring_agent(state: AgentState) -> AgentState:
    """
    Monitoring Agent Node (Phase 6).
    Performs case context audits, evaluates progress over time, and triggers escalation policies.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    case_id = case.case_context.case_id
    is_follow_up = case.case_context.is_follow_up
    
    if is_follow_up and case_id:
        # 1. Fetch latest previous event snapshot from repository
        latest_evt = CaseEventRepository.get_latest_event(case_id)
        if latest_evt and latest_evt.snapshot:
            try:
                prev_snapshot = json.loads(latest_evt.snapshot)
                # 2. Run progress evaluation
                monitoring_details = evaluate_progress(case, prev_snapshot)
                case.monitoring = monitoring_details
                
                # Apply escalation status updates
                if monitoring_details.escalation_required:
                    case.case_context.current_case_status = "escalated"
                    escalate_msg = "ESCALATION REQUIRED: Treatment is ineffective or risk has escalated. Seek local agronomy/agricultural officer support immediately."
                    case.disease_analysis.message = f"{escalate_msg} Notes: {'; '.join(monitoring_details.monitoring_notes)}"
                    if case.treatment_plan:
                        case.treatment_plan.recommended_actions = [escalate_msg] + case.treatment_plan.recommended_actions
                else:
                    case.case_context.current_case_status = "monitoring"
                    mon_msg = f"Recovery monitoring: progress is {monitoring_details.progress_assessment}."
                    case.disease_analysis.message = f"{mon_msg} Notes: {'; '.join(monitoring_details.monitoring_notes)}"
            except Exception as e:
                print(f"[Monitoring Agent] Error loading previous snapshot: {e}")
                case.monitoring.progress_assessment = "unknown"
                case.monitoring.comparison_summary = "Error comparison due to snapshot load failure."
        else:
            case.monitoring.progress_assessment = "unknown"
            case.monitoring.comparison_summary = "No previous event record found in storage."
    else:
        # New case initial baseline
        case.monitoring.follow_up_recommended = True
        case.monitoring.follow_up_due_in_hours = 48
        case.monitoring.progress_assessment = "unknown"
        case.monitoring.escalation_required = False
        case.monitoring.comparison_summary = "First-time diagnosis record. Initiating monitoring cycle."
        case.monitoring.monitoring_notes = ["Initial case baseline registered."]
        case.case_context.current_case_status = "active"
        
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Monitoring Agent")
    
    # Record tracking details
    if "Monitoring Agent" not in case.executed_agents:
        case.executed_agents.append("Monitoring Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Monitoring Agent"] = duration
    
    # Log workflow history
    case.log_workflow(
        "Monitoring Agent", 
        f"Completed monitoring evaluation. Status: {case.case_context.current_case_status}, Progress: {case.monitoring.progress_assessment}"
    )
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }


