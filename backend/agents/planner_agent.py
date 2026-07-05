import os
import json
import time
import google.generativeai as genai
from backend.graph.state import AgentState
from backend.schemas.farmer_case import FarmerCase, PlannerOutput

def planner_agent(state: AgentState) -> AgentState:
    """
    Planner Agent Node.
    Analyzes the query and image_uploaded flag inside FarmerCase.
    Determines intent and constructs a dynamic execution plan.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    crop_name = case.crop_details.crop_name
    query = case.crop_details.query
    image_uploaded = case.uploaded_images.image_uploaded
    
    intent = ""
    tasks = []
    reasoning = []
    
    # 1. Attempt LLM-based intent planning
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and not api_key.startswith("your_") and "--" not in api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""
            Analyze the farmer's query and crop details to classify intent and decide which agents are needed.
            
            Stated Crop: {crop_name}
            Image Uploaded: {image_uploaded}
            Query: {query}
            
            Classify into one of these intents:
            - "GeneralAdvice": Questions about general farming advice, sowing dates, crop guides, planting tips.
              Tasks: ["Advisory Agent"]
            - "DiseaseDiagnosis": Questions asking to diagnose disease symptoms. If an image is uploaded, Tasks are: ["Disease Agent", "Weather Agent", "Risk Assessment Agent", "Treatment Agent", "Scheme Advisor Agent"]. If no image is uploaded, Tasks are: ["Clarification Agent"] (to ask for the crop image first).
            - "WeatherQuery": Questions about weather forecast, rain, temperature, climate.
              Tasks: ["Weather Agent"]
            - "SchemeQuery": Questions about government schemes, subsidies, loans, crop insurance.
              Tasks: ["Scheme Advisor Agent"]
            - "TreatmentQuery": Questions asking about treating a specific crop disease or condition.
              Tasks: ["Treatment Agent", "Scheme Advisor Agent"]
              
            Return a valid JSON object matching this schema:
            {{
              "intent": "IntentName",
              "tasks": ["AgentName1", "AgentName2", ...],
              "reasoning": ["Reason 1", "Reason 2", ...]
            }}
            Return raw JSON only. Do not format inside markdown blocks.
            """
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            intent = data.get("intent", "")
            tasks = data.get("tasks", [])
            reasoning = data.get("reasoning", [])
        except Exception as e:
            print(f"[Planner Agent] LLM Planner execution error: {e}. Running fallback heuristics.")
            
    # 2. Rule-based heuristic fallback if LLM plan fails/is unconfigured
    if not intent or not tasks:
        query_lower = query.lower()
        
        is_disease_query = any(d in query_lower for d in ["spot", "blight", "mildew", "rust", "wilt", "yellowing", "pathogen", "black leaf", "spots", "white growth"])
        
        if is_disease_query or image_uploaded:
            intent = "DiseaseDiagnosis"
            if image_uploaded:
                tasks = ["Disease Agent", "Weather Agent", "Risk Assessment Agent", "Treatment Agent", "Scheme Advisor Agent"]
                reasoning = ["Image uploaded by farmer", "Requires visual disease diagnosis and risk analysis"]
            else:
                tasks = ["Clarification Agent"]
                reasoning = ["Disease query detected but no image uploaded. Requesting image first."]
        elif any(w in query_lower for w in ["rain", "weather", "forecast", "temp", "temperature", "humidity", "hot", "cold", "climate", "monsoon"]):
            intent = "WeatherQuery"
            tasks = ["Weather Agent"]
            reasoning = ["Farmer query refers to weather, rain, or climate conditions"]
        elif any(s in query_lower for s in ["scheme", "subsidy", "insurance", "pmfby", "kcc", "credit card", "soil health", "pm-kisan", "government", "assistance", "support"]):
            intent = "SchemeQuery"
            tasks = ["Scheme Advisor Agent"]
            reasoning = ["Farmer query refers to government schemes, loans, or subsidies"]
        elif any(t in query_lower for t in ["treat", "treatment", "cure", "fungicide", "pesticide", "spray", "prevent", "mildew", "blight", "spots", "browning", "rot"]):
            intent = "TreatmentQuery"
            tasks = ["Treatment Agent", "Scheme Advisor Agent"]
            reasoning = ["Farmer query refers to treating or curing a specific disease"]
        else:
            intent = "GeneralAdvice"
            tasks = ["Advisory Agent"]
            reasoning = ["Farmer query is general advice or guide request"]
            
    # Store dynamic plan in FarmerCase
    case.planner_output = PlannerOutput(
        intent=intent,
        tasks=tasks,
        reasoning=reasoning
    )
    case.planned_agents = list(tasks)
    
    # Update execution path
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Planner Agent")
    
    # Record tracking details for Planner Agent
    if "Planner Agent" not in case.executed_agents:
        case.executed_agents.append("Planner Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Planner Agent"] = duration
    
    # Friendly structured logging
    friendly_map = {
        "Disease Agent": "Disease",
        "Weather Agent": "Weather",
        "Risk Assessment Agent": "Risk",
        "Treatment Agent": "Treatment",
        "Scheme Advisor Agent": "Schemes",
        "Advisory Agent": "Advisory"
    }
    friendly_plan = " -> ".join(friendly_map.get(t, t) for t in tasks)
    print(f"\nPlanner selected workflow:\n{friendly_plan}\n")
    
    # Log workflow history
    case.log_workflow(
        "Planner Agent", 
        f"Selected workflow plan: {friendly_plan} (Intent: {intent})"
    )
    
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }
