from backend.graph.state import AgentState

import time

def supervisor_agent(state: AgentState) -> AgentState:
    """
    Supervisor Agent node.
    Inspects image_uploaded to set the conditional route and records execution path.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    # 1. Determine routing based on image_uploaded flag from FarmerCase
    if case.uploaded_images.image_uploaded:
        route = "disease"
    else:
        route = "advisory"
    
    # 2. Append executing agent to workflow_path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Supervisor Agent")
    
    # Record tracking details
    if "Supervisor Agent" not in case.executed_agents:
        case.executed_agents.append("Supervisor Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Supervisor Agent"] = duration
    
    # 3. Log history and update metadata
    case.log_workflow("Supervisor Agent", f"Routed query to {route} path")
    
    # 4. Return updated keys
    return {
        **state,
        "route": route,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }


