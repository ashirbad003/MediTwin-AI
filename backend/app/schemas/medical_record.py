from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MedicalRecordCreate(BaseModel):
    patient_id: int
    heart_rate: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    respiratory_rate: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    body_temperature: Optional[float] = None
    blood_glucose: Optional[float] = None
    bmi: Optional[float] = None
    symptoms: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    record_type: Optional[str] = "routine_checkup"


class MedicalRecordResponse(MedicalRecordCreate):
    id: int
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClinicalNoteCreate(BaseModel):
    patient_id: int
    title: str
    note_content: str
    category: Optional[str] = "general"


class ClinicalNoteResponse(ClinicalNoteCreate):
    id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
