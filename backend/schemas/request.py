from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AnalyzeRequest(BaseModel):
    crop_name: str = Field(..., description="The name of the crop being analyzed", examples=["Rice", "Tomato"])
    query: str = Field(..., description="The farmer's query or description of the issue", examples=["Leaves have brown spots", "Yellowing edges"])
    image_uploaded: bool = Field(default=False, description="Flag indicating if a symptom image is uploaded by the user")
    location: Optional[str] = Field(default="Dhamtari, Chhattisgarh", description="The farmer's location for weather forecasting")

class AnalyzeResponse(BaseModel):
    workflow_path: List[str] = Field(..., description="Sequence of executing agents in the workflow")
    route: Optional[str] = Field(default=None, description="The routing decision made by the supervisor ('disease' or 'advisory')")
    disease_name: Optional[str] = Field(default=None, description="The diagnosed plant disease name")
    confidence: Optional[int] = Field(default=None, description="Confidence percentage (0 to 100)")
    severity: Optional[str] = Field(default=None, description="Severity rating ('Low', 'Medium', 'High')")
    symptoms: Optional[List[str]] = Field(default=None, description="Symptoms identified")
    recommendation: Optional[str] = Field(default=None, description="Agronomic treatment recommendations")
    message: Optional[str] = Field(default=None, description="Notification message from sub-agents (e.g. clarification queries)")
    temperature: Optional[float] = Field(default=None, description="Observed temperature in Celsius")
    humidity: Optional[float] = Field(default=None, description="Observed relative humidity percentage")
    rain_probability: Optional[float] = Field(default=None, description="Probability of rain in percentage")
    weather_risk: Optional[str] = Field(default=None, description="Weather risk level ('Low', 'Medium', 'High')")
    alert: Optional[str] = Field(default=None, description="Rain alert or warning")
    alert_advice: Optional[str] = Field(default=None, description="Agronomic advice corresponding to the weather alert")
    risk_score: Optional[int] = Field(default=None, description="Computed crop health risk score (0 to 100)")
    risk_level: Optional[str] = Field(default=None, description="Risk level ('Low', 'Medium', 'High', 'Critical')")
    risk_factors: Optional[List[str]] = Field(default=None, description="Explanatory list of risk factors")
    priority: Optional[str] = Field(default=None, description="Priority classification for crop care")
    warning: Optional[str] = Field(default=None, description="Urgent emergency warnings if critical risk")
    result: Optional[Dict[str, Any]] = Field(default=None, description="Result dictionary payload for Phase 2 compatibility")
    # Phase 6: Treatment & Intervention Agent
    treatment_plan: Optional[Dict[str, Any]] = Field(default=None, description="Full treatment plan including chemical recommendation")
    recommended_actions: Optional[List[str]] = Field(default=None, description="Ordered list of weather-aware recommended actions")
    action_timeline: Optional[List[Dict[str, Any]]] = Field(default=None, description="Structured timeline: Today / Tomorrow / Next N Days")
    estimated_cost: Optional[int] = Field(default=None, description="Estimated treatment cost in INR")
    expected_recovery_days: Optional[int] = Field(default=None, description="Estimated days until crop recovery")
    intervention_priority: Optional[str] = Field(default=None, description="Intervention urgency: Immediate / Action Required / Preventive / Routine")
    # Phase 7: Government Scheme Advisor Agent
    eligible_schemes: Optional[List[str]] = Field(default=None, description="Names of eligible government schemes")
    scheme_recommendations: Optional[List[Dict[str, Any]]] = Field(default=None, description="Detailed scheme recommendations with reasons and application tips")
    financial_support_score: Optional[int] = Field(default=None, description="Financial support urgency score (0-100)")
