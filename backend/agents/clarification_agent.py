from backend.graph.state import AgentState

def clarification_agent(state: AgentState) -> AgentState:
    """
    Clarification Agent node.
    Invoked when disease detection confidence is low (< 70%).
    Updates the execution path and sets a message prompting the user for clearer files.
    """
    # 1. Append executing agent to workflow_path list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Clarification Agent")
    
    # 2. Return updated keys and request message
    message = "Please upload additional images."
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "message": message,
        "result": {
            "agent": "Clarification Agent",
            "message": message
        }
    }
