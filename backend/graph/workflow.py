from langgraph.graph import StateGraph, START, END
from backend.graph.state import AgentState
from backend.agents.supervisor import supervisor_agent
from backend.agents.disease_agent import disease_agent
from backend.agents.advisory_agent import advisory_agent
from backend.agents.clarification_agent import clarification_agent
from backend.agents.weather_agent import weather_agent
from backend.agents.risk_assessment_agent import risk_assessment_agent
from backend.agents.emergency_agent import emergency_agent
from backend.agents.monitoring_agent import monitoring_agent
from backend.agents.treatment_agent import treatment_agent
from backend.agents.scheme_advisor_agent import scheme_advisor_agent  # Phase 7

def route_decision(state: AgentState) -> str:
    """
    Routing helper function.
    Inspects state['route'] to dictate the next node traversal path.
    """
    return state.get("route") or "advisory"

def disease_routing_decision(state: AgentState) -> str:
    """
    Conditional routing function from Disease Agent.
    Routes to Clarification Agent if confidence is < 70, otherwise routes to Weather Agent.
    """
    confidence = state.get("confidence") or 0
    if confidence < 70:
        return "clarification"
    else:
        return "confirmed"

def risk_routing_decision(state: AgentState) -> str:
    """
    Conditional routing function from Risk Assessment Agent.
    Routes to Emergency Agent if risk_score is >= 70, otherwise Monitoring Agent.
    """
    risk_score = state.get("risk_score") or 0
    if risk_score >= 70:
        return "emergency"
    else:
        return "monitoring"

# Setup the graph builder using the defined AgentState TypedDict
workflow_builder = StateGraph(AgentState)

# Add node definitions
workflow_builder.add_node("Supervisor Agent", supervisor_agent)
workflow_builder.add_node("Disease Agent", disease_agent)
workflow_builder.add_node("Advisory Agent", advisory_agent)
workflow_builder.add_node("Clarification Agent", clarification_agent)
workflow_builder.add_node("Weather Agent", weather_agent)
workflow_builder.add_node("Risk Assessment Agent", risk_assessment_agent)
workflow_builder.add_node("Emergency Agent", emergency_agent)
workflow_builder.add_node("Monitoring Agent", monitoring_agent)
workflow_builder.add_node("Treatment Agent", treatment_agent)  # Phase 6
workflow_builder.add_node("Scheme Advisor Agent", scheme_advisor_agent)  # Phase 7

# Set starting entry point
workflow_builder.add_edge(START, "Supervisor Agent")

# Define conditional routing branches from Supervisor
workflow_builder.add_conditional_edges(
    "Supervisor Agent",
    route_decision,
    {
        "disease": "Disease Agent",
        "advisory": "Advisory Agent"
    }
)

# Define conditional routing from Disease Agent (Confidence-based)
workflow_builder.add_conditional_edges(
    "Disease Agent",
    disease_routing_decision,
    {
        "clarification": "Clarification Agent",
        "confirmed": "Weather Agent"
    }
)

# Connect Weather Agent directly to Risk Assessment Agent
workflow_builder.add_edge("Weather Agent", "Risk Assessment Agent")

# Define conditional routing from Risk Assessment Agent (Risk-based)
workflow_builder.add_conditional_edges(
    "Risk Assessment Agent",
    risk_routing_decision,
    {
        "emergency": "Emergency Agent",
        "monitoring": "Monitoring Agent"
    }
)

# Phase 6: Both Emergency and Monitoring Agent funnel into Treatment Agent
workflow_builder.add_edge("Emergency Agent", "Treatment Agent")
workflow_builder.add_edge("Monitoring Agent", "Treatment Agent")

# Phase 7: Treatment Agent routes to Scheme Advisor Agent
workflow_builder.add_edge("Treatment Agent", "Scheme Advisor Agent")

# Connect termination endpoints
workflow_builder.add_edge("Clarification Agent", END)
workflow_builder.add_edge("Advisory Agent", END)
workflow_builder.add_edge("Scheme Advisor Agent", END)  # Phase 7 final node

# Compile graph for backend endpoint execution
compiled_graph = workflow_builder.compile()
