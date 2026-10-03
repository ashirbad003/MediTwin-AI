from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class MedicalReportResponse(BaseModel):
    id: int
    patient_id: int
    title: str
    report_type: str
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    extracted_text: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    summary_patient: Optional[str] = None
    summary_doctor: Optional[str] = None
    key_findings: Optional[List[str]] = None
    risk_level: Optional[str] = "Normal"
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LabValueItem(BaseModel):
    name: str
    value: float
    unit: str
    reference_range: str
    status: str  # Normal, High, Low, Critical
