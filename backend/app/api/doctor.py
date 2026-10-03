from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.doctor import DoctorBase, DoctorResponse, DoctorUpdate
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse
from app.schemas.medical_record import ClinicalNoteCreate, ClinicalNoteResponse
from app.schemas.appointment import AppointmentUpdate, AppointmentResponse
from app.services.doctor_service import (
    create_doctor_profile,
    get_doctor_profile,
    update_doctor_profile,
    get_all_patients_summary,
    get_patient_digital_twin,
    add_doctor_clinical_note,
    get_doctor_dashboard_kpis
)
from app.services.appointment_service import get_doctor_appointments, update_appointment_status
from app.services.prescription_service import create_patient_prescription, get_doctor_prescriptions, check_drug_interactions
from app.models.patient import Patient
from app.models.medical_record import PatientAllergy
from app.utils.dependencies import require_roles

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.get("/dashboard")
def doctor_dashboard(
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    """Doctor dashboard summary and clinical statistics."""
    kpis = get_doctor_dashboard_kpis(db, current_user.id)
    return {
        "status": "success",
        "message": "Welcome to the Doctor Clinical Intelligence Dashboard.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "kpis": kpis
    }


@router.post(
    "/profile",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_doctor_profile_api(
    doctor_data: DoctorBase,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = create_doctor_profile(
        db=db,
        user_id=current_user.id,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        license_number=doctor_data.license_number,
        experience_years=doctor_data.experience_years,
        department=doctor_data.department,
        bio=doctor_data.bio,
        consultation_fee=doctor_data.consultation_fee,
        availability=doctor_data.availability
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor profile could not be created. It may already exist."
        )

    return doctor


@router.get(
    "/profile",
    response_model=DoctorResponse
)
def get_doctor_profile_api(
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = get_doctor_profile(
        db=db,
        user_id=current_user.id
    )

    if not doctor:
        # Create empty profile if not existing yet
        doctor = create_doctor_profile(db=db, user_id=current_user.id)

    return doctor


@router.patch(
    "/profile",
    response_model=DoctorResponse
)
def update_doctor_profile_api(
    doctor_data: DoctorUpdate,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = update_doctor_profile(
        db=db,
        user_id=current_user.id,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        license_number=doctor_data.license_number,
        experience_years=doctor_data.experience_years,
        department=doctor_data.department,
        bio=doctor_data.bio,
        consultation_fee=doctor_data.consultation_fee,
        availability=doctor_data.availability
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    return doctor


@router.get("/patients")
def get_patients_list_api(
    current_user: User = Depends(require_roles("doctor", "admin")),
    db: Session = Depends(get_db)
):
    """Returns list of patients with live vitals and risk stratifications."""
    patients = get_all_patients_summary(db)
    return {
        "status": "success",
        "total": len(patients),
        "patients": patients
    }


@router.get("/patients/{patient_id}")
def get_patient_digital_twin_api(
    patient_id: int,
    current_user: User = Depends(require_roles("doctor", "admin")),
    db: Session = Depends(get_db)
):
    """Returns 360-degree patient digital twin (history, vitals timeline, reports, prescriptions, notes, AI risk)."""
    twin = get_patient_digital_twin(db, patient_id)
    if not twin:
        raise HTTPException(status_code=404, detail="Patient digital twin record not found.")
    return {
        "status": "success",
        "digital_twin": twin
    }


@router.post("/patients/{patient_id}/notes")
def add_patient_clinical_note_api(
    patient_id: int,
    note_data: ClinicalNoteCreate,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = get_doctor_profile(db, current_user.id)
    if not doctor:
        doctor = create_doctor_profile(db, current_user.id)
        
    note = add_doctor_clinical_note(
        db=db,
        doctor_id=doctor.id,
        patient_id=patient_id,
        title=note_data.title,
        note_content=note_data.note_content,
        category=note_data.category or "general"
    )
    return {
        "status": "success",
        "message": "Clinical note added successfully.",
        "note_id": note.id
    }


@router.post("/prescriptions")
def create_prescription_api(
    data: PrescriptionCreate,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = get_doctor_profile(db, current_user.id)
    if not doctor:
        doctor = create_doctor_profile(db, current_user.id)
        
    # Check for allergy conflicts or drug-drug interactions before writing
    allergies = [a.allergen for a in db.query(PatientAllergy).filter(PatientAllergy.patient_id == data.patient_id).all()]
    med_names = [it.medicine_name for it in data.items]
    check = check_drug_interactions(med_names, allergies)
    
    prescription = create_patient_prescription(
        db=db,
        patient_id=data.patient_id,
        doctor_id=doctor.id,
        diagnosis=data.diagnosis,
        notes=data.notes,
        items=data.items
    )
    
    return {
        "status": "success",
        "message": "Prescription generated successfully.",
        "prescription_id": prescription.id,
        "interaction_check": check
    }


@router.get("/appointments")
def get_doctor_appointments_api(
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    doctor = get_doctor_profile(db, current_user.id)
    if not doctor:
        return {"status": "success", "appointments": []}
    return {
        "status": "success",
        "appointments": get_doctor_appointments(db, doctor.id)
    }


@router.patch("/appointments/{appointment_id}")
def update_doctor_appointment_api(
    appointment_id: int,
    data: AppointmentUpdate,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    apt = update_appointment_status(db, appointment_id, data)
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    return {
        "status": "success",
        "message": "Appointment updated successfully.",
        "appointment_id": apt.id,
        "new_status": apt.status
    }