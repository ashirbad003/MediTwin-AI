import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.models.medical_report import MedicalReport
from app.schemas.medical_report import MedicalReportResponse
from app.models.patient import Patient
from app.services.report_service import process_medical_report, delete_medical_report
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/reports",
    tags=["Medical Document Intelligence"]
)


def _normalize_report_status(r: MedicalReport) -> str:
    """Calculates canonical report status from extracted biomarkers or persisted classification."""
    if r.extracted_data and isinstance(r.extracted_data, dict):
        items = list(r.extracted_data.values())
        has_critical = any("critical" in str(it.get("status", "")).lower() for it in items if isinstance(it, dict))
        has_abnormal = any(
            str(it.get("status", "")).lower() in ["high", "low", "abnormal", "critical high", "critical low"]
            or "high" in str(it.get("status", "")).lower()
            or "low" in str(it.get("status", "")).lower()
            for it in items if isinstance(it, dict)
        )
        if has_critical or "critical" in str(r.risk_level or "").lower() or "critical" in str(r.status or "").lower():
            return "Critical"
        if has_abnormal or "attention" in str(r.risk_level or "").lower() or "moderate" in str(r.risk_level or "").lower() or "mild" in str(r.risk_level or "").lower():
            return "Attention Required"
        return "Normal"
        
    if r.risk_level in ["Attention Required", "Critical", "Normal"]:
        return r.risk_level
    if r.status in ["Attention Required", "Critical", "Normal"]:
        return r.status
    if r.risk_level in ["Moderate", "High", "Mild Attention"]:
        return "Attention Required"
    return "Normal"


@router.get("/my-reports")
def get_my_reports_api(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MedicalReport)
    if current_user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            return []
        query = query.filter(MedicalReport.patient_id == patient.id)
        
    reports = query.order_by(MedicalReport.created_at.desc()).all()
    results = []
    for r in reports:
        canonical_status = _normalize_report_status(r)
        results.append({
            "id": r.id,
            "patient_id": r.patient_id,
            "title": r.title,
            "report_type": r.report_type,
            "file_name": r.file_name,
            "risk_level": canonical_status,
            "extracted_text": r.extracted_text,
            "extracted_data": r.extracted_data,
            "summary_patient": r.summary_patient,
            "summary_doctor": r.summary_doctor,
            "key_findings": r.key_findings,
            "status": canonical_status,
            "created_at": r.created_at
        })
    return results


@router.post("/upload")
async def upload_report_api(
    file: UploadFile = File(...),
    report_type: str = Form("Blood Test"),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_id = None
    if current_user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient:
            patient = Patient(user_id=current_user.id)
            db.add(patient)
            db.commit()
            db.refresh(patient)
        patient_id = patient.id
    else:
        # Doctor/admin upload for first patient or default
        first_pat = db.query(Patient).first()
        patient_id = first_pat.id if first_pat else 1

    file_bytes = await file.read()
    report_title = title or f"{report_type} Analysis ({file.filename})"
    
    report = process_medical_report(
        db=db,
        patient_id=patient_id,
        uploaded_by_id=current_user.id,
        title=report_title,
        report_type=report_type,
        file_bytes=file_bytes,
        original_filename=file.filename
    )
    
    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "file_name": report.file_name,
        "risk_level": report.risk_level,
        "extracted_data": report.extracted_data,
        "summary_patient": report.summary_patient,
        "summary_doctor": report.summary_doctor,
        "key_findings": report.key_findings,
        "status": report.status,
        "created_at": report.created_at
    }


@router.delete("/{report_id}")
def delete_report_api(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_medical_report(db, report_id, current_user.id, current_user.role)
    if not success:
        raise HTTPException(status_code=404, detail="Medical report not found or unauthorized.")
    return {"status": "success", "message": "Report deleted successfully."}


@router.get("/{report_id}")
def get_report_by_id_api(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found.")
        
    return {
        "status": "success",
        "report": {
            "id": report.id,
            "patient_id": report.patient_id,
            "title": report.title,
            "report_type": report.report_type,
            "file_name": report.file_name,
            "risk_level": report.risk_level,
            "extracted_text": report.extracted_text,
            "extracted_data": report.extracted_data,
            "summary_patient": report.summary_patient,
            "summary_doctor": report.summary_doctor,
            "key_findings": report.key_findings,
            "created_at": report.created_at
        }
    }


@router.get("/{report_id}/download")
def download_report_file_api(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk.")
        
    return FileResponse(
        path=report.file_path,
        filename=report.file_name,
        media_type=report.mime_type
    )
