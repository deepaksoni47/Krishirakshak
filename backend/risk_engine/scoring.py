from backend.config import (
    RISK_WEIGHT_DISEASE,
    RISK_WEIGHT_HUMIDITY,
    RISK_WEIGHT_RAIN,
    RISK_WEIGHT_TEMP,
    RISK_WEIGHT_STAGE,
    HUMIDITY_HIGH_THRESHOLD,
    HUMIDITY_MED_THRESHOLD,
    RAIN_HIGH_THRESHOLD,
    RAIN_MED_THRESHOLD,
    TEMP_SUITABILITY_MIN,
    TEMP_SUITABILITY_MAX,
    PENALTY_MISSING_WEATHER,
    PENALTY_MISSING_STAGE,
    PENALTY_MISSING_SPRAY
)
from backend.schemas.farmer_case import FarmerCase, RiskAssessment, RiskFactor

def calculate_risk(case: FarmerCase) -> RiskAssessment:
    """
    Computes explainable structured risk assessment based on weighted factors and estimates confidence.
    """
    factors = []
    top_drivers = []
    warnings = []
    
    # 1. Factor: Disease Severity
    severity = case.disease_analysis.severity or "Low"
    disease_conf = case.confidence_scores.confidence or 0
    if severity == "High":
        sev_score = 100.0
        sev_explanation = "Disease severity was classified as High, posing immediate yield threat."
    elif severity == "Medium":
        sev_score = 60.0
        sev_explanation = "Disease severity was classified as Medium, indicating moderate spread."
    else:
        sev_score = 30.0
        sev_explanation = "Disease severity was classified as Low, suggesting localized anomalies."
        
    sev_contribution = sev_score * RISK_WEIGHT_DISEASE
    factors.append(RiskFactor(
        name="disease_severity",
        raw_value=severity,
        normalized_score=sev_score,
        weight=RISK_WEIGHT_DISEASE,
        contribution=sev_contribution,
        explanation=sev_explanation
    ))
    
    # 2. Factor: Humidity
    humidity_val = case.weather_analysis.humidity
    executed = case.executed_agents or []
    weather_missing = "Weather Agent" not in executed
    
    if weather_missing:
        # Default fallback values for calculation
        hum_score = 50.0
        hum_explanation = "Weather humidity data unavailable (Weather Agent bypassed)."
    else:
        if humidity_val >= HUMIDITY_HIGH_THRESHOLD:
            hum_score = 100.0
            hum_explanation = f"Very high humidity ({humidity_val}%) accelerates fungal pathogen multiplication."
        elif humidity_val >= HUMIDITY_MED_THRESHOLD:
            hum_score = 60.0
            hum_explanation = f"Moderate humidity ({humidity_val}%) permits standard spore dispersal."
        else:
            hum_score = 20.0
            hum_explanation = f"Low humidity ({humidity_val}%) retards pathogen development."
            
    hum_contribution = hum_score * RISK_WEIGHT_HUMIDITY
    factors.append(RiskFactor(
        name="humidity",
        raw_value=f"{humidity_val}%" if humidity_val is not None else "Unknown",
        normalized_score=hum_score,
        weight=RISK_WEIGHT_HUMIDITY,
        contribution=hum_contribution,
        explanation=hum_explanation
    ))
    
    # 3. Factor: Rain Probability
    rain_val = case.weather_analysis.rain_probability
    if weather_missing:
        rain_score = 30.0
        rain_explanation = "Rain probability data unavailable (Weather Agent bypassed)."
    else:
        if rain_val >= RAIN_HIGH_THRESHOLD:
            rain_score = 100.0
            rain_explanation = f"Very high rain expected ({rain_val}%) - high risk of wash-off & foliage wetness."
        elif rain_val >= RAIN_MED_THRESHOLD:
            rain_score = 60.0
            rain_explanation = f"Moderate rain expected ({rain_val}%) - potential for wash-off."
        else:
            rain_score = 20.0
            rain_explanation = f"Low rain expected ({rain_val}%) - dry crop canopy."
            
    rain_contribution = rain_score * RISK_WEIGHT_RAIN
    factors.append(RiskFactor(
        name="rain_probability",
        raw_value=f"{rain_val}%" if rain_val is not None else "Unknown",
        normalized_score=rain_score,
        weight=RISK_WEIGHT_RAIN,
        contribution=rain_contribution,
        explanation=rain_explanation
    ))
    
    # 4. Factor: Temperature Suitability
    temp_val = case.weather_analysis.temperature
    if weather_missing:
        temp_score = 50.0
        temp_explanation = "Temperature data unavailable."
    else:
        if TEMP_SUITABILITY_MIN <= temp_val <= TEMP_SUITABILITY_MAX:
            temp_score = 100.0
            temp_explanation = f"Temperature ({temp_val}C) is optimal for standard fungal pathogen incubation."
        else:
            temp_score = 30.0
            temp_explanation = f"Temperature ({temp_val}C) is outside standard incubation optimal bounds."
            
    temp_contribution = temp_score * RISK_WEIGHT_TEMP
    factors.append(RiskFactor(
        name="temperature_suitability",
        raw_value=f"{temp_val}C" if temp_val is not None else "Unknown",
        normalized_score=temp_score,
        weight=RISK_WEIGHT_TEMP,
        contribution=temp_contribution,
        explanation=temp_explanation
    ))
    
    # 5. Factor: Crop Stage Vulnerability
    stage = case.crop_stage
    if not stage:
        stage_score = 40.0
        stage_explanation = "Growth stage unknown. Default moderate crop vulnerability applied."
    else:
        stage_lower = stage.lower()
        if "fruit" in stage_lower or "flower" in stage_lower:
            stage_score = 100.0
            stage_explanation = f"Crop in {stage} stage, which is highly vulnerable to infection."
        elif "veg" in stage_lower:
            stage_score = 60.0
            stage_explanation = f"Crop in vegetative stage with moderate foliage coverage."
        else:
            stage_score = 40.0
            stage_explanation = f"Crop in seedling/early growth stage."
            
    stage_contribution = stage_score * RISK_WEIGHT_STAGE
    factors.append(RiskFactor(
        name="crop_stage_sensitivity",
        raw_value=str(stage or "Unknown"),
        normalized_score=stage_score,
        weight=RISK_WEIGHT_STAGE,
        contribution=stage_contribution,
        explanation=stage_explanation
    ))
    
    # 6. Overall score
    overall_score = int(round(sum(f.contribution for f in factors)))
    
    # 7. Classification and Priority
    if overall_score >= 90:
        risk_level = "Critical"
        priority = "Immediate Intervention"
        warning_msg = "Crop is at critical risk."
    elif overall_score >= 70:
        risk_level = "High"
        priority = "Action Required"
        warning_msg = "Crop is at critical risk."
    elif overall_score >= 40:
        risk_level = "Medium"
        priority = "Monitor"
        warning_msg = None
    else:
        risk_level = "Low"
        priority = "Routine"
        warning_msg = None
        
    # 8. Confidence estimation
    confidence = 1.0
    if weather_missing:
        confidence -= PENALTY_MISSING_WEATHER
        warnings.append("Weather data missing, risk confidence reduced")
    if not case.crop_stage:
        confidence -= PENALTY_MISSING_STAGE
        warnings.append("Crop stage unknown, vulnerability estimate may be incomplete")
    if not case.sprayed_recently:
        confidence -= PENALTY_MISSING_SPRAY
        warnings.append("Pesticide application history missing")
        
    # Scale by disease confidence
    intent = case.planner_output.intent
    if intent == "DiseaseDiagnosis" and case.confidence_scores.confidence is not None:
        confidence *= (case.confidence_scores.confidence / 100.0)
        
    # Clamp confidence
    confidence = max(0.1, min(1.0, round(confidence, 2)))
    
    # 9. Top drivers extraction (normalize score >= 60 sorted by contribution desc)
    sorted_factors = sorted(factors, key=lambda f: f.contribution, reverse=True)
    for f in sorted_factors:
        if f.normalized_score >= 60.0:
            if f.name == "disease_severity":
                top_drivers.append(f"High disease severity ({severity})")
            elif f.name == "humidity":
                top_drivers.append(f"High relative humidity ({humidity_val}%)")
            elif f.name == "rain_probability":
                top_drivers.append(f"High rain probability expected ({rain_val}%)")
            elif f.name == "temperature_suitability":
                top_drivers.append(f"Optimal pathogen spread temperatures ({temp_val}C)")
            elif f.name == "crop_stage_sensitivity":
                top_drivers.append(f"Sensitive growth stage ({stage})")
                
    # 10. Summary sentence
    if top_drivers:
        drivers_text = ", ".join(top_drivers[:3])
        reasoning_summary = f"Risk is {risk_level.lower()} primarily due to: {drivers_text}."
    else:
        reasoning_summary = f"Risk is low with stable environmental and pathological conditions."
        
    # Build backward compatible payload
    result_dict = {
        "agent": "Risk Assessment Agent",
        "message": f"Assessed crop risk level as {risk_level} (Score: {overall_score}).",
        "risk_score": overall_score,
        "risk_level": risk_level,
        "risk_factors": top_drivers,
        "priority": priority,
        "warnings": warnings,
        "confidence": confidence,
        "reasoning_summary": reasoning_summary
    }
    
    return RiskAssessment(
        risk_score=overall_score,
        risk_level=risk_level,
        risk_factors=top_drivers,
        priority=priority,
        warning=warning_msg,
        result=result_dict,
        overall_score=overall_score,
        confidence=confidence,
        factors=factors,
        top_drivers=top_drivers,
        warnings=warnings,
        reasoning_summary=reasoning_summary
    )
