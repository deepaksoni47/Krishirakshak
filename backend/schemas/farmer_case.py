from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FarmerInfo(BaseModel):
    location: Optional[str] = None

class CropDetails(BaseModel):
    crop_name: str
    query: str

class UploadedImages(BaseModel):
    image_uploaded: bool = False
    image_path: Optional[str] = None
    image_bytes: Optional[bytes] = None

class DiseaseAnalysis(BaseModel):
    disease_name: Optional[str] = None
    severity: Optional[str] = None
    recommendation: Optional[str] = None
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class WeatherAnalysis(BaseModel):
    weather_data: Optional[Dict[str, Any]] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rain_probability: Optional[float] = None
    weather_risk: Optional[str] = None
    alert: Optional[str] = None
    alert_advice: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class RiskFactor(BaseModel):
    name: str
    raw_value: str
    normalized_score: float
    weight: float
    contribution: float
    explanation: str

class RiskAssessment(BaseModel):
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    risk_factors: Optional[List[str]] = None
    priority: Optional[str] = None
    warning: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    # Explainable Risk Engine additions (Phase 5)
    overall_score: int = 0
    confidence: float = 1.0
    factors: List[RiskFactor] = Field(default_factory=list)
    top_drivers: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    reasoning_summary: str = ""

class TreatmentPlan(BaseModel):
    treatment_plan: Optional[Dict[str, Any]] = None
    recommended_actions: Optional[List[str]] = None
    action_timeline: Optional[List[Dict[str, Any]]] = None
    estimated_cost: Optional[int] = None
    expected_recovery_days: Optional[int] = None
    intervention_priority: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class GovernmentSchemes(BaseModel):
    eligible_schemes: Optional[List[str]] = None
    scheme_recommendations: Optional[List[Dict[str, Any]]] = None
    financial_support_score: Optional[int] = None
    result: Optional[Dict[str, Any]] = None

class ConfidenceScores(BaseModel):
    confidence: Optional[int] = None

class WorkflowHistoryItem(BaseModel):
    agent: str
    timestamp: str
    action: str

class CriticIssue(BaseModel):
    type: str
    severity: str  # "low" | "medium" | "high"
    message: str

class CriticReview(BaseModel):
    status: str = "none"  # "none" | "approved" | "needs_clarification" | "needs_replan" | "downgraded"
    issues: List[CriticIssue] = Field(default_factory=list)
    recommended_action: str = "continue"  # "continue" | "clarify" | "replan" | "downgrade"
    notes: List[str] = Field(default_factory=list)
    reviewed_at: Optional[str] = None

class ClarificationDetails(BaseModel):
    required: bool = False
    reason: Optional[str] = None
    questions: List[str] = Field(default_factory=list)
    status: str = "none"  # "none" | "waiting" | "satisfied"

class Metadata(BaseModel):
    created_at: str
    updated_at: str
    request_id: str

class PlannerOutput(BaseModel):
    intent: str = ""
    tasks: List[str] = Field(default_factory=list)
    reasoning: List[str] = Field(default_factory=list)

class CaseContext(BaseModel):
    case_id: Optional[str] = None
    is_follow_up: bool = False
    previous_event_id: Optional[str] = None
    current_case_status: str = "active"  # "active" | "monitoring" | "escalated" | "resolved" | "closed"

class MonitoringDetails(BaseModel):
    follow_up_recommended: bool = False
    follow_up_due_in_hours: int = 48
    progress_assessment: str = "unknown"  # "improved" | "worsened" | "unchanged" | "unknown"
    escalation_required: bool = False
    monitoring_notes: List[str] = Field(default_factory=list)
    comparison_summary: str = ""

import datetime

class FarmerCase(BaseModel):
    farmer_info: FarmerInfo = Field(default_factory=FarmerInfo)
    crop_details: CropDetails
    symptoms: List[str] = Field(default_factory=list)
    uploaded_images: UploadedImages = Field(default_factory=UploadedImages)
    disease_analysis: DiseaseAnalysis = Field(default_factory=DiseaseAnalysis)
    weather_analysis: WeatherAnalysis = Field(default_factory=WeatherAnalysis)
    risk_assessment: RiskAssessment = Field(default_factory=RiskAssessment)
    treatment_plan: TreatmentPlan = Field(default_factory=TreatmentPlan)
    government_schemes: GovernmentSchemes = Field(default_factory=GovernmentSchemes)
    confidence_scores: ConfidenceScores = Field(default_factory=ConfidenceScores)
    missing_information: List[str] = Field(default_factory=list)
    workflow_history: List[WorkflowHistoryItem] = Field(default_factory=list)
    metadata: Metadata
    
    # Dynamic Planning & Performance Metrics tracking (Phase 8 Refactoring)
    planner_output: PlannerOutput = Field(default_factory=PlannerOutput)
    planned_agents: List[str] = Field(default_factory=list)
    executed_agents: List[str] = Field(default_factory=list)
    skipped_agents: List[str] = Field(default_factory=list)
    execution_time_per_agent: Dict[str, float] = Field(default_factory=dict)

    # Clarification Loop variables (Phase 3 Integration)
    clarification: ClarificationDetails = Field(default_factory=ClarificationDetails)
    requested_questions: List[str] = Field(default_factory=list)
    answered_questions: List[str] = Field(default_factory=list)
    remaining_questions: List[str] = Field(default_factory=list)
    crop_stage: Optional[str] = None
    sprayed_recently: Optional[str] = None

    # Critic / Safety Layer variables (Phase 4 Integration)
    critic_review: CriticReview = Field(default_factory=CriticReview)
    critic_history: List[CriticReview] = Field(default_factory=list)
    critic_decision_reasoning: Optional[str] = None
    validation_flags: Dict[str, bool] = Field(default_factory=dict)
    cautious_recommendation: Optional[str] = None

    # Farmer Case Memory & Monitoring variables (Phase 5 Integration)
    case_context: CaseContext = Field(default_factory=CaseContext)
    monitoring: MonitoringDetails = Field(default_factory=MonitoringDetails)

    def log_workflow(self, agent_name: str, action: str):
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        self.workflow_history.append(
            WorkflowHistoryItem(
                agent=agent_name,
                timestamp=now_str,
                action=action
            )
        )
        self.metadata.updated_at = now_str

