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
from backend.agents.scheme_advisor_agent import scheme_advisor_agent, compute_skipped_agents
from backend.agents.planner_agent import planner_agent
from backend.agents.critic_agent import critic_agent

def dynamic_route(state: AgentState) -> str:
    """
    Intelligent dynamic routing function.
    Reads from execution plans and handles conditional edge evaluations dynamically.
    """
    case = state.get("farmer_case")
    if not case:
        return "end"
        
    executed = case.executed_agents or []
    planned = case.planned_agents or []
    workflow_path = state.get("workflow_path", [])
    
    # Terminal nodes immediately exit the graph
    if "Clarification Agent" in executed or "Advisory Agent" in executed:
        compute_skipped_agents(case)
        return "end"
        
    # 1. Risk Assessment routing decision (Emergency choice)
    if "Risk Assessment Agent" in executed and "Emergency Agent" not in executed:
        risk_score = case.risk_assessment.risk_score or 0
        if risk_score >= 70:
            return "Emergency Agent"
            
    # 2. Standard sequential route
    for agent in planned:
        if agent not in executed:
            return agent
            
    # If all planned agents have completed, but Critic Agent has not executed, route to Critic Agent
    if "Critic Agent" not in executed:
        return "Critic Agent"
        
    # 3. Process Critic Agent verdict
    if "Critic Agent" in executed:
        # Check if we just ran a retry node *after* Critic Agent (replanning loop)
        if workflow_path and workflow_path[-1] != "Critic Agent":
            # Reset Critic Agent from executed list so it re-audits the updated state
            case.executed_agents.remove("Critic Agent")
            return "Critic Agent"
            
        # Process recommended safety actions
        action = case.critic_review.recommended_action
        if action == "clarify":
            if "Clarification Agent" in case.executed_agents:
                case.executed_agents.remove("Clarification Agent")
            return "Clarification Agent"
        elif action == "replan":
            # If weather was missing, we route to Weather Agent
            if "Weather Agent" in case.executed_agents:
                case.executed_agents.remove("Weather Agent")
            for dep in ["Risk Assessment Agent", "Treatment Agent", "Scheme Advisor Agent"]:
                if dep in case.executed_agents:
                    case.executed_agents.remove(dep)
            if "Weather Agent" not in case.planned_agents:
                case.planned_agents.append("Weather Agent")
            return "Weather Agent"
        elif action in ("downgrade", "continue"):
            # Route to Monitoring Agent to evaluate progress and update Case memory
            if "Monitoring Agent" not in executed:
                return "Monitoring Agent"
            compute_skipped_agents(case)
            return "end"
            
    # Compute skipped list upon reaching termination
    compute_skipped_agents(case)
    return "end"

# Setup the graph builder using the defined AgentState TypedDict
workflow_builder = StateGraph(AgentState)

# Add node definitions
workflow_builder.add_node("Supervisor Agent", supervisor_agent)
workflow_builder.add_node("Planner Agent", planner_agent)
workflow_builder.add_node("Disease Agent", disease_agent)
workflow_builder.add_node("Advisory Agent", advisory_agent)
workflow_builder.add_node("Clarification Agent", clarification_agent)
workflow_builder.add_node("Weather Agent", weather_agent)
workflow_builder.add_node("Risk Assessment Agent", risk_assessment_agent)
workflow_builder.add_node("Emergency Agent", emergency_agent)
workflow_builder.add_node("Monitoring Agent", monitoring_agent)
workflow_builder.add_node("Treatment Agent", treatment_agent)
workflow_builder.add_node("Scheme Advisor Agent", scheme_advisor_agent)
workflow_builder.add_node("Critic Agent", critic_agent)

# Set starting entry point and static edge to Planner
workflow_builder.add_edge(START, "Supervisor Agent")
workflow_builder.add_edge("Supervisor Agent", "Planner Agent")

# Define conditional edge mapping dictionary
conditional_mapping = {
    "Disease Agent": "Disease Agent",
    "Weather Agent": "Weather Agent",
    "Risk Assessment Agent": "Risk Assessment Agent",
    "Emergency Agent": "Emergency Agent",
    "Monitoring Agent": "Monitoring Agent",
    "Treatment Agent": "Treatment Agent",
    "Scheme Advisor Agent": "Scheme Advisor Agent",
    "Advisory Agent": "Advisory Agent",
    "Clarification Agent": "Clarification Agent",
    "Critic Agent": "Critic Agent",
    "end": END
}

# Attach conditional edges
workflow_builder.add_conditional_edges("Planner Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Disease Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Weather Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Risk Assessment Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Emergency Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Monitoring Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Treatment Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Scheme Advisor Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Advisory Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Clarification Agent", dynamic_route, conditional_mapping)
workflow_builder.add_conditional_edges("Critic Agent", dynamic_route, conditional_mapping)

from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()
compiled_graph = workflow_builder.compile(checkpointer=memory)



