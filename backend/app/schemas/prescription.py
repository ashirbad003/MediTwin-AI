from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    generic_name: Optional[str] = None
    dosage: str
    frequency: str
    duration: str
    timing: Optional[str] = "After meals"
    instructions: Optional[str] = None


class PrescriptionItemResponse(PrescriptionItemCreate):
    id: int
    prescription_id: int
    is_active: bool

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    patient_id: int
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    items: List[PrescriptionItemCreate]


class PrescriptionResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    items: List[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True


class DrugInteractionCheckRequest(BaseModel):
    medications: List[str]
    patient_id: Optional[int] = None


class DrugInteractionItem(BaseModel):
    drug_a: str
    drug_b: str
    severity: str  # Major, Moderate, Minor
    interaction_effect: str
    clinical_mechanism: Optional[str] = None
    action_required: Optional[str] = None


class DrugInteractionCheckResponse(BaseModel):
    has_interactions: bool
    total_interactions: int
    max_severity: Optional[str] = None
    interactions: List[DrugInteractionItem] = []
    allergy_warnings: List[str] = []
