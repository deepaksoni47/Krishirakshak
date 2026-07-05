# Centralized Configuration for KrishiRakshak AI

# Threshold for disease analysis confidence (0-100)
# Any classification confidence below this requires user clarification.
DISEASE_CONFIDENCE_THRESHOLD = 70

# Audit indicators for mandatory farmer inputs
LOCATION_REQUIRED = True
CROP_STAGE_REQUIRED = True
SPRAY_STATUS_REQUIRED = True

# Critic validation thresholds
CRITIC_RAIN_THRESHOLD = 50.0
CRITIC_CONFIDENCE_THRESHOLD = 70
CRITIC_RISK_CONTRADICTION_THRESHOLD = 30

# Risk Engine weights
RISK_WEIGHT_DISEASE = 0.40
RISK_WEIGHT_HUMIDITY = 0.20
RISK_WEIGHT_RAIN = 0.20
RISK_WEIGHT_TEMP = 0.10
RISK_WEIGHT_STAGE = 0.10

# Risk Engine factor cutoffs / thresholds
HUMIDITY_HIGH_THRESHOLD = 80.0
HUMIDITY_MED_THRESHOLD = 60.0
RAIN_HIGH_THRESHOLD = 80.0
RAIN_MED_THRESHOLD = 50.0

# Temperature suitability bounds (fungal pathogens optimal spread: 20C to 32C)
TEMP_SUITABILITY_MIN = 20.0
TEMP_SUITABILITY_MAX = 32.0

# Confidence penalties for missing context
PENALTY_MISSING_WEATHER = 0.25
PENALTY_MISSING_STAGE = 0.15
PENALTY_MISSING_SPRAY = 0.10


