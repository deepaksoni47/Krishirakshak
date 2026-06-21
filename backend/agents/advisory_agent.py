from backend.graph.state import AgentState

def advisory_agent(state: AgentState) -> AgentState:
    """
    Advisory Agent placeholder node.
    Updates the execution path and sets a mock general advisory result dict.
    """
    # 1. Append executing agent to workflow_path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Advisory Agent")
    
    # 2. Return updated keys and the custom result payload
    result_payload = {
        "agent": "Advisory Agent",
        "message": "General farming advice placeholder"
    }
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "result": result_payload
    }
