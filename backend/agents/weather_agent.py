from backend.graph.state import AgentState
from backend.tools.weather_service import get_weather_forecast

def weather_agent(state: AgentState) -> AgentState:
    """
    Weather Agent Node.
    Collects weather intelligence for the specified location and assesses rainfall risk levels.
    """
    location = state.get("location") or "Dhamtari, Chhattisgarh"
    query = state.get("query", "")
    
    # 1. Fetch weather forecast details
    weather_info = get_weather_forecast(location, query)
    
    rain_probability = weather_info.get("rain_probability", 0.0)
    humidity = weather_info.get("humidity", 50.0)
    temperature = weather_info.get("temperature", 30.0)
    
    # 2. Risk Classification Logic
    if rain_probability > 80:
        weather_risk = "High"
    elif rain_probability > 50:
        weather_risk = "Medium"
    else:
        weather_risk = "Low"
        
    # 3. Update executing path trace list
    current_workflow_path = list(state.get("workflow_path", []))
    current_workflow_path.append("Weather Agent")
    
    # 4. Map outputs to AgentState
    return {
        **state,
        "location": location,
        "weather_data": weather_info,
        "temperature": temperature,
        "humidity": humidity,
        "rain_probability": rain_probability,
        "weather_risk": weather_risk,
        "workflow_path": current_workflow_path,
        "result": {
            "agent": "Weather Agent",
            "message": f"Retrieved weather data for {location}.",
            **weather_info,
            "weather_risk": weather_risk
        }
    }
