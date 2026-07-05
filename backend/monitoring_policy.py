import json
from typing import Dict, Any, List
from backend.schemas.farmer_case import FarmerCase, MonitoringDetails

def evaluate_progress(case: FarmerCase, prev_event_snapshot: Dict[str, Any]) -> MonitoringDetails:
    """
    Compares the current FarmerCase state against a previous event snapshot.
    Determines progress_assessment ('improved' | 'worsened' | 'unchanged' | 'unknown')
    and sets escalation flags and notes.
    """
    notes = []
    comparison_summary_parts = []
    progress = "unknown"
    escalation_required = False
    
    # 1. Read previous values from snapshot
    # The snapshot can be a dict representing the previous FarmerCase json
    prev_disease = prev_event_snapshot.get("disease_analysis", {}).get("disease_name")
    prev_severity = prev_event_snapshot.get("disease_analysis", {}).get("severity", "Low")
    prev_risk_score = prev_event_snapshot.get("risk_assessment", {}).get("risk_score", 0)
    prev_risk_level = prev_event_snapshot.get("risk_assessment", {}).get("risk_level", "Low")
    prev_treatment = prev_event_snapshot.get("treatment_plan", {}).get("recommended_actions", [])
    
    # 2. Read current values
    curr_disease = case.disease_analysis.disease_name
    curr_severity = case.disease_analysis.severity or "Low"
    curr_risk_score = case.risk_assessment.risk_score or 0
    curr_risk_level = case.risk_assessment.risk_level or "Low"
    query_lower = (case.crop_details.query or "").lower()
    
    # 3. Check if previous treatment was applied
    # We infer if the farmer applied treatment by checking query keywords (e.g. "applied", "sprayed", "used")
    treatment_applied = False
    if any(keyword in query_lower for keyword in ["sprayed", "applied", "fungicide", "treatment", "used"]):
        treatment_applied = True
        notes.append("Farmer reported applying the previously recommended treatment.")
    else:
        notes.append("No explicit confirmation that previous treatment was applied.")
        
    # 4. Disease / Severity Comparison
    disease_changed = False
    if prev_disease and curr_disease and prev_disease.lower() != curr_disease.lower():
        disease_changed = True
        notes.append(f"Diagnosis changed from {prev_disease} to {curr_disease}.")
        comparison_summary_parts.append(f"New diagnosis: {curr_disease} (formerly {prev_disease}).")
    else:
        comparison_summary_parts.append(f"Diagnosis remains: {curr_disease or 'Unknown'}.")
        
    # Severity transition
    sev_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    curr_sev_val = sev_map.get(curr_severity, 1)
    prev_sev_val = sev_map.get(prev_severity, 1)
    
    if curr_sev_val < prev_sev_val:
        severity_trend = "decreased"
    elif curr_sev_val > prev_sev_val:
        severity_trend = "increased"
    else:
        severity_trend = "unchanged"
        
    comparison_summary_parts.append(f"Severity is {curr_severity} (formerly {prev_severity}).")
    
    # 5. Risk score transition
    score_diff = curr_risk_score - prev_risk_score
    comparison_summary_parts.append(f"Risk score is {curr_risk_score} (formerly {prev_risk_score}).")
    
    # 6. Overall progress assessment
    if curr_risk_score < prev_risk_score - 8 or severity_trend == "decreased":
        progress = "improved"
        notes.append("Environmental risk or pathological severity has decreased.")
    elif curr_risk_score > prev_risk_score + 8 or severity_trend == "increased":
        progress = "worsened"
        notes.append("Risk levels or disease severity have increased since the last update.")
    else:
        progress = "unchanged"
        notes.append("Disease symptoms and environmental risks remain stable.")
        
    if not treatment_applied and progress == "unchanged":
        notes.append("Progress cannot be fully evaluated as recommended treatment was not applied.")
        
    # 7. Escalation logic
    # Escalate if:
    # - Progress is worsened (risk/severity increased)
    # - Or status remains High/Critical and treatment was already applied
    if progress == "worsened":
        escalation_required = True
        notes.append("Escalation triggered due to worsening symptoms or risk levels.")
    elif curr_severity == "High" and prev_severity == "High" and treatment_applied:
        escalation_required = True
        notes.append("Escalation triggered: disease severity remains High despite treatment application.")
    elif curr_risk_level in ("High", "Critical") and prev_risk_level in ("High", "Critical") and treatment_applied:
        escalation_required = True
        notes.append("Escalation triggered: crop remains at High/Critical risk despite treatment application.")
        
    comparison_summary = " ".join(comparison_summary_parts)
    
    return MonitoringDetails(
        follow_up_recommended=True,
        follow_up_due_in_hours=24 if escalation_required else 48,
        progress_assessment=progress,
        escalation_required=escalation_required,
        monitoring_notes=notes,
        comparison_summary=comparison_summary
    )
