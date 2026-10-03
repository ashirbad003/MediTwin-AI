from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.models.patient import Patient
from app.models.user import User
from app.models.medical_record import MedicalRecord, PatientAllergy, PatientCondition, ClinicalNote
from app.models.medical_report import MedicalReport
from app.models.prescription import Prescription
from app.models.appointment import Appointment
from app.models.ai_prediction import AIPrediction
from app.schemas.patient import PatientCreate, PatientUpdate


def get_patient_by_user_id(db: Session, user_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.user_id == user_id).first()


def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def create_or_update_patient_profile(
    db: Session,
    user_id: int,
    data: PatientUpdate
) -> Patient:
    patient = get_patient_by_user_id(db, user_id)
    if not patient:
        patient = Patient(user_id=user_id)
        db.add(patient)
        
    data_dict = data.dict(exclude_unset=True)
    if "height_cm" in data_dict and data_dict["height_cm"] is not None:
        data_dict["height"] = data_dict["height_cm"]
    if "weight_kg" in data_dict and data_dict["weight_kg"] is not None:
        data_dict["weight"] = data_dict["weight_kg"]
    if "alcohol_consumption" in data_dict and data_dict["alcohol_consumption"] is not None:
        data_dict["alcohol_intake"] = data_dict["alcohol_consumption"]
    if "physical_activity_level" in data_dict and data_dict["physical_activity_level"] is not None:
        data_dict["physical_activity"] = data_dict["physical_activity_level"]
        
    for key, value in data_dict.items():
        if hasattr(patient, key) and value is not None:
            if key == "date_of_birth" and isinstance(value, str):
                try:
                    value = datetime.strptime(value.split("T")[0], "%Y-%m-%d").date()
                except Exception:
                    pass
            setattr(patient, key, value)
            
    db.commit()
    db.refresh(patient)
    return patient


def add_patient_allergy(db: Session, patient_id: int, allergen: str, reaction: str = None, severity: str = "moderate") -> PatientAllergy:
    allergy = PatientAllergy(
        patient_id=patient_id,
        allergen=allergen,
        reaction=reaction,
        severity=severity
    )
    db.add(allergy)
    db.commit()
    db.refresh(allergy)
    return allergy


def delete_patient_allergy(db: Session, patient_id: int, allergy_id: int) -> bool:
    allergy = db.query(PatientAllergy).filter(
        PatientAllergy.id == allergy_id,
        PatientAllergy.patient_id == patient_id
    ).first()
    if allergy:
        db.delete(allergy)
        db.commit()
        return True
    return False


def add_patient_condition(db: Session, patient_id: int, condition_name: str, diagnosed_date: str = None, status: str = "active", notes: str = None) -> PatientCondition:
    cond = PatientCondition(
        patient_id=patient_id,
        condition_name=condition_name,
        diagnosed_date=diagnosed_date,
        status=status,
        notes=notes
    )
    db.add(cond)
    db.commit()
    db.refresh(cond)
    return cond


def delete_patient_condition(db: Session, patient_id: int, condition_id: int) -> bool:
    cond = db.query(PatientCondition).filter(
        PatientCondition.id == condition_id,
        PatientCondition.patient_id == patient_id
    ).first()
    if cond:
        db.delete(cond)
        db.commit()
        return True
    return False


def get_available_doctors(db: Session) -> List[Dict[str, Any]]:
    from app.models.doctor import Doctor
    doctors = db.query(Doctor).join(User).filter(User.is_active == True).all()
    results = []
    for d in doctors:
        u = d.user
        results.append({
            "id": d.id,
            "user_id": d.user_id,
            "full_name": u.full_name if u else "Doctor",
            "email": u.email if u else "",
            "specialization": d.specialization or "General Medicine",
            "qualification": d.qualification,
            "department": d.department or "Clinical Medicine",
            "experience_years": d.experience_years,
            "consultation_fee": d.consultation_fee or 500,
            "availability": d.availability or "Mon-Fri, 9:00 AM - 5:00 PM"
        })
    return results


def add_medical_record(
    db: Session,
    patient_id: int,
    doctor_id: Optional[int] = None,
    **kwargs
) -> MedicalRecord:
    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        **kwargs
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_patient_dashboard_data(db: Session, user_id: int) -> Dict[str, Any]:
    patient = get_patient_by_user_id(db, user_id)
    if not patient:
        # Auto-create empty profile
        patient = Patient(user_id=user_id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
    user = db.query(User).filter(User.id == user_id).first()
    
    # Latest records
    latest_vitals = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).order_by(MedicalRecord.created_at.desc()).first()
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.status.in_(["scheduled", "confirmed"])
    ).order_by(Appointment.appointment_date.asc()).all()
    
    active_prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient.id,
        Prescription.status == "active"
    ).order_by(Prescription.created_at.desc()).all()
    
    recent_reports = db.query(MedicalReport).filter(
        MedicalReport.patient_id == patient.id
    ).order_by(MedicalReport.created_at.desc()).limit(5).all()
    
    latest_ai_prediction = db.query(AIPrediction).filter(
        AIPrediction.patient_id == patient.id
    ).order_by(AIPrediction.created_at.desc()).first()
    
    allergies = db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient.id).all()
    conditions = db.query(PatientCondition).filter(PatientCondition.patient_id == patient.id).all()
    
    return {
        "patient_id": patient.id,
        "full_name": user.full_name if user else "Patient",
        "email": user.email if user else "",
        "profile": {
            "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "emergency_contact": patient.emergency_contact,
            "height": patient.height,
            "weight": patient.weight,
            "smoking_status": patient.smoking_status,
            "alcohol_intake": patient.alcohol_intake,
            "physical_activity": patient.physical_activity
        },
        "latest_vitals": {
            "heart_rate": latest_vitals.heart_rate if latest_vitals else 72,
            "systolic_bp": latest_vitals.systolic_bp if latest_vitals else 120,
            "diastolic_bp": latest_vitals.diastolic_bp if latest_vitals else 80,
            "respiratory_rate": latest_vitals.respiratory_rate if latest_vitals else 16,
            "oxygen_saturation": latest_vitals.oxygen_saturation if latest_vitals else 98,
            "body_temperature": latest_vitals.body_temperature if latest_vitals else 36.8,
            "blood_glucose": latest_vitals.blood_glucose if latest_vitals else 95,
            "bmi": latest_vitals.bmi if latest_vitals else 23.5,
            "recorded_at": latest_vitals.created_at.strftime("%Y-%m-%d %H:%M") if latest_vitals else "Baseline"
        },
        "allergies": [{"id": a.id, "allergen": a.allergen, "severity": a.severity, "reaction": a.reaction} for a in allergies],
        "conditions": [{"id": c.id, "condition_name": c.condition_name, "status": c.status, "diagnosed_date": c.diagnosed_date} for c in conditions],
        "upcoming_appointments_count": len(upcoming_appointments),
        "active_prescriptions_count": len(active_prescriptions),
        "reports_count": len(recent_reports),
        "latest_ai_risk": {
            "score": latest_ai_prediction.risk_score if latest_ai_prediction else 12.5,
            "category": latest_ai_prediction.risk_category if latest_ai_prediction else "Low",
            "type": latest_ai_prediction.prediction_type if latest_ai_prediction else "Cardiovascular Health",
            "explanation": latest_ai_prediction.explanation_summary if latest_ai_prediction else "Your vital markers are currently in optimal healthy range."
        }
    }
