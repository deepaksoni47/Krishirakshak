import json
import os
from backend.graph.state import AgentState

# ---------------------------------------------------------------------------
# Load Treatment Knowledge Base
# ---------------------------------------------------------------------------
_KB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "treatments.json")

def _load_kb() -> dict:
    """Load the treatment knowledge base from JSON file."""
    with open(_KB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

TREATMENT_KB = _load_kb()


def _get_treatment_record(disease_name: str | None) -> dict:
    """
    Retrieve treatment record for a given disease.
    Falls back to the 'default' entry if disease is unknown.
    """
    if not disease_name:
        return TREATMENT_KB.get("default", {})
    # Try exact match first, then case-insensitive partial match
    if disease_name in TREATMENT_KB:
        return TREATMENT_KB[disease_name]
    for key in TREATMENT_KB:
        if key.lower() in disease_name.lower() or disease_name.lower() in key.lower():
            return TREATMENT_KB[key]
    return TREATMENT_KB.get("default", {})


def _build_recommended_actions(
    disease_name: str | None,
    risk_level: str | None,
    rain_probability: float,
    severity: str | None,
    treatment_record: dict
) -> list[str]:
    """
    Build a contextual list of recommended actions based on disease,
    weather conditions, and risk level.
    """
    actions: list[str] = []

    # Step 1: Immediate inspection
    actions.append(f"Inspect all {disease_name or 'crop'} affected areas and mark the extent of spread.")

    # Step 2: Weather-aware chemical application advice
    if rain_probability >= 70:
        actions.append(
            "⚠️ Rain expected — DO NOT spray fungicide today. "
            "Wait until rainfall ends and leaves dry before applying chemicals."
        )
        actions.append("Cover seedbeds and nurseries with polythene sheets to prevent rain splash infection.")
    elif rain_probability >= 40:
        actions.append(
            "Apply fungicide in the early morning before any rainfall. "
            "Choose rain-fast formulations for better efficacy."
        )
    else:
        chemical = treatment_record.get("chemical", "Recommended fungicide")
        actions.append(f"Apply {chemical} as per package directions. Spray during early morning or late evening.")

    # Step 3: Field management
    if severity == "High":
        actions.append("Remove and safely destroy all severely infected plant parts immediately to limit spread.")
        actions.append("Alert neighboring farmers — high-severity disease can spread rapidly via wind/water.")
    elif severity == "Medium":
        actions.append("Selectively prune and remove moderately infected leaves and stems.")
    else:
        actions.append("Lightly trim any visibly infected areas and dispose away from the field.")

    # Step 4: Preventive actions from KB
    preventive = treatment_record.get("preventive_actions", [])
    for action in preventive[:2]:  # Add top 2 preventive actions
        actions.append(action)

    # Step 5: Follow-up monitoring
    recovery_days = treatment_record.get("recovery_days", 7)
    actions.append(f"Monitor crop condition daily for the next {recovery_days} days and track symptom progression.")

    return actions


def _build_action_timeline(
    treatment_record: dict,
    rain_probability: float,
    risk_level: str | None
) -> list[dict]:
    """
    Build a structured action timeline (Today / Tomorrow / Next N days).
    """
    recovery_days = treatment_record.get("recovery_days", 7)
    chemical = treatment_record.get("chemical", "Recommended fungicide")

    today_tasks = ["Inspect affected crops and photograph the extent of damage"]
    if rain_probability < 40:
        today_tasks.append(f"Apply {chemical}")
    else:
        today_tasks.append("Prepare chemical spray — apply once rain stops")

    if risk_level in ("High", "Critical"):
        today_tasks.append("Alert local agricultural extension officer")

    tomorrow_tasks = []
    if rain_probability >= 40:
        tomorrow_tasks.append(f"Apply {chemical} after field dries")
    tomorrow_tasks.append("Check for new infection spots or spread")
    tomorrow_tasks.append("Drain excess water from field if present")

    followup_tasks = [
        f"Re-apply fungicide after {min(7, recovery_days // 2)} days if symptoms persist",
        "Collect leaf samples for laboratory confirmation if unsure of diagnosis",
        f"Assess crop recovery after {recovery_days} days of treatment"
    ]

    return [
        {"period": "Today", "tasks": today_tasks},
        {"period": "Tomorrow", "tasks": tomorrow_tasks},
        {"period": f"Next {recovery_days} Days", "tasks": followup_tasks}
    ]


def _determine_intervention_priority(risk_level: str | None, severity: str | None) -> str:
    """Map risk level and severity to a human-readable intervention priority string."""
    if risk_level == "Critical":
        return "Immediate Intervention"
    elif risk_level == "High":
        return "Action Required Within 24 Hours"
    elif risk_level == "Medium":
        return "Take Preventive Measures This Week"
    else:
        return "Routine Monitoring Sufficient"


# ---------------------------------------------------------------------------
# Agent Node
# ---------------------------------------------------------------------------
def treatment_agent(state: AgentState) -> AgentState:
    """
    Treatment & Intervention Agent Node (Phase 6).

    Reads disease diagnosis, weather data, and risk assessment from state.
    Generates:
        - treatment_plan       : dict with treatment text, chemical, cost, recovery_days
        - recommended_actions  : list[str] — weather-aware prioritised actions
        - action_timeline      : list[dict] — Today / Tomorrow / Next N Days breakdown
        - estimated_cost       : int (INR estimate)
        - expected_recovery_days : int
        - intervention_priority  : str
    """
    disease_name    = state.get("disease_name")
    risk_level      = state.get("risk_level")
    severity        = state.get("severity") or "Medium"
    rain_probability = float(state.get("rain_probability") or 0)

    # 1. Fetch treatment record from knowledge base
    record = _get_treatment_record(disease_name)

    # 2. Build core treatment plan dict
    treatment_plan = {
        "treatment":    record.get("treatment", "Consult local extension officer."),
        "chemical":     record.get("chemical", "Broad-spectrum fungicide"),
        "estimated_cost": record.get("estimated_cost", 350),
        "recovery_days":  record.get("recovery_days", 10)
    }

    # 3. Weather-aware recommended actions
    recommended_actions = _build_recommended_actions(
        disease_name, risk_level, rain_probability, severity, record
    )

    # 4. Action timeline
    action_timeline = _build_action_timeline(record, rain_probability, risk_level)

    # 5. Scalar fields
    estimated_cost       = record.get("estimated_cost", 350)
    expected_recovery_days = record.get("recovery_days", 10)
    intervention_priority  = _determine_intervention_priority(risk_level, severity)

    # 6. Update workflow trace
    current_path = list(state.get("workflow_path", []))
    current_path.append("Treatment Agent")

    return {
        **state,
        "treatment_plan":          treatment_plan,
        "recommended_actions":     recommended_actions,
        "action_timeline":         action_timeline,
        "estimated_cost":          estimated_cost,
        "expected_recovery_days":  expected_recovery_days,
        "intervention_priority":   intervention_priority,
        "workflow_path":           current_path,
        "result": {
            "agent":                 "Treatment Agent",
            "message":               f"Treatment plan generated for {disease_name or 'detected issue'}.",
            "treatment_plan":        treatment_plan,
            "recommended_actions":   recommended_actions,
            "action_timeline":       action_timeline,
            "estimated_cost":        estimated_cost,
            "expected_recovery_days": expected_recovery_days,
            "intervention_priority": intervention_priority
        }
    }
