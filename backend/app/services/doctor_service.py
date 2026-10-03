from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.models.medical_record import MedicalRecord, ClinicalNote, PatientAllergy, PatientCondition
from app.models.medical_report import MedicalReport
from app.models.prescription import Prescription
from app.models.appointment import Appointment
from app.models.ai_prediction import AIPrediction


def create_doctor_profile(
    db: Session,
    user_id: int,
    specialization: Optional[str] = None,
    qualification: Optional[str] = None,
    license_number: Optional[str] = None,
    experience_years: Optional[int] = None,
    department: Optional[str] = None,
    bio: Optional[str] = None,
    consultation_fee: Optional[int] = 500,
    availability: Optional[str] = "Mon-Fri, 9:00 AM - 5:00 PM"
) -> Optional[Doctor]:
    existing_doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if existing_doctor:
        return None

    doctor = Doctor(
        user_id=user_id,
        specialization=specialization,
        qualification=qualification,
        license_number=license_number,
        experience_years=experience_years,
        department=department,
        bio=bio,
        consultation_fee=consultation_fee,
        availability=availability
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


def get_doctor_profile(db: Session, user_id: int) -> Optional[Doctor]:
    return db.query(Doctor).filter(Doctor.user_id == user_id).first()


def get_doctor_by_id(db: Session, doctor_id: int) -> Optional[Doctor]:
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()


def update_doctor_profile(
    db: Session,
    user_id: int,
    specialization: Optional[str] = None,
    qualification: Optional[str] = None,
    license_number: Optional[str] = None,
    experience_years: Optional[int] = None,
    department: Optional[str] = None,
    bio: Optional[str] = None,
    consultation_fee: Optional[int] = None,
    availability: Optional[str] = None
) -> Optional[Doctor]:
    doctor = get_doctor_profile(db, user_id)
    if not doctor:
        return None

    if specialization is not None:
        doctor.specialization = specialization
    if qualification is not None:
        doctor.qualification = qualification
    if license_number is not None:
        doctor.license_number = license_number
    if experience_years is not None:
        doctor.experience_years = experience_years
    if department is not None:
        doctor.department = department
    if bio is not None:
        doctor.bio = bio
    if consultation_fee is not None:
        doctor.consultation_fee = consultation_fee
    if availability is not None:
        doctor.availability = availability

    db.commit()
    db.refresh(doctor)
    return doctor


def get_all_patients_summary(db: Session) -> List[Dict[str, Any]]:
    """Returns all registered patients with their latest vitals, condition tags, and AI risk."""
    patients = db.query(Patient).all()
    results = []
    
    for p in patients:
        u = db.query(User).filter(User.id == p.user_id).first()
        latest_record = db.query(MedicalRecord).filter(MedicalRecord.patient_id == p.id).order_by(MedicalRecord.created_at.desc()).first()
        latest_ai = db.query(AIPrediction).filter(AIPrediction.patient_id == p.id).order_by(AIPrediction.created_at.desc()).first()
        conditions = [c.condition_name for c in db.query(PatientCondition).filter(PatientCondition.patient_id == p.id, PatientCondition.status == "active").all()]
        allergies = [a.allergen for a in db.query(PatientAllergy).filter(PatientAllergy.patient_id == p.id).all()]
        
        results.append({
            "patient_id": p.id,
            "user_id": p.user_id,
            "full_name": u.full_name if u else f"Patient #{p.id}",
            "email": u.email if u else "",
            "gender": p.gender or "Unspecified",
            "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
            "blood_group": p.blood_group or "Unknown",
            "phone": p.phone or "N/A",
            "conditions": conditions,
            "allergies": allergies,
            "vitals": {
                "bp": f"{int(latest_record.systolic_bp)}/{int(latest_record.diastolic_bp)}" if latest_record and latest_record.systolic_bp else "120/80",
                "hr": int(latest_record.heart_rate) if latest_record and latest_record.heart_rate else 72,
                "spo2": int(latest_record.oxygen_saturation) if latest_record and latest_record.oxygen_saturation else 98,
                "temp": float(latest_record.body_temperature) if latest_record and latest_record.body_temperature else 36.8
            },
            "risk_score": latest_ai.risk_score if latest_ai else 15.0,
            "risk_category": latest_ai.risk_category if latest_ai else "Low"
        })
        
    return results


def get_patient_digital_twin(db: Session, patient_id: int) -> Optional[Dict[str, Any]]:
    """Constructs the complete 360-degree patient digital twin record."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return None
        
    user = db.query(User).filter(User.id == patient.user_id).first()
    
    # All historical components
    records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient.id).order_by(MedicalRecord.created_at.desc()).all()
    reports = db.query(MedicalReport).filter(MedicalReport.patient_id == patient.id).order_by(MedicalReport.created_at.desc()).all()
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient.id).order_by(Prescription.created_at.desc()).all()
    notes = db.query(ClinicalNote).filter(ClinicalNote.patient_id == patient.id).order_by(ClinicalNote.created_at.desc()).all()
    predictions = db.query(AIPrediction).filter(AIPrediction.patient_id == patient.id).order_by(AIPrediction.created_at.desc()).all()
    allergies = db.query(PatientAllergy).filter(PatientAllergy.patient_id == patient.id).all()
    conditions = db.query(PatientCondition).filter(PatientCondition.patient_id == patient.id).all()
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient.id).order_by(Appointment.appointment_date.desc()).all()
    
    latest_vitals = records[0] if records else None
    
    return {
        "patient_id": patient.id,
        "user_id": patient.user_id,
        "full_name": user.full_name if user else "Patient",
        "email": user.email if user else "",
        "profile": {
            "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
            "gender": patient.gender,
            "blood_group": patient.blood_group,
            "phone": patient.phone,
            "address": patient.address,
            "emergency_contact": patient.emergency_contact,
            "height": patient.height,
            "weight": patient.weight,
            "smoking_status": patient.smoking_status,
            "alcohol_intake": patient.alcohol_intake,
            "physical_activity": patient.physical_activity,
            "family_history": patient.family_history
        },
        "allergies": [{"id": a.id, "allergen": a.allergen, "severity": a.severity, "reaction": a.reaction} for a in allergies],
        "conditions": [{"id": c.id, "condition_name": c.condition_name, "status": c.status, "diagnosed_date": c.diagnosed_date, "notes": c.notes} for c in conditions],
        "vitals_history": [
            {
                "id": r.id,
                "recorded_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else None,
                "heart_rate": r.heart_rate,
                "systolic_bp": r.systolic_bp,
                "diastolic_bp": r.diastolic_bp,
                "respiratory_rate": r.respiratory_rate,
                "oxygen_saturation": r.oxygen_saturation,
                "body_temperature": r.body_temperature,
                "blood_glucose": r.blood_glucose,
                "bmi": r.bmi,
                "symptoms": r.symptoms,
                "diagnosis": r.diagnosis
            }
            for r in records
        ],
        "reports": [
            {
                "id": rep.id,
                "title": rep.title,
                "report_type": rep.report_type,
                "file_name": rep.file_name,
                "risk_level": rep.risk_level,
                "extracted_data": rep.extracted_data,
                "summary_doctor": rep.summary_doctor,
                "summary_patient": rep.summary_patient,
                "key_findings": rep.key_findings,
                "created_at": rep.created_at.strftime("%Y-%m-%d %H:%M") if rep.created_at else None
            }
            for rep in reports
        ],
        "prescriptions": [
            {
                "id": pr.id,
                "doctor_id": pr.doctor_id,
                "diagnosis": pr.diagnosis,
                "status": pr.status,
                "created_at": pr.created_at.strftime("%Y-%m-%d") if pr.created_at else None,
                "items": [
                    {
                        "id": it.id,
                        "medicine_name": it.medicine_name,
                        "dosage": it.dosage,
                        "frequency": it.frequency,
                        "duration": it.duration,
                        "timing": it.timing,
                        "instructions": it.instructions
                    }
                    for it in pr.items
                ]
            }
            for pr in prescriptions
        ],
        "clinical_notes": [
            {
                "id": n.id,
                "title": n.title,
                "category": n.category,
                "content": n.note_content,
                "created_at": n.created_at.strftime("%Y-%m-%d %H:%M") if n.created_at else None
            }
            for n in notes
        ],
        "ai_predictions": [
            {
                "id": p.id,
                "prediction_type": p.prediction_type,
                "model_name": p.model_name,
                "risk_score": p.risk_score,
                "risk_category": p.risk_category,
                "feature_contributions": p.feature_contributions,
                "explanation_summary": p.explanation_summary,
                "recommendations": p.recommendations,
                "created_at": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else None
            }
            for p in predictions
        ],
        "appointments": [
            {
                "id": apt.id,
                "date": str(apt.appointment_date),
                "time": apt.appointment_time,
                "type": apt.appointment_type,
                "status": apt.status,
                "reason": apt.reason
            }
            for apt in appointments
        ]
    }


def add_doctor_clinical_note(db: Session, doctor_id: int, patient_id: int, title: str, note_content: str, category: str = "general") -> ClinicalNote:
    note = ClinicalNote(
        doctor_id=doctor_id,
        patient_id=patient_id,
        title=title,
        note_content=note_content,
        category=category
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def get_doctor_dashboard_kpis(db: Session, user_id: int) -> Dict[str, Any]:
    doctor = get_doctor_profile(db, user_id)
    doc_id = doctor.id if doctor else 0
    
    total_patients = db.query(Patient).count()
    today = datetime.now().date()
    
    today_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doc_id,
        Appointment.appointment_date == today
    ).all() if doc_id else []
    
    recent_reports = db.query(MedicalReport).order_by(MedicalReport.created_at.desc()).limit(6).all()
    high_risk_patients = db.query(AIPrediction).filter(AIPrediction.risk_category.in_(["High", "Critical", "Very High"])).limit(5).all()
    
    return {
        "doctor_profile": {
            "id": doc_id,
            "specialization": doctor.specialization if doctor else "General Physician",
            "department": doctor.department if doctor else "Internal Medicine",
            "license": doctor.license_number if doctor else "LIC-2026-MED",
            "experience": doctor.experience_years if doctor else 8
        },
        "total_assigned_patients": total_patients,
        "today_appointments_count": len(today_appointments),
        "high_risk_alerts_count": len(high_risk_patients),
        "recent_reports_count": len(recent_reports)
    }