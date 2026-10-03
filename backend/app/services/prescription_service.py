from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.prescription import Prescription, PrescriptionItem, DrugInteraction, Medication
from app.models.patient import Patient
from app.models.medical_record import PatientAllergy
from app.schemas.prescription import PrescriptionCreate, PrescriptionItemCreate

# Comprehensive Curated Clinical Drug-Drug Interaction Knowledge Base
KNOWN_DRUG_INTERACTIONS = [
    {
        "drug_a": "Warfarin",
        "drug_b": "Aspirin",
        "severity": "Major",
        "interaction_effect": "Significantly increases gastrointestinal bleeding and systemic hemorrhage risk.",
        "clinical_mechanism": "Additive anticoagulant and antiplatelet synergy; impairment of primary and secondary hemostasis.",
        "action_required": "Avoid concurrent combination unless strictly indicated for prosthetic heart valve; monitor INR closely."
    },
    {
        "drug_a": "Lisinopril",
        "drug_b": "Spironolactone",
        "severity": "Major",
        "interaction_effect": "High risk of life-threatening severe hyperkalemia and cardiac arrhythmias.",
        "clinical_mechanism": "Dual blockade of aldosterone and renin-angiotensin-aldosterone pathway leading to potassium retention.",
        "action_required": "Measure serum potassium and renal function at baseline, day 7, and monthly thereafter."
    },
    {
        "drug_a": "Metformin",
        "drug_b": "Iodinated Radiocontrast",
        "severity": "Major",
        "interaction_effect": "Increased risk of contrast-induced nephropathy leading to severe lactic acidosis.",
        "clinical_mechanism": "Acute contrast-induced renal impairment reduces renal clearance of metformin.",
        "action_required": "Withhold metformin 48 hours prior to iodinated contrast procedures and resume 48 hours post-procedure after confirming stable eGFR."
    },
    {
        "drug_a": "Atorvastatin",
        "drug_b": "Clarithromycin",
        "severity": "Major",
        "interaction_effect": "Marked increase in statin plasma concentrations; high risk of rhabdomyolysis and myopathy.",
        "clinical_mechanism": "Potent CYP3A4 inhibition by clarithromycin blocks hepatic first-pass metabolism of atorvastatin.",
        "action_required": "Temporarily suspend atorvastatin during the course of macrolide antibiotic therapy."
    },
    {
        "drug_a": "Ciprofloxacin",
        "drug_b": "Theophylline",
        "severity": "Major",
        "interaction_effect": "Theophylline toxicity, nausea, vomiting, palpitations, and potential seizures.",
        "clinical_mechanism": "Ciprofloxacin inhibits hepatic CYP1A2, drastically reducing theophylline clearance.",
        "action_required": "Reduce theophylline dosage by 30-50% and monitor serum theophylline levels."
    },
    {
        "drug_a": "Amlodipine",
        "drug_b": "Simvastatin",
        "severity": "Moderate",
        "interaction_effect": "Elevated simvastatin exposure and increased risk of myotoxicity.",
        "clinical_mechanism": "CYP3A4 competition and mild inhibition.",
        "action_required": "Cap simvastatin dose at maximum 20mg daily when co-prescribed with amlodipine."
    },
    {
        "drug_a": "Ibuprofen",
        "drug_b": "Lisinopril",
        "severity": "Moderate",
        "interaction_effect": "Reduced antihypertensive efficacy and elevated risk of acute renal deterioration.",
        "clinical_mechanism": "NSAIDs inhibit renal vasodilatory prostaglandins, decreasing glomerular filtration rate.",
        "action_required": "Limit NSAID duration; monitor blood pressure and serum creatinine."
    },
    {
        "drug_a": "Omeprazole",
        "drug_b": "Clopidogrel",
        "severity": "Moderate",
        "interaction_effect": "Attenuated antiplatelet effect of clopidogrel and increased risk of ischemic events.",
        "clinical_mechanism": "Omeprazole competitive inhibition of CYP2C19 prevents activation of clopidogrel prodrug.",
        "action_required": "Substitute omeprazole with pantoprazole (minimal CYP2C19 inhibition)."
    },
    {
        "drug_a": "Levothyroxine",
        "drug_b": "Calcium Carbonate",
        "severity": "Moderate",
        "interaction_effect": "Decreased gastrointestinal absorption of thyroid hormone causing sub-therapeutic response.",
        "clinical_mechanism": "Chelation and physical binding of levothyroxine in acidic stomach environment.",
        "action_required": "Separate administration times by at least 4 hours."
    },
    {
        "drug_a": "Fluoxetine",
        "drug_b": "Tramadol",
        "severity": "Major",
        "interaction_effect": "High risk of Serotonin Syndrome and increased seizure susceptibility.",
        "clinical_mechanism": "Additive serotonergic enhancement and CYP2D6 inhibition.",
        "action_required": "Avoid concurrent use; select non-serotonergic analgesic."
    }
]

