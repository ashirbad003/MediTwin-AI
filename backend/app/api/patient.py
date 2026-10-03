from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.patient import PatientResponse, PatientUpdate, PatientAllergySchema, PatientConditionSchema
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordResponse
from app.schemas.prescription import PrescriptionResponse
from app.schemas.medical_report import MedicalReportResponse
from app.services.patient_service import (
    get_patient_by_user_id,
    create_or_update_patient_profile,
    add_patient_allergy,
    delete_patient_allergy,
    add_patient_condition,
    delete_patient_condition,
    add_medical_record,
    get_patient_dashboard_data,
    get_available_doctors
)
from app.services.appointment_service import create_appointment, get_patient_appointments, cancel_appointment
from app.services.prescription_service import get_patient_prescriptions
from app.services.report_service import process_medical_report
from app.models.medical_report import MedicalReport
from app.utils.dependencies import require_roles, get_current_user

router = APIRouter(
    prefix="/patient",
    tags=["Patient"]
)


@router.get("/dashboard")
def patient_dashboard(
    current_user: User = Depends(require_roles("patient", "admin")),
    db: Session = Depends(get_db)
):
    """
    Returns complete personalized patient dashboard data with latest vitals, upcoming appointments,
    active medications, and AI health twin risk alerts.
    """
    return {
        "status": "success",
        "data": get_patient_dashboard_data(db, current_user.id)
    }


