from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class FeatureContribution(BaseModel):
    feature: str
    value: Any
    contribution: float
    impact: str  # High Risk Driver, Moderate Risk Driver, Protective Factor, Neutral


class DiseaseRiskRequest(BaseModel):
    patient_id: Optional[int] = None
    age: int
    gender: Any = "male"  # male, female, 1, 0
    systolic_bp: float
    diastolic_bp: float
    cholesterol: float  # mg/dL
    blood_glucose: Optional[float] = None # mg/dL
    fasting_glucose: Optional[float] = None
    bmi: float
    smoking: Optional[int] = 0  # 0 or 1
    alcohol_intake: Optional[int] = None  # 0 or 1
    alcohol: Optional[int] = None
    physical_activity: Optional[int] = None  # 0 or 1
    activity: Optional[int] = None
    family_history: Optional[int] = 0  # 0 or 1


class DiseaseRiskResponse(BaseModel):
    prediction_type: str
    risk_score_percent: float
    risk_category: str  # Low, Moderate, High, Very High
    model_name: str
    model_version: str
    confidence_interval: str
    feature_contributions: List[FeatureContribution]
    explanation_summary: str
    clinical_recommendations: List[str]


class News2Request(BaseModel):
    patient_id: Optional[int] = None
    respiration_rate: Optional[int] = None       # breaths/min
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[int] = None      # %
    spo2: Optional[int] = None
    supplemental_oxygen: Optional[bool] = False   # True/False (air vs oxygen therapy)
    systolic_bp: Optional[int] = 120            # mmHg
    heart_rate: Optional[int] = None             # bpm
    pulse: Optional[int] = None
    consciousness_level: Optional[str] = None    # "Alert" (A) or "CVPU" (Confusion, Voice, Pain, Unresponsive)
    consciousness: Optional[str] = None
    temperature: Optional[float] = 37.0          # Celsius


class News2ScoreBreakdown(BaseModel):
    parameter: str
    value: Any
    sub_score: int
    clinical_rationale: str


class News2Response(BaseModel):
    total_score: int
    clinical_risk_level: str  # Low (0-4), Medium (5-6 or 3 in single parameter), High (>=7)
    monitoring_frequency: str
    clinical_response: str
    parameter_breakdown: List[News2ScoreBreakdown]
    recommendations: List[str]


class ReadmissionRiskRequest(BaseModel):
    patient_id: Optional[int] = None
    age: int
    prior_inpatient_admissions: int
    length_of_stay_days: int
    num_medications: int
    num_diagnoses: int
    emergency_visits_last_year: int
    has_diabetes: int
    has_heart_failure: int
    has_copd: int
    has_hypertension: int


class ReadmissionRiskResponse(BaseModel):
    readmission_risk_percent: float
    risk_tier: str  # Low (<15%), Moderate (15-35%), High (>35%)
    model_name: str
    top_drivers: List[FeatureContribution]
    post_discharge_plan: List[str]


class HospitalForecastResponse(BaseModel):
    metric: str
    forecast_horizon_days: int
    historical_data: List[Dict[str, Any]]
    forecast_data: List[Dict[str, Any]]
    model_type: str
    mean_forecast_value: float
    trend: str
