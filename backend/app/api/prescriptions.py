from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.medical_record import PatientAllergy
from app.schemas.prescription import (
    DrugInteractionCheckRequest,
    DrugInteractionCheckResponse,
    PrescriptionCreate,
    PrescriptionResponse
)
from app.services.prescription_service import (
    check_drug_interactions,
    create_patient_prescription,
    get_patient_prescriptions,
    get_doctor_prescriptions,
    KNOWN_DRUG_INTERACTIONS
)
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescription Intelligence & Drug Interactions"]
)


@router.post("/check-interactions", response_model=DrugInteractionCheckResponse)
def check_interactions_api(
    req: DrugInteractionCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates requested medication regimen for pairwise drug-drug interactions, severity ratings,
    and patient-specific documented allergy cross-reactivities.
    """
    allergies = []
    if req.patient_id:
        allergies = [a.allergen for a in db.query(PatientAllergy).filter(PatientAllergy.patient_id == req.patient_id).all()]
        
    return check_drug_interactions(
        medication_names=req.medications,
        patient_allergies=allergies
    )


@router.get("/interactions-knowledge-base")
def get_interactions_kb_api(
    current_user: User = Depends(get_current_user)
):
    """Returns the catalog of clinically verified drug-drug interaction monographs."""
    return {
        "status": "success",
        "total_monographs": len(KNOWN_DRUG_INTERACTIONS),
        "interactions": KNOWN_DRUG_INTERACTIONS
    }
