export interface AnalyzeRequest {
  crop_name: string;
  query: string;
  image_uploaded: boolean;
  location?: string;
}

export interface TreatmentPlan {
  treatment: string;
  chemical: string;
  estimated_cost: number;
  recovery_days: number;
}

export interface ActionTimeline {
  period: string;
  tasks: string[];
}

export interface SchemeRecommendation {
  name: string;
  scheme_id: string;
  type: string;
  reason: string;
  application_tip: string;
  relevance_score: number;
}

export interface AnalyzeResponse {
  workflow_path: string[];
  route?: string;
  disease_name?: string;
  confidence?: number;
  severity?: string;
  symptoms?: string[];
  recommendation?: string;
  message?: string;
  temperature?: number;
  humidity?: number;
  rain_probability?: number;
  weather_risk?: string;
  alert?: string;
  alert_advice?: string;
  // Phase 5: Risk Assessment fields
  risk_score?: number;
  risk_level?: string;
  risk_factors?: string[];
  priority?: string;
  warning?: string;
  // Phase 6: Treatment & Intervention fields
  treatment_plan?: TreatmentPlan;
  recommended_actions?: string[];
  action_timeline?: ActionTimeline[];
  estimated_cost?: number;
  expected_recovery_days?: number;
  intervention_priority?: string;
  // Phase 7: Government Scheme Advisor fields
  eligible_schemes?: string[];
  scheme_recommendations?: SchemeRecommendation[];
  financial_support_score?: number;
  result?: {
    agent: string;
    message: string;
    [key: string]: any;
  };
}

export type AgentNodeStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface AgentStep {
  name: string;
  description: string;
  status: AgentNodeStatus;
}
