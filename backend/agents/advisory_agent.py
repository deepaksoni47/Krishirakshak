from backend.graph.state import AgentState

import time

def advisory_agent(state: AgentState) -> AgentState:
    """
    Advisory Agent placeholder node.
    Updates the execution path and sets a mock general advisory result dict.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    # 1. Append executing agent to workflow_path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Advisory Agent")
    
    # 2. Update FarmerCase
    result_payload = {
        "agent": "Advisory Agent",
        "message": "General farming advice placeholder"
    }
    case.disease_analysis.result = result_payload
    
    # Record tracking details
    if "Advisory Agent" not in case.executed_agents:
        case.executed_agents.append("Advisory Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Advisory Agent"] = duration
    
    case.log_workflow("Advisory Agent", "Generated general farming advice")
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

