from backend.graph.state import AgentState
from backend.risk_engine import calculate_risk
import time

def risk_assessment_agent(state: AgentState) -> AgentState:
    """
    Risk Assessment Agent Node (Phase 5).
    Delegates crop health risk calculation to the Explainable Risk Engine.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    # 1. Execute explainable risk calculations
    risk_assessment = calculate_risk(case)
    
    # 2. Update FarmerCase
    case.risk_assessment = risk_assessment
    
    # 3. Update trace path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Risk Assessment Agent")
    
    # 4. Record tracking metrics
    if "Risk Assessment Agent" not in case.executed_agents:
        case.executed_agents.append("Risk Assessment Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Risk Assessment Agent"] = duration
    
    # 5. Log workflow history
    case.log_workflow(
        "Risk Assessment Agent", 
        f"Assessed explainable risk level as {risk_assessment.risk_level} (Score: {risk_assessment.overall_score}/100, Confidence: {risk_assessment.confidence})"
    )
    
    # Observe details in log
    print(f"\n[Risk Assessment Agent] overall score: {risk_assessment.overall_score}, level: {risk_assessment.risk_level}, confidence: {risk_assessment.confidence}\n")
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