@router.get("/profile")
def get_patient_profile_api(
    current_user: User = Depends(require_roles("patient", "doctor", "admin")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        patient = create_or_update_patient_profile(db, current_user.id, PatientUpdate())
        
    return {
        "status": "success",
        "patient": {
            "id": patient.id,
            "user_id": patient.user_id,
            "full_name": current_user.full_name,
            "email": current_user.email,
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
            "family_history": patient.family_history,
            "allergies": [{"id": a.id, "allergen": a.allergen, "severity": a.severity, "reaction": a.reaction} for a in patient.allergies],
            "conditions": [{"id": c.id, "condition_name": c.condition_name, "status": c.status, "diagnosed_date": c.diagnosed_date} for c in patient.conditions]
        }
    }


@router.put("/profile")
@router.patch("/profile")
def update_patient_profile_api(
    data: PatientUpdate,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = create_or_update_patient_profile(db, current_user.id, data)
    return {
        "status": "success",
        "message": "Patient profile updated successfully.",
        "patient_id": patient.id,
        "patient": {
            "id": patient.id,
            "user_id": patient.user_id,
            "full_name": current_user.full_name,
            "email": current_user.email,
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
            "family_history": patient.family_history,
            "allergies": [{"id": a.id, "allergen": a.allergen, "severity": a.severity, "reaction": a.reaction} for a in patient.allergies],
            "conditions": [{"id": c.id, "condition_name": c.condition_name, "status": c.status, "diagnosed_date": c.diagnosed_date} for c in patient.conditions]
        }
    }


@router.post("/allergies")
def add_allergy_api(
    allergy: PatientAllergySchema,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    res = add_patient_allergy(db, patient.id, allergy.allergen, allergy.reaction, allergy.severity)
    return {"status": "success", "message": "Allergy added successfully.", "id": res.id}


@router.delete("/allergies/{allergy_id}")
def delete_allergy_api(
    allergy_id: int,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    success = delete_patient_allergy(db, patient.id, allergy_id)
    if not success:
        raise HTTPException(status_code=404, detail="Allergy record not found.")
    return {"status": "success", "message": "Allergy removed from medical record."}


@router.post("/conditions")
def add_condition_api(
    condition: PatientConditionSchema,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    res = add_patient_condition(db, patient.id, condition.condition_name, condition.diagnosed_date, condition.status, condition.notes)
    return {"status": "success", "message": "Condition added successfully.", "id": res.id}


@router.delete("/conditions/{condition_id}")
def delete_condition_api(
    condition_id: int,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    success = delete_patient_condition(db, patient.id, condition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Condition record not found.")
    return {"status": "success", "message": "Condition removed from medical record."}


@router.post("/vitals")
def record_vitals_api(
    vitals: MedicalRecordCreate,
    current_user: User = Depends(require_roles("patient", "doctor")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id) if current_user.role == "patient" else db.query(Patient).filter(Patient.id == vitals.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
        
    record = add_medical_record(
        db,
        patient_id=patient.id,
        doctor_id=None if current_user.role == "patient" else current_user.id,
        heart_rate=vitals.heart_rate,
        systolic_bp=vitals.systolic_bp,
        diastolic_bp=vitals.diastolic_bp,
        respiratory_rate=vitals.respiratory_rate,
        oxygen_saturation=vitals.oxygen_saturation,
        body_temperature=vitals.body_temperature,
        blood_glucose=vitals.blood_glucose,
        bmi=vitals.bmi,
        symptoms=vitals.symptoms,
        diagnosis=vitals.diagnosis,
        notes=vitals.notes
    )
    return {"status": "success", "message": "Vitals recorded successfully.", "record_id": record.id}


@router.get("/doctors")
def get_doctors_for_patient_api(
    current_user: User = Depends(require_roles("patient", "doctor", "admin")),
    db: Session = Depends(get_db)
):
    return {
        "status": "success",
        "doctors": get_available_doctors(db)
    }


@router.get("/appointments")
def get_appointments_api(
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        return {"status": "success", "appointments": []}
    return {
        "status": "success",
        "appointments": get_patient_appointments(db, patient.id)
    }


@router.post("/appointments")
def book_appointment_api(
    data: AppointmentCreate,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        patient = create_or_update_patient_profile(db, current_user.id, PatientUpdate())
        
    appointment = create_appointment(db, patient.id, data)
    return {
        "status": "success",
        "message": "Appointment scheduled successfully.",
        "appointment_id": appointment.id
    }


@router.put("/appointments/{appointment_id}/cancel")
@router.patch("/appointments/{appointment_id}/cancel")
def cancel_patient_appointment_api(
    appointment_id: int,
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    apt = cancel_appointment(db, appointment_id, patient.id)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found or not owned by patient.")
    return {"status": "success", "message": "Appointment cancelled successfully.", "appointment_id": apt.id}


@router.get("/prescriptions")
def get_prescriptions_api(
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        return {"status": "success", "prescriptions": []}
        
    prescriptions = get_patient_prescriptions(db, patient.id)
    results = []
    for pr in prescriptions:
        doc = pr.doctor
        doc_user = doc.user if doc else None
        results.append({
            "id": pr.id,
            "doctor_id": pr.doctor_id,
            "doctor_name": doc_user.full_name if doc_user else "Doctor",
            "diagnosis": pr.diagnosis,
            "notes": pr.notes,
            "status": pr.status,
            "created_at": pr.created_at,
            "items": [
                {
                    "id": it.id,
                    "medicine_name": it.medicine_name,
                    "dosage": it.dosage,
                    "frequency": it.frequency,
                    "duration": it.duration,
                    "timing": it.timing,
                    "instructions": it.instructions,
                    "is_active": it.is_active
                }
                for it in pr.items
            ]
        })
    return {"status": "success", "prescriptions": results}


@router.get("/reports")
def get_reports_api(
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        return {"status": "success", "reports": []}
        
    reports = db.query(MedicalReport).filter(MedicalReport.patient_id == patient.id).order_by(MedicalReport.created_at.desc()).all()
    results = []
    for r in reports:
        canonical_status = "Normal"
        if r.extracted_data and isinstance(r.extracted_data, dict):
            items = list(r.extracted_data.values())
            has_crit = any("critical" in str(it.get("status", "")).lower() for it in items if isinstance(it, dict))
            has_abn = any(
                str(it.get("status", "")).lower() in ["high", "low", "abnormal", "critical high", "critical low"]
                or "high" in str(it.get("status", "")).lower()
                or "low" in str(it.get("status", "")).lower()
                for it in items if isinstance(it, dict)
            )
            if has_crit or "critical" in str(r.risk_level or "").lower() or "critical" in str(r.status or "").lower():
                canonical_status = "Critical"
            elif has_abn or "attention" in str(r.risk_level or "").lower() or "moderate" in str(r.risk_level or "").lower() or "mild" in str(r.risk_level or "").lower():
                canonical_status = "Attention Required"
            else:
                canonical_status = "Normal"
        elif r.risk_level in ["Attention Required", "Critical", "Normal"]:
            canonical_status = r.risk_level
        elif r.status in ["Attention Required", "Critical", "Normal"]:
            canonical_status = r.status
        elif r.risk_level in ["Moderate", "High", "Mild Attention"]:
            canonical_status = "Attention Required"

        results.append({
            "id": r.id,
            "title": r.title,
            "report_type": r.report_type,
            "file_name": r.file_name,
            "risk_level": canonical_status,
            "extracted_data": r.extracted_data,
            "summary_patient": r.summary_patient,
            "summary_doctor": r.summary_doctor,
            "key_findings": r.key_findings,
            "status": canonical_status,
            "created_at": r.created_at
        })
    return {"status": "success", "reports": results}


@router.post("/reports/upload")
async def upload_patient_report_api(
    title: str = Form(...),
    report_type: str = Form("Blood Test"),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles("patient")),
    db: Session = Depends(get_db)
):
    patient = get_patient_by_user_id(db, current_user.id)
    if not patient:
        patient = create_or_update_patient_profile(db, current_user.id, PatientUpdate())
        
    file_bytes = await file.read()
    report = process_medical_report(
        db=db,
        patient_id=patient.id,
        uploaded_by_id=current_user.id,
        title=title,
        report_type=report_type,
        file_bytes=file_bytes,
        original_filename=file.filename
    )
    
    return {
        "status": "success",
        "message": "Medical report uploaded and parsed by AI document engine successfully.",
        "report": {
            "id": report.id,
            "title": report.title,
            "risk_level": report.risk_level,
            "summary_patient": report.summary_patient,
            "summary_doctor": report.summary_doctor,
            "key_findings": report.key_findings,
            "extracted_data": report.extracted_data
        }
    }