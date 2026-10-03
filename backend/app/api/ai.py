from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database.database import get_db
from app.models.user import User
from app.models.ai_prediction import AIPrediction
from app.schemas.ai import (
    DiseaseRiskRequest,
    DiseaseRiskResponse,
    News2Request,
    News2Response,
    ReadmissionRiskRequest,
    ReadmissionRiskResponse,
    HospitalForecastResponse
)
from app.ml.disease_risk import predict_disease_risk
from app.ml.early_warning import calculate_news2
from app.ml.readmission_risk import predict_readmission_risk
from app.ml.forecasting import forecast_hospital_metric
from app.services.admin_service import create_audit_log
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI & Machine Learning Engine"]
)


@router.post("/disease-risk", response_model=DiseaseRiskResponse)
def predict_disease_risk_api(
    req: DiseaseRiskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Predicts 10-year Cardiovascular / Chronic Disease Risk using trained Gradient Boosting ML model
    with granular Explainable AI (XAI) feature contribution attributions.
    """
    glucose = req.blood_glucose if req.blood_glucose is not None else (req.fasting_glucose if req.fasting_glucose is not None else 95.0)
    alcohol_val = req.alcohol_intake if req.alcohol_intake is not None else (req.alcohol if req.alcohol is not None else 0)
    activity_val = req.physical_activity if req.physical_activity is not None else (req.activity if req.activity is not None else 1)

    result = predict_disease_risk(
        age=req.age,
        gender=req.gender,
        systolic_bp=req.systolic_bp,
        diastolic_bp=req.diastolic_bp,
        cholesterol=req.cholesterol,
        blood_glucose=glucose,
        bmi=req.bmi,
        smoking=req.smoking or 0,
        alcohol=alcohol_val,
        physical_activity=activity_val,
        family_history=req.family_history or 0
    )
    
    # If patient_id provided, persist prediction record
    if req.patient_id:
        pred_record = AIPrediction(
            patient_id=req.patient_id,
            doctor_id=current_user.id if current_user.role == "doctor" else None,
            model_name=result["model_name"],
            model_version=result["model_version"],
            prediction_type=result["prediction_type"],
            risk_score=result["risk_score_percent"],
            risk_category=result["risk_category"],
            confidence_interval=result["confidence_interval"],
            input_features=req.dict(),
            feature_contributions=result["feature_contributions"],
            explanation_summary=result["explanation_summary"],
            recommendations=result["clinical_recommendations"]
        )
        db.add(pred_record)
        db.commit()
        
    create_audit_log(
        db,
        action="AI_DISEASE_PREDICTION",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="AI_Model",
        resource_id=result["model_name"],
        details={"risk_percent": result["risk_score_percent"], "category": result["risk_category"]}
    )
    
    return result


@router.post("/news2", response_model=News2Response)
@router.post("/early-warning", response_model=News2Response)
def calculate_news2_api(
    req: News2Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes National Early Warning Score 2 (NEWS2) from 7 standard physiological vital markers.
    """
    rr_val = req.respiration_rate if req.respiration_rate is not None else (req.respiratory_rate if req.respiratory_rate is not None else 16)
    spo2_val = req.oxygen_saturation if req.oxygen_saturation is not None else (req.spo2 if req.spo2 is not None else 98)
    hr_val = req.heart_rate if req.heart_rate is not None else (req.pulse if req.pulse is not None else 72)
    conscious_val = req.consciousness_level or req.consciousness or "Alert"

    result = calculate_news2(
        respiration_rate=rr_val,
        oxygen_saturation=spo2_val,
        supplemental_oxygen=bool(req.supplemental_oxygen),
        systolic_bp=req.systolic_bp or 120,
        heart_rate=hr_val,
        consciousness_level=conscious_val,
        temperature=req.temperature or 37.0
    )
    
    if req.patient_id:
        pred_record = AIPrediction(
            patient_id=req.patient_id,
            doctor_id=current_user.id if current_user.role == "doctor" else None,
            model_name="NEWS2_Clinical_Engine",
            model_version="2.0.0",
            prediction_type="Early Warning Score",
            risk_score=float(result["total_score"]),
            risk_category=result["clinical_risk_level"],
            confidence_interval="Deterministic Formula",
            input_features=req.dict(),
            feature_contributions=[{"feature": p["parameter"], "value": p["value"], "contribution": p["sub_score"], "impact": p["clinical_rationale"]} for p in result["parameter_breakdown"]],
            explanation_summary=result["clinical_response"],
            recommendations=result["recommendations"]
        )
        db.add(pred_record)
        db.commit()
        
    return result



@router.post("/readmission", response_model=ReadmissionRiskResponse)
def predict_readmission_api(
    req: ReadmissionRiskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates 30-day post-discharge hospital readmission probability with clinical feature attribution.
    """
    result = predict_readmission_risk(
        age=req.age,
        prior_inpatient_admissions=req.prior_inpatient_admissions,
        length_of_stay_days=req.length_of_stay_days,
        num_medications=req.num_medications,
        num_diagnoses=req.num_diagnoses,
        emergency_visits_last_year=req.emergency_visits_last_year,
        has_diabetes=req.has_diabetes,
        has_heart_failure=req.has_heart_failure,
        has_copd=req.has_copd,
        has_hypertension=req.has_hypertension
    )
    return result


@router.get("/forecast", response_model=HospitalForecastResponse)
def get_forecast_api(
    metric: str = "bed_occupancy",
    horizon_days: int = 14,
    current_user: User = Depends(get_current_user)
):
    """
    Produces historical time-series analytics and 14-30 day forecasts for hospital resource metrics.
    """
    base = 78.0 if metric == "bed_occupancy" else (65.0 if metric == "icu_demand" else 82.0)
    return forecast_hospital_metric(metric_name=metric, horizon_days=horizon_days, base_level=base)
