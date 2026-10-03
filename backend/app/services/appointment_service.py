from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, datetime

from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def create_appointment(
    db: Session,
    patient_id: int,
    data: AppointmentCreate
) -> Appointment:
    apt_date = data.appointment_date
    apt_time = data.appointment_time or "10:00 AM"
    
    if isinstance(apt_date, str):
        if "T" in apt_date:
            parts = apt_date.split("T")
            apt_date_str = parts[0]
            if len(parts) > 1 and ":" in parts[1] and (not data.appointment_time or data.appointment_time == "10:00 AM"):
                time_part = parts[1].split(".")[0].split("Z")[0]
                apt_time = time_part[:5]
            try:
                apt_date = datetime.strptime(apt_date_str, "%Y-%m-%d").date()
            except Exception:
                pass
        else:
            try:
                apt_date = datetime.strptime(apt_date, "%Y-%m-%d").date()
            except Exception:
                pass
    elif isinstance(apt_date, datetime):
        apt_date = apt_date.date()

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        appointment_date=apt_date,
        appointment_time=apt_time,
        appointment_type=data.appointment_type or "consultation",
        reason=data.reason,
        symptoms=data.symptoms,
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def get_patient_appointments(db: Session, patient_id: int) -> List[Dict[str, Any]]:
    apts = db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(Appointment.appointment_date.desc()).all()
    results = []
    for a in apts:
        doc = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        doc_user = db.query(User).filter(User.id == doc.user_id).first() if doc else None
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "doctor_name": doc_user.full_name if doc_user else "Doctor",
            "doctor_specialization": doc.specialization if doc else "General Medicine",
            "appointment_date": str(a.appointment_date) if a.appointment_date else "",
            "appointment_time": a.appointment_time or "10:00 AM",
            "status": a.status,
            "appointment_type": a.appointment_type,
            "reason": a.reason,
            "symptoms": a.symptoms,
            "doctor_notes": a.doctor_notes,
            "created_at": a.created_at
        })
    return results


def get_doctor_appointments(db: Session, doctor_id: int) -> List[Dict[str, Any]]:
    apts = db.query(Appointment).filter(Appointment.doctor_id == doctor_id).order_by(Appointment.appointment_date.asc()).all()
    results = []
    for a in apts:
        pat = db.query(Patient).filter(Patient.id == a.patient_id).first()
        pat_user = db.query(User).filter(User.id == pat.user_id).first() if pat else None
        results.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": pat_user.full_name if pat_user else f"Patient #{a.patient_id}",
            "doctor_id": a.doctor_id,
            "appointment_date": str(a.appointment_date) if a.appointment_date else "",
            "appointment_time": a.appointment_time or "10:00 AM",
            "status": a.status,
            "appointment_type": a.appointment_type,
            "reason": a.reason,
            "symptoms": a.symptoms,
            "doctor_notes": a.doctor_notes,
            "created_at": a.created_at
        })
    return results


def update_appointment_status(
    db: Session,
    appointment_id: int,
    data: AppointmentUpdate
) -> Optional[Appointment]:
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        return None
        
    if data.status:
        apt.status = data.status
    if data.appointment_date:
        apt.appointment_date = data.appointment_date
    if data.appointment_time:
        apt.appointment_time = data.appointment_time
    if data.doctor_notes is not None:
        apt.doctor_notes = data.doctor_notes
        
    db.commit()
    db.refresh(apt)
    return apt


def cancel_appointment(db: Session, appointment_id: int, patient_id: int) -> Optional[Appointment]:
    apt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient_id
    ).first()
    if not apt:
        return None
    apt.status = "cancelled"
    db.commit()
    db.refresh(apt)
    return apt
