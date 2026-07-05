from backend.graph.state import AgentState
from backend.tools.weather_service import get_weather_forecast

import time

def weather_agent(state: AgentState) -> AgentState:
    """
    Weather Agent Node.
    Collects weather intelligence for the specified location and assesses rainfall risk levels.
    """
    start_time = time.time()
    case = state["farmer_case"]
    
    location = case.farmer_info.location or "Dhamtari, Chhattisgarh"
    query = case.crop_details.query
    
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
    
    # Update FarmerCase sections
    case.weather_analysis.weather_data = weather_info
    case.weather_analysis.temperature = temperature
    case.weather_analysis.humidity = humidity
    case.weather_analysis.rain_probability = rain_probability
    case.weather_analysis.weather_risk = weather_risk
    case.weather_analysis.result = {
        "agent": "Weather Agent",
        "message": f"Retrieved weather data for {location}.",
        **weather_info,
        "weather_risk": weather_risk
    }
    
    # Record tracking details
    if "Weather Agent" not in case.executed_agents:
        case.executed_agents.append("Weather Agent")
    duration = time.time() - start_time
    case.execution_time_per_agent["Weather Agent"] = duration
    
    # Log workflow history
    case.log_workflow(
        "Weather Agent", 
        f"Retrieved weather details for {location}. Temp: {temperature}C, Humid: {humidity}%, Rain Prob: {rain_probability}%"
    )
    
    # 4. Map outputs to AgentState
    return {
        **state,
        "workflow_path": current_workflow_path,
        "farmer_case": case
    }

