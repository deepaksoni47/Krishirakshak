"""
backend/agents/scheme_advisor_agent.py
Phase 7: Government Scheme & Subsidy Advisor Agent

Retrieves and ranks relevant government agricultural schemes using the RAG pipeline.
Generates personalized scheme recommendations with eligibility reasons and financial
support score based on: disease, severity, risk level, treatment cost, and location.
"""
import os
from backend.graph.state import AgentState
from backend.rag.retriever import retrieve_relevant_schemes


# ---------------------------------------------------------------------------
# Helper: extract key terms for RAG query
# ---------------------------------------------------------------------------
def _build_rag_query(state: AgentState) -> str:
    """
    Build a descriptive query from current state for RAG retrieval.
    Richer query = better semantic matches.
    """
    parts = []

    disease   = state.get("disease_name") or "crop disease"
    crop      = state.get("crop_name") or "crop"
    risk      = state.get("risk_level") or "Medium"
    severity  = state.get("severity") or "Medium"
    cost      = state.get("estimated_cost") or 0
    location  = state.get("location") or ""

    parts.append(f"Farmer growing {crop} facing {disease} with {severity} severity and {risk} risk level.")

    if cost and cost > 400:
        parts.append("Needs financial support for expensive crop treatment and fungicide purchase.")
    if cost and cost > 0:
        parts.append(f"Treatment cost approximately INR {cost}.")

    rain = state.get("rain_probability") or 0
    if rain >= 60:
        parts.append("Heavy rainfall expected. Irrigation and water management support needed.")

    humidity = state.get("humidity") or 0
    if humidity >= 75:
        parts.append("High humidity creating fungal disease risk. Crop protection and insurance needed.")

    if risk in ("High", "Critical"):
        parts.append("Crop insurance support urgently needed due to high disease risk and potential yield loss.")

    if location:
        parts.append(f"Farmer located in {location}.")

    parts.append("Government schemes for crop insurance, credit, treatment cost support, and agricultural subsidy.")

    return " ".join(parts)


# ---------------------------------------------------------------------------
# Helper: generate personalized eligibility reason for each scheme
# ---------------------------------------------------------------------------
def _generate_reason(scheme_id: str, scheme_name: str, state: AgentState) -> str:
    """Generate a farmer-friendly explanation of why this scheme is recommended."""
    risk     = state.get("risk_level") or "Medium"
    disease  = state.get("disease_name") or "crop disease"
    cost     = state.get("estimated_cost") or 0
    crop     = state.get("crop_name") or "your crop"

    reason_map = {
        "PMFBY": (
            f"Your {crop} faces {risk.lower()} risk from {disease}. "
            "PMFBY crop insurance can compensate for yield losses caused by disease and natural calamities. "
            "Premium rates are as low as 2% for Kharif crops."
        ),
        "KCC": (
            f"With an estimated treatment cost of INR {cost}, a Kisan Credit Card gives you "
            "flexible agricultural credit at just 4% interest p.a. to purchase fungicides and inputs without financial stress."
        ),
        "SoilHealthCard": (
            f"Balanced soil nutrition improves {crop} resistance to {disease}. "
            "A free Soil Health Card will guide fertilizer use and reduce future disease susceptibility."
        ),
        "PMKSY": (
            "Proper irrigation management reduces leaf wetness and humidity — key triggers for fungal diseases. "
            "PMKSY subsidises drip and sprinkler systems by up to 65% for small/marginal farmers."
        ),
        "PM_KISAN": (
            f"PM-KISAN provides INR 6,000/year directly to your bank account to help cover "
            f"seed, fertilizer, and crop protection costs including treatment for {disease}."
        ),
        "RKVY": (
            f"RKVY funds agricultural extension, disease-resistant variety trials, and drone spraying programs "
            f"that can help manage {disease} more effectively with precision agriculture."
        ),
        "NFSM": (
            f"NFSM distributes free certified seeds of {disease}-resistant crop varieties. "
            "Switching to resistant varieties can prevent future outbreaks and reduce treatment costs."
        ),
        "PKVY": (
            "PKVY promotes organic and bio-fungicide farming, providing INR 50,000/hectare support. "
            "Bio-pesticides can reduce chemical dependency while managing crop disease sustainably."
        ),
        "AIF": (
            "Agriculture Infrastructure Fund provides low-interest loans (3% subvention) for "
            "post-harvest storage infrastructure to minimise losses after disease-affected harvests."
        ),
        "FertilizerSubsidy": (
            f"Balanced NPK fertilization strengthens {crop} immunity against {disease}. "
            "Government fertilizer subsidies make quality inputs accessible — urea at just INR 242/bag."
        ),
        "FPO": (
            f"Joining a Farmer Producer Organization lets you bulk-purchase fungicides and pesticides "
            f"at discounted rates, significantly reducing the INR {cost} treatment cost burden."
        ),
    }
    return reason_map.get(scheme_id, (
        f"This scheme provides financial support relevant to your current situation "
        f"of {risk.lower()} risk {disease} affecting your {crop}."
    ))


