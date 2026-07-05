import datetime
from backend.config import (
    DISEASE_CONFIDENCE_THRESHOLD,
    CRITIC_RAIN_THRESHOLD,
    CRITIC_CONFIDENCE_THRESHOLD,
    CRITIC_RISK_CONTRADICTION_THRESHOLD
)
from backend.schemas.farmer_case import FarmerCase, CriticReview, CriticIssue

def validate_case(case: FarmerCase) -> CriticReview:
    """
    Validates FarmerCase against safety and quality policies.
    Returns a structured CriticReview.
    """
    issues = []
    notes = []
    validation_flags = {}
    
    intent = case.planner_output.intent
    
    # 1. Rule A: Disease Diagnosis Confidence Safety
    confidence = case.confidence_scores.confidence
    chemical_spray = False
    
    # Inspect treatment plan for chemical spray
    if case.treatment_plan and case.treatment_plan.treatment_plan:
        chem = (case.treatment_plan.treatment_plan.get("chemical") or "").lower()
        if chem and chem != "broad-spectrum fungicide" and "consult" not in chem:
            chemical_spray = True
            
    if intent == "DiseaseDiagnosis" and confidence is not None:
        if confidence < CRITIC_CONFIDENCE_THRESHOLD:
            validation_flags["low_confidence"] = True
            if chemical_spray:
                issues.append(CriticIssue(
                    type="low_confidence_spray",
                    severity="high",
                    message="Disease confidence is too low to recommend strong chemical treatments."
                ))
            else:
                issues.append(CriticIssue(
                    type="low_confidence",
                    severity="medium",
                    message="Disease confidence is below the safety threshold."
                ))
                
    # 2. Rule B: Weather-Treatment Conflict
    rain_prob = case.weather_analysis.rain_probability or 0.0
    if rain_prob > CRITIC_RAIN_THRESHOLD:
        validation_flags["weather_spray_conflict"] = True
        # Check if chemical spray or immediate watering is recommended
        if chemical_spray or len(case.treatment_plan.recommended_actions) > 0:
            issues.append(CriticIssue(
                type="weather_conflict",
                severity="high",
                message="Rain probability is too high for immediate fungicide spraying."
            ))
            
    # 3. Rule C: Missing Critical Context
    executed = case.executed_agents or []
    if intent in ("DiseaseDiagnosis", "TreatmentQuery"):
        # Check if weather query was skipped
        if "Weather Agent" not in executed:
            validation_flags["missing_weather"] = True
            issues.append(CriticIssue(
                type="missing_weather",
                severity="high",
                message="Weather Agent was not executed but treatment depends on rain probability."
            ))
            
        # Check missing crop stage
        if not case.crop_stage:
            validation_flags["missing_crop_stage"] = True
            issues.append(CriticIssue(
                type="missing_crop_stage",
                severity="medium",
                message="Crop growth stage is missing but stage-sensitive treatment is planned."
            ))
            
        # Check missing spray status
        if not case.sprayed_recently:
            validation_flags["missing_spray_status"] = True
            issues.append(CriticIssue(
                type="missing_spray_status",
                severity="medium",
                message="Recent pesticide spray status is missing but treatment is scheduled."
            ))
            
    # 4. Rule D: Contradictions between agents
    severity = case.disease_analysis.severity or "Low"
    risk_score = case.risk_assessment.risk_score or 0
    if severity == "Low" and risk_score >= 70:
        validation_flags["risk_severity_contradiction"] = True
        issues.append(CriticIssue(
            type="risk_severity_contradiction",
            severity="medium",
            message="Disease severity is rated Low but overall crop health risk is Critical/High."
        ))
        
    # 5. Rule E: Recommendation Quality / Low Scheme Relevance
    if case.government_schemes and case.government_schemes.scheme_recommendations:
        relevance_scores = [s.get("relevance_score", 0.0) for s in case.government_schemes.scheme_recommendations]
        if relevance_scores and all(score < 0.40 for score in relevance_scores):
            validation_flags["low_scheme_relevance"] = True
            issues.append(CriticIssue(
                type="low_scheme_relevance",
                severity="low",
                message="Eligible schemes have low relevance to the farmer's crop condition."
            ))
            
    # Determine Status and Recommended Action
    status = "approved"
    action = "continue"
    
    # Evaluate high severity issues first
    high_issues = [i for i in issues if i.severity == "high"]
    medium_issues = [i for i in issues if i.severity == "medium"]
    
    if high_issues:
        # Check if we can replan
        if any(i.type == "missing_weather" for i in high_issues):
            status = "needs_replan"
            action = "replan"
            notes.append("Re-routing to Weather Agent to gather required parameters.")
        # If it is weather conflict or low confidence spray, we downgrade to a cautious recommendation
        elif any(i.type in ("weather_conflict", "low_confidence_spray") for i in high_issues):
            status = "downgraded"
            action = "downgrade"
            notes.append("Downgrading recommendation to cautious advice due to high risk factors.")
    elif medium_issues:
        # Re-route to clarification loop
        if any(i.type in ("missing_crop_stage", "missing_spray_status") for i in medium_issues):
            status = "needs_clarification"
            action = "clarify"
            notes.append("Requesting clarification from farmer on missing growth/spray details.")
        else:
            status = "approved"
            action = "continue"
    else:
        status = "approved"
        action = "continue"
        
    case.validation_flags = validation_flags
    
    return CriticReview(
        status=status,
        issues=issues,
        recommended_action=action,
        notes=notes,
        reviewed_at=datetime.datetime.utcnow().isoformat() + "Z"
    )
