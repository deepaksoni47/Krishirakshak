from typing import TypedDict, Optional, List, Dict, Any, Union

class AgentState(TypedDict):
    """
    State representing the data passed between agents in the KrishiRakshak AI workflow.
    Phase 1-5: Disease, Weather, Risk Assessment, Emergency/Monitoring.
    Phase 6: Treatment & Intervention.
    """
    crop_name: str
    query: str
    image_uploaded: bool
    route: Optional[str]
    workflow_path: List[str]
    result: Optional[Dict[str, Any]]
    image_path: Optional[str]          # Deprecated — kept for compatibility
    image_bytes: Optional[bytes]        # In-memory image data (preferred for production)
    disease_name: Optional[str]
    confidence: Optional[int]
    severity: Optional[str]
    symptoms: Optional[List[str]]
    recommendation: Optional[str]
    message: Optional[str]
    location: Optional[str]
    weather_data: Optional[Dict[str, Any]]
    rain_probability: Optional[float]
    humidity: Optional[float]
    temperature: Optional[float]
    weather_risk: Optional[str]
    alert: Optional[str]
    alert_advice: Optional[str]
    risk_score: Optional[int]
    risk_level: Optional[str]
    risk_factors: Optional[List[str]]
    priority: Optional[str]
    warning: Optional[str]
    # Phase 6: Treatment & Intervention Agent
    treatment_plan: Optional[Dict[str, Any]]
    recommended_actions: Optional[List[str]]
    action_timeline: Optional[List[Dict[str, Any]]]
    estimated_cost: Optional[int]
    expected_recovery_days: Optional[int]
    intervention_priority: Optional[str]
    # Phase 7: Government Scheme Advisor Agent
    eligible_schemes: Optional[List[str]]
    scheme_recommendations: Optional[List[Dict[str, Any]]]
    financial_support_score: Optional[int]