# Common Allergy Cross-Reactivity Groups
ALLERGY_CROSS_MAP = {
    "penicillin": ["amoxicillin", "ampicillin", "augmentin", "piperacillin", "penicillin v"],
    "sulfa": ["sulfamethoxazole", "bactrim", "co-trimoxazole", "sulfasalazine"],
    "nsaid": ["aspirin", "ibuprofen", "naproxen", "diclofenac", "ketorolac", "celecoxib"],
    "cephalosporin": ["cephalexin", "ceftriaxone", "cefuroxime", "cefixime"],
    "aspirin": ["aspirin", "ibuprofen", "naproxen", "diclofenac"]
}


def check_drug_interactions(
    medication_names: List[str],
    patient_allergies: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Analyzes pairwise combinations of requested medications for known clinical interactions,
    severity levels, and patient allergy cross-reactivities.
    """
    detected_interactions = []
    allergy_warnings = []
    meds_clean = [m.strip().lower() for m in medication_names if m.strip()]
    
    # Check pairwise interactions
    for i in range(len(meds_clean)):
        for j in range(i + 1, len(meds_clean)):
            med1 = meds_clean[i]
            med2 = meds_clean[j]
            
            for rule in KNOWN_DRUG_INTERACTIONS:
                rule_a = rule["drug_a"].lower()
                rule_b = rule["drug_b"].lower()
                
                if (rule_a in med1 and rule_b in med2) or (rule_b in med1 and rule_a in med2):
                    detected_interactions.append({
                        "drug_a": rule["drug_a"],
                        "drug_b": rule["drug_b"],
                        "severity": rule["severity"],
                        "interaction_effect": rule["interaction_effect"],
                        "clinical_mechanism": rule.get("clinical_mechanism", ""),
                        "action_required": rule.get("action_required", "")
                    })
                    
    # Check patient allergy warnings
    if patient_allergies:
        for allergy in patient_allergies:
            allergy_clean = allergy.strip().lower()
            
            for group, drug_list in ALLERGY_CROSS_MAP.items():
                if group in allergy_clean:
                    for med in meds_clean:
                        if any(d in med for d in drug_list) or group in med:
                            allergy_warnings.append(
                                f"ALLERGY ALERT: Patient has documented allergy to '{allergy}'. Prescribed drug '{med.capitalize()}' is in the cross-reactive {group.upper()} drug family!"
                            )
                            
    # Determine max severity
    max_severity = None
    if any(item["severity"] == "Major" for item in detected_interactions) or allergy_warnings:
        max_severity = "Major"
    elif any(item["severity"] == "Moderate" for item in detected_interactions):
        max_severity = "Moderate"
    elif detected_interactions:
        max_severity = "Minor"
        
    return {
        "has_interactions": len(detected_interactions) > 0 or len(allergy_warnings) > 0,
        "total_interactions": len(detected_interactions),
        "max_severity": max_severity,
        "interactions": detected_interactions,
        "allergy_warnings": allergy_warnings
    }


def create_patient_prescription(
    db: Session,
    patient_id: int,
    doctor_id: int,
    diagnosis: str,
    notes: str,
    items: List[PrescriptionItemCreate]
) -> Prescription:
    """Creates a prescription and adds its items."""
    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        diagnosis=diagnosis,
        notes=notes,
        status="active"
    )
    db.add(prescription)
    db.flush()
    
    for it in items:
        item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_name=it.medicine_name,
            generic_name=it.generic_name,
            dosage=it.dosage,
            frequency=it.frequency,
            duration=it.duration,
            timing=it.timing,
            instructions=it.instructions,
            is_active=True
        )
        db.add(item)
        
    db.commit()
    db.refresh(prescription)
    return prescription


def get_patient_prescriptions(db: Session, patient_id: int) -> List[Prescription]:
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(Prescription.created_at.desc()).all()


def get_doctor_prescriptions(db: Session, doctor_id: int) -> List[Prescription]:
    return db.query(Prescription).filter(Prescription.doctor_id == doctor_id).order_by(Prescription.created_at.desc()).all()