# ---------------------------------------------------------------------------
# Helper: generate application tips per scheme
# ---------------------------------------------------------------------------
def _get_application_tip(scheme_id: str) -> str:
    tips = {
        "PMFBY": "Enroll before the last date of your Kharif/Rabi season at your nearest bank or CSC. Helpline: 14447.",
        "KCC":   "Visit your nearest nationalized bank or cooperative bank with land records and Aadhaar for same-week card issuance.",
        "SoilHealthCard": "Contact your local Krishi Vigyan Kendra (KVK) or call the state agriculture helpline for free soil testing.",
        "PMKSY": "Apply through your state's agriculture department portal for drip/sprinkler subsidy before the season begins.",
        "PM_KISAN": "Register at pmkisan.gov.in or visit your nearest CSC. Funds are released every 4 months.",
        "RKVY": "Contact the District Agriculture Officer (DAO) for demonstration plots and extension services in your area.",
        "NFSM": "Visit the District Agriculture Office for subsidized certified seed distribution under NFSM notified crops.",
        "PKVY": "Form a group of 20+ farmers and apply through the State Agriculture Department for cluster registration.",
        "AIF": "Apply online at agriinfra.dac.gov.in with your project proposal and business plan.",
        "FertilizerSubsidy": "Purchase fertilizers from registered dealers using Aadhaar authentication at the PoS machine.",
        "FPO": "Find nearby FPOs via SFAC (sfacindia.com) or contact your state's agriculture department.",
    }
    return tips.get(scheme_id, "Contact your nearest District Agriculture Office or Krishi Vigyan Kendra for details.")


# ---------------------------------------------------------------------------
# Helper: compute financial support score
# ---------------------------------------------------------------------------
def _compute_financial_support_score(state: AgentState) -> int:
    """
    Compute 0–100 financial support score based on how urgently
    the farmer needs government scheme support.
    """
    score = 0

    risk_level = state.get("risk_level") or "Low"
    if risk_level == "Critical":
        score += 40
    elif risk_level == "High":
        score += 28
    elif risk_level == "Medium":
        score += 15

    cost = state.get("estimated_cost") or 0
    if cost > 600:
        score += 25
    elif cost > 400:
        score += 18
    elif cost > 200:
        score += 10

    severity = state.get("severity") or "Low"
    if severity == "High":
        score += 20
    elif severity == "Medium":
        score += 10

    rain = state.get("rain_probability") or 0
    if rain >= 70:
        score += 15
    elif rain >= 40:
        score += 8

    return min(score, 100)


# ---------------------------------------------------------------------------
# Agent Node
# ---------------------------------------------------------------------------
def scheme_advisor_agent(state: AgentState) -> AgentState:
    """
    Scheme Advisor Agent Node (Phase 7).

    Retrieves relevant government schemes via RAG pipeline,
    generates personalised recommendations with eligibility reasons,
    computes financial support score, and updates workflow trace.
    """
    # 1. Build rich RAG query from current state
    rag_query = _build_rag_query(state)

    # 2. Retrieve top 4 relevant scheme documents
    retrieved = retrieve_relevant_schemes(rag_query, k=4)

    # 3. Build structured scheme recommendations
    eligible_schemes: list[str] = []
    scheme_recommendations: list[dict] = []

    for item in retrieved:
        scheme_id   = item.get("scheme_id", "")
        scheme_name = item.get("scheme_name", scheme_id)
        scheme_type = item.get("scheme_type", "Government Scheme")

        eligible_schemes.append(scheme_name)

        scheme_recommendations.append({
            "name":             scheme_name,
            "scheme_id":        scheme_id,
            "type":             scheme_type,
            "reason":           _generate_reason(scheme_id, scheme_name, state),
            "application_tip":  _get_application_tip(scheme_id),
            "relevance_score":  item.get("relevance_score", 0.0),
        })

    # 4. Financial support score
    financial_support_score = _compute_financial_support_score(state)

    # 5. Update workflow trace
    current_path = list(state.get("workflow_path", []))
    current_path.append("Scheme Advisor Agent")

    return {
        **state,
        "eligible_schemes":       eligible_schemes,
        "scheme_recommendations": scheme_recommendations,
        "financial_support_score": financial_support_score,
        "workflow_path":          current_path,
        "result": {
            "agent":                  "Scheme Advisor Agent",
            "message":                f"Found {len(scheme_recommendations)} relevant government schemes.",
            "eligible_schemes":       eligible_schemes,
            "scheme_recommendations": scheme_recommendations,
            "financial_support_score": financial_support_score,
        }
    }
