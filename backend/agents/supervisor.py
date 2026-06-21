from backend.graph.state import AgentState

def supervisor_agent(state: AgentState) -> AgentState:
    """
    Supervisor Agent node.
    Inspects image_uploaded to set the conditional route and records execution path.
    """
    # 1. Determine routing based on image_uploaded flag
    if state.get("image_uploaded", False):
        route = "disease"
    else:
        route = "advisory"
    
    # 2. Append executing agent to workflow_path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Supervisor Agent")
    
    # 3. Return updated keys
    return {
        **state,
        "route": route,
        "workflow_path": current_workflow_path
    }
