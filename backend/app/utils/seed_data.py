"""
Synthetic Healthcare Seed Data Generator for MediTwin-AI
Creates realistic, safe synthetic demonstration data for Doctors, Patients,
Vitals, Reports, Prescriptions, Appointments, Beds, Inventory, and AI Predictions.
"""

from datetime import datetime, date, timedelta
from app.database.database import SessionLocal, engine
from app.database.base import Base
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord, ClinicalNote, PatientAllergy, PatientCondition
from app.models.medical_report import MedicalReport
from app.models.prescription import Prescription, PrescriptionItem, Medication, DrugInteraction
from app.models.appointment import Appointment
from app.models.ai_prediction import AIPrediction
from app.models.hospital import Department, HospitalBed, IcuUnit, InventoryItem, Notification, AuditLog
from app.services.prescription_service import KNOWN_DRUG_INTERACTIONS
from app.utils.security import hash_password


def seed_database():
    db = SessionLocal()
    print("--- Seeding MediTwin-AI Synthetic Healthcare Database ---")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # 1. Departments
    departments_data = [
        {"name": "Cardiology & Vascular Medicine", "code": "CARD", "description": "Cardiac diagnostics, echocardiography, cardiovascular interventions.", "head_of_department": "Dr. Rajesh Sharma", "total_staff": 18},
        {"name": "Endocrinology & Diabetology", "code": "ENDO", "description": "Metabolic disorders, glycemic management, thyroid disorders.", "head_of_department": "Dr. Ananya Roy", "total_staff": 12},
        {"name": "Nephrology & Renal Sciences", "code": "NEPH", "description": "CKD management, renal biopsy, hemodialysis unit.", "head_of_department": "Dr. Vikram Sethi", "total_staff": 14},
        {"name": "Intensive Care & Critical Care (ICU)", "code": "ICU", "description": "Level 3 critical care, mechanical ventilation, multi-organ support.", "head_of_department": "Dr. Sarah Johnson", "total_staff": 25},
        {"name": "Internal & General Medicine", "code": "GENM", "description": "Acute and chronic adult medical care, diagnostic evaluation.", "head_of_department": "Dr. Kabir Das", "total_staff": 22},
        {"name": "Pulmonology & Respiratory Medicine", "code": "PULM", "description": "Asthma, COPD, pulmonary function testing, respiratory therapy.", "head_of_department": "Dr. Neha Kapoor", "total_staff": 10}
    ]
    
    for d in departments_data:
        if not db.query(Department).filter(Department.code == d["code"]).first():
            db.add(Department(**d))
    db.commit()
    print("[OK] Departments seeded.")
    
    # 2. Drug Interactions Knowledge Base
    for rule in KNOWN_DRUG_INTERACTIONS:
        if not db.query(DrugInteraction).filter(
            DrugInteraction.drug_a == rule["drug_a"],
            DrugInteraction.drug_b == rule["drug_b"]
        ).first():
            db.add(DrugInteraction(
                drug_a=rule["drug_a"],
                drug_b=rule["drug_b"],
                severity=rule["severity"],
                interaction_effect=rule["interaction_effect"],
                clinical_mechanism=rule.get("clinical_mechanism"),
                action_required=rule.get("action_required")
            ))
    db.commit()
    print("[OK] Drug interactions knowledge base seeded.")
    
    # 3. Users & Doctors
    users_data = [
        # Standard Demo Accounts
        {"full_name": "Dr. Sarah Adams, MD", "email": "doctor@example.com", "password": "password", "role": "doctor",
         "specialization": "Cardiology & Internal Medicine", "qualification": "MBBS, MD (Cardiology)", "license_number": "MED-DEMO-001", "experience_years": 12, "department": "Cardiology & Vascular Medicine", "bio": "Consultant Cardiologist and Chief Clinical Investigator.", "consultation_fee": 600},
        {"full_name": "John Doe", "email": "patient@example.com", "password": "password", "role": "patient",
         "dob": date(1972, 8, 20), "gender": "Male", "blood_group": "O+", "phone": "+1-555-0100", "address": "100 Medical Center Way", "emergency_contact": "Jane Doe: +1-555-0101", "height": 176, "weight": 78.0, "smoking": "former", "alcohol": "moderate", "activity": "moderate", "family_history": "Parental history of CAD and Stage 1 Hypertension."},
        {"full_name": "Hospital Super Administrator", "email": "admin@example.com", "password": "password", "role": "admin"},
        
        # Clinical Specialist Cohort Accounts
        {"full_name": "Hospital Administrator", "email": "admin@meditwin.ai", "password": "Password123!", "role": "admin"},
        {"full_name": "Dr. Rajesh Sharma, MD", "email": "doctor.sharma@meditwin.ai", "password": "Password123!", "role": "doctor",
         "specialization": "Interventional Cardiology", "qualification": "MBBS, MD (Medicine), DM (Cardiology)", "license_number": "MED-CARD-9921", "experience_years": 14, "department": "Cardiology & Vascular Medicine", "bio": "Senior Consultant Cardiologist specializing in preventive cardiology and hypertension.", "consultation_fee": 800},
        {"full_name": "Dr. Ananya Roy, MD", "email": "doctor.roy@meditwin.ai", "password": "Password123!", "role": "doctor",
         "specialization": "Endocrinology & Diabetology", "qualification": "MBBS, MD, DNB (Endocrinology)", "license_number": "MED-ENDO-8412", "experience_years": 10, "department": "Endocrinology & Diabetology", "bio": "Specialist in Type 2 Diabetes, metabolic syndrome, and lipidology.", "consultation_fee": 700},
        {"full_name": "Dr. Vikram Sethi, MD", "email": "doctor.sethi@meditwin.ai", "password": "Password123!", "role": "doctor",
         "specialization": "Nephrology & Renal Medicine", "qualification": "MBBS, MD, DM (Nephrology)", "license_number": "MED-NEPH-6320", "experience_years": 12, "department": "Nephrology & Renal Sciences", "bio": "Expert in early diabetic kidney disease detection and hypertension.", "consultation_fee": 750},
        {"full_name": "Johnathan Miller", "email": "john.miller@example.com", "password": "Password123!", "role": "patient",
         "dob": date(1968, 5, 14), "gender": "Male", "blood_group": "A+", "phone": "+1-555-0192", "address": "742 Evergreen Terrace, Springfield", "emergency_contact": "Sarah Miller (Wife): +1-555-0193", "height": 178, "weight": 86.5, "smoking": "former", "alcohol": "moderate", "activity": "sedentary", "family_history": "Father had myocardial infarction at age 58; Mother has T2D."},
        {"full_name": "Eleanor Vance", "email": "eleanor.vance@example.com", "password": "Password123!", "role": "patient",
         "dob": date(1975, 11, 28), "gender": "Female", "blood_group": "O+", "phone": "+1-555-0248", "address": "120 Oakridge Boulevard, Brookline", "emergency_contact": "David Vance (Brother): +1-555-0249", "height": 165, "weight": 68.0, "smoking": "never", "alcohol": "none", "activity": "active", "family_history": "Maternal grandmother had hypertension."},
        {"full_name": "Robert Chen", "email": "robert.chen@example.com", "password": "Password123!", "role": "patient",
         "dob": date(1982, 3, 9), "gender": "Male", "blood_group": "B+", "phone": "+1-555-0371", "address": "45 Beacon Hill Road, Boston", "emergency_contact": "Linda Chen (Sister): +1-555-0372", "height": 172, "weight": 74.0, "smoking": "never", "alcohol": "moderate", "activity": "moderate", "family_history": "No known cardiovascular or renal heredity."}
    ]
    
    created_users = {}
    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_u = User(
                full_name=u["full_name"],
                email=u["email"],
                password=hash_password(u["password"]),
                role=u["role"],
                is_active=True
            )
            db.add(new_u)
            db.flush()
            created_users[u["email"]] = new_u
        else:
            existing.password = hash_password(u["password"])
            existing.is_active = True
            db.flush()
            created_users[u["email"]] = existing
            
    db.commit()
    print("[OK] Base users verified.")
    
    # 4. Doctor Profiles
    for u in users_data:
        if u["role"] == "doctor":
            user_obj = created_users[u["email"]]
            if not db.query(Doctor).filter(Doctor.user_id == user_obj.id).first():
                doc = Doctor(
                    user_id=user_obj.id,
                    specialization=u["specialization"],
                    qualification=u["qualification"],
                    license_number=u["license_number"],
                    experience_years=u["experience_years"],
                    department=u["department"],
                    bio=u["bio"],
                    consultation_fee=u["consultation_fee"]
                )
                db.add(doc)
    db.commit()
    print("[OK] Doctor profiles verified.")
    
    # 5. Patient Profiles, Allergies & Conditions
    for u in users_data:
        if u["role"] == "patient":
            user_obj = created_users[u["email"]]
            pat = db.query(Patient).filter(Patient.user_id == user_obj.id).first()
            if not pat:
                pat = Patient(
                    user_id=user_obj.id,
                    date_of_birth=u["dob"],
                    gender=u["gender"],
                    blood_group=u["blood_group"],
                    phone=u["phone"],
                    address=u["address"],
                    emergency_contact=u["emergency_contact"],
                    height=u["height"],
                    weight=u["weight"],
                    smoking_status=u["smoking"],
                    alcohol_intake=u["alcohol"],
                    physical_activity=u["activity"],
                    family_history=u["family_history"]
                )
                db.add(pat)
                db.flush()
                
            # Add specific clinical profiles
            if u["email"] == "john.miller@example.com":
                if not db.query(PatientCondition).filter(PatientCondition.patient_id == pat.id).first():
                    db.add(PatientCondition(patient_id=pat.id, condition_name="Essential Hypertension (Stage 2)", diagnosed_date="2022-04-10", status="active", notes="Under monotherapy with Lisinopril."))
                    db.add(PatientCondition(patient_id=pat.id, condition_name="Type 2 Diabetes Mellitus", diagnosed_date="2023-01-15", status="active", notes="HbA1c 7.4% at last checkup."))
                    db.add(PatientCondition(patient_id=pat.id, condition_name="Mixed Hyperlipidemia", diagnosed_date="2023-08-20", status="active", notes="Elevated LDL-C (148 mg/dL)."))
                if not db.query(PatientAllergy).filter(PatientAllergy.patient_id == pat.id).first():
                    db.add(PatientAllergy(patient_id=pat.id, allergen="Penicillin", reaction="Generalized urticaria and facial angioedema", severity="severe"))
                    db.add(PatientAllergy(patient_id=pat.id, allergen="Sulfa Drugs", reaction="Maculopapular rash", severity="moderate"))
                    
            elif u["email"] == "eleanor.vance@example.com":
                if not db.query(PatientCondition).filter(PatientCondition.patient_id == pat.id).first():
                    db.add(PatientCondition(patient_id=pat.id, condition_name="Primary Hypothyroidism", diagnosed_date="2021-09-05", status="active", notes="Euthyroid on Levothyroxine 75 mcg daily."))
                if not db.query(PatientAllergy).filter(PatientAllergy.patient_id == pat.id).first():
                    db.add(PatientAllergy(patient_id=pat.id, allergen="NSAIDs (Aspirin/Ibuprofen)", reaction="Bronchospasm and wheezing", severity="severe"))
                    
    db.commit()
    print("[OK] Patient profiles, allergies, and conditions verified.")
    
    # 6. Medical Records (Vitals History)
    john = db.query(Patient).join(User).filter(User.email == "john.miller@example.com").first()
    doc_sharma = db.query(Doctor).join(User).filter(User.email == "doctor.sharma@meditwin.ai").first()
    
    if john and not db.query(MedicalRecord).filter(MedicalRecord.patient_id == john.id).first():
        vitals_series = [
            {"days_ago": 60, "hr": 78, "sbp": 146, "dbp": 92, "rr": 16, "spo2": 97, "temp": 36.7, "glucose": 138, "bmi": 27.8, "notes": "Initial consultation. Complaining of occasional morning headaches."},
            {"days_ago": 30, "hr": 74, "sbp": 140, "dbp": 88, "rr": 16, "spo2": 98, "temp": 36.6, "glucose": 128, "bmi": 27.5, "notes": "Follow-up visit. Lifestyle modification and dietary salt reduction advised."},
            {"days_ago": 2,  "hr": 72, "sbp": 134, "dbp": 84, "rr": 15, "spo2": 98, "temp": 36.8, "glucose": 118, "bmi": 27.3, "notes": "Recent routine check. Blood pressure demonstrating positive downward trajectory."}
        ]
        for v in vitals_series:
            db.add(MedicalRecord(
                patient_id=john.id,
                doctor_id=doc_sharma.id if doc_sharma else None,
                heart_rate=v["hr"],
                systolic_bp=v["sbp"],
                diastolic_bp=v["dbp"],
                respiratory_rate=v["rr"],
                oxygen_saturation=v["spo2"],
                body_temperature=v["temp"],
                blood_glucose=v["glucose"],
                bmi=v["bmi"],
                notes=v["notes"],
                created_at=datetime.now() - timedelta(days=v["days_ago"])
            ))
            
    db.commit()
    print("[OK] Vitals timeline seeded.")
    
    # 7. Sample Medical Reports
    if john and not db.query(MedicalReport).filter(MedicalReport.patient_id == john.id).first():
        sample_lab_data = {
            "Hemoglobin": {"value": 14.2, "unit": "g/dL", "reference_range": "13.5 - 17.5", "status": "Normal", "category": "Hematology"},
            "Fasting Blood Glucose": {"value": 126.0, "unit": "mg/dL", "reference_range": "70 - 99", "status": "High", "category": "Endocrinology"},
            "HbA1c": {"value": 7.1, "unit": "%", "reference_range": "4.0 - 5.6", "status": "High", "category": "Endocrinology"},
            "Serum Creatinine": {"value": 1.1, "unit": "mg/dL", "reference_range": "0.7 - 1.3", "status": "Normal", "category": "Nephrology"},
            "Total Cholesterol": {"value": 224.0, "unit": "mg/dL", "reference_range": "120 - 199", "status": "High", "category": "Cardiology"},
            "LDL Cholesterol": {"value": 142.0, "unit": "mg/dL", "reference_range": "50 - 99", "status": "High", "category": "Cardiology"},
            "HDL Cholesterol": {"value": 44.0, "unit": "mg/dL", "reference_range": "40 - 60", "status": "Normal", "category": "Cardiology"},
            "Triglycerides": {"value": 190.0, "unit": "mg/dL", "reference_range": "50 - 149", "status": "High", "category": "Cardiology"}
        }
        db.add(MedicalReport(
            patient_id=john.id,
            uploaded_by_id=created_users["john.miller@example.com"].id,
            title="Comprehensive Metabolic & Lipid Panel",
            report_type="Blood Test",
            file_name="Lab_Report_Comprehensive_JohnMiller.pdf",
            file_path="uploads/Lab_Report_Comprehensive_JohnMiller.pdf",
            file_size=245800,
            extracted_text="CLINICAL LABORATORY REPORT\nPatient: Johnathan Miller\nFasting Glucose: 126 mg/dL\nHbA1c: 7.1%\nTotal Cholesterol: 224 mg/dL\nLDL: 142 mg/dL\nTriglycerides: 190 mg/dL",
            extracted_data=sample_lab_data,
            summary_patient="Your recent blood report shows your kidney function and blood count are in great shape. Your blood sugar (HbA1c 7.1%) and cholesterol levels are moderately above target, which we can help optimize with simple adjustments to diet and medication.",
            summary_doctor="CLINICAL SUMMARY: Fasting blood glucose (126 mg/dL) and HbA1c (7.1%) indicate moderate glycemic dysregulation. Lipid fractionation demonstrates elevated LDL-C (142 mg/dL) and hypertriglyceridemia (190 mg/dL). Renal markers (Creatinine 1.1 mg/dL) remain preserved. Statin optimization and glycemic review recommended.",
            key_findings=["HbA1c: 7.1% (High)", "Fasting Glucose: 126 mg/dL (High)", "LDL Cholesterol: 142 mg/dL (High)", "Triglycerides: 190 mg/dL (High)"],
            risk_level="Attention Required",
            status="Attention Required",
            created_at=datetime.now() - timedelta(days=5)
        ))
    db.commit()
    print("[OK] Sample reports seeded.")
    
    # 8. Prescriptions
    if john and doc_sharma and not db.query(Prescription).filter(Prescription.patient_id == john.id).first():
        presc = Prescription(
            patient_id=john.id,
            doctor_id=doc_sharma.id,
            diagnosis="Essential Hypertension & Dyslipidemia",
            notes="Take Lisinopril in the morning. Take Atorvastatin at bedtime. Avoid concurrent NSAID analgesics.",
            status="active",
            created_at=datetime.now() - timedelta(days=12)
        )
        db.add(presc)
        db.flush()
        
        db.add(PrescriptionItem(prescription_id=presc.id, medicine_name="Lisinopril", generic_name="Lisinopril", dosage="10 mg", frequency="Once daily (1-0-0)", duration="90 days", timing="Morning after breakfast", instructions="Monitor home blood pressure."))
        db.add(PrescriptionItem(prescription_id=presc.id, medicine_name="Atorvastatin", generic_name="Atorvastatin Calcium", dosage="20 mg", frequency="Once daily (0-0-1)", duration="90 days", timing="At bedtime", instructions="Take regularly at night."))
        db.add(PrescriptionItem(prescription_id=presc.id, medicine_name="Metformin HCl", generic_name="Metformin Extended Release", dosage="500 mg", frequency="Twice daily (1-0-1)", duration="90 days", timing="With meals", instructions="Take with breakfast and dinner."))
        
    db.commit()
    print("[OK] Prescriptions seeded.")
    
    # 9. Appointments
    if john and doc_sharma and not db.query(Appointment).filter(Appointment.patient_id == john.id).first():
        db.add(Appointment(
            patient_id=john.id,
            doctor_id=doc_sharma.id,
            appointment_date=date.today() + timedelta(days=2),
            appointment_time="10:30 AM",
            appointment_type="consultation",
            reason="Cardiovascular risk follow-up & lipid panel review",
            symptoms="Occasional fatigue after vigorous exertion",
            status="scheduled"
        ))
        db.add(Appointment(
            patient_id=john.id,
            doctor_id=doc_sharma.id,
            appointment_date=date.today() - timedelta(days=30),
            appointment_time="11:00 AM",
            appointment_type="consultation",
            reason="Blood pressure management checkup",
            doctor_notes="Patient compliant with Lisinopril. BP 140/88 mmHg.",
            status="completed"
        ))
    db.commit()
    print("[OK] Appointments seeded.")
    
    # 10. Hospital Beds
    if db.query(HospitalBed).count() == 0:
        wards = [
            ("General Ward A", "General", 1, 12),
            ("General Ward B", "General", 2, 12),
            ("Medical ICU", "ICU", 3, 6),
            ("Coronary Care Unit (CCU)", "CCU", 3, 6),
            ("Emergency Observation", "Emergency", 1, 8)
        ]
        bed_count = 1
        for ward_name, ward_type, floor, count in wards:
            for i in range(1, count + 1):
                prefix = ward_type[:3].upper()
                bed_num = f"{prefix}-{floor}0{i:02d}"
                status = "occupied" if i <= int(count * 0.7) else "available"
                assigned_pat = john.id if (bed_count == 1 and john) else None
                
                db.add(HospitalBed(
                    bed_number=bed_num,
                    ward_name=ward_name,
                    ward_type=ward_type,
                    floor=floor,
                    status=status,
                    patient_id=assigned_pat,
                    admission_date=datetime.now() - timedelta(days=3) if status == "occupied" else None,
                    notes=f"Standard hospital electric bed in {ward_name}"
                ))
                bed_count += 1
    db.commit()
    print("[OK] Hospital beds seeded.")
    
    # 11. ICU Units
    if db.query(IcuUnit).count() == 0:
        icu_data = [
            {"unit_code": "MICU-01", "unit_type": "Medical ICU", "bed_count": 10, "occupied_count": 7, "ventilators_available": 4, "ventilators_in_use": 3, "status": "operational"},
            {"unit_code": "CICU-01", "unit_type": "Cardiac Intensive Care", "bed_count": 8, "occupied_count": 6, "ventilators_available": 3, "ventilators_in_use": 2, "status": "operational"},
            {"unit_code": "SICU-01", "unit_type": "Surgical ICU", "bed_count": 8, "occupied_count": 5, "ventilators_available": 3, "ventilators_in_use": 1, "status": "operational"},
            {"unit_code": "NICU-01", "unit_type": "Neonatal ICU", "bed_count": 6, "occupied_count": 4, "ventilators_available": 2, "ventilators_in_use": 2, "status": "high_demand"}
        ]
        for ic in icu_data:
            db.add(IcuUnit(**ic))
    db.commit()
    print("[OK] ICU units seeded.")
    
    # 12. Medicine & Supply Inventory
    if db.query(InventoryItem).count() == 0:
        inv_data = [
            {"item_code": "MED-001", "item_name": "Lisinopril 10mg Tablets", "category": "Medication", "unit": "Tablets", "current_stock": 1400, "minimum_threshold": 300, "reorder_quantity": 1000, "unit_cost": 0.45, "status": "adequate", "supplier": "PharmaMed Global"},
            {"item_code": "MED-002", "item_name": "Atorvastatin 20mg Tablets", "category": "Medication", "unit": "Tablets", "current_stock": 950, "minimum_threshold": 250, "reorder_quantity": 800, "unit_cost": 0.65, "status": "adequate", "supplier": "PharmaMed Global"},
            {"item_code": "MED-003", "item_name": "Metformin ER 500mg", "category": "Medication", "unit": "Tablets", "current_stock": 2200, "minimum_threshold": 400, "reorder_quantity": 1500, "unit_cost": 0.25, "status": "adequate", "supplier": "AstraCare Labs"},
            {"item_code": "MED-004", "item_name": "Ceftriaxone 1g Injectable Vials", "category": "Medication", "unit": "Vials", "current_stock": 42, "minimum_threshold": 100, "reorder_quantity": 300, "unit_cost": 6.80, "status": "low_stock", "supplier": "BioInno Pharmaceuticals"},
            {"item_code": "MED-005", "item_name": "Insulin Glargine 100 IU/mL Pens", "category": "Medication", "unit": "Pens", "current_stock": 28, "minimum_threshold": 60, "reorder_quantity": 150, "unit_cost": 24.50, "status": "low_stock", "supplier": "Nordisk Healthcare"},
            {"item_code": "MED-006", "item_name": "Spironolactone 25mg Tablets", "category": "Medication", "unit": "Tablets", "current_stock": 800, "minimum_threshold": 150, "reorder_quantity": 500, "unit_cost": 0.35, "status": "adequate", "supplier": "PharmaMed Global"},
            {"item_code": "MED-007", "item_name": "Warfarin 5mg Tablets", "category": "Medication", "unit": "Tablets", "current_stock": 650, "minimum_threshold": 150, "reorder_quantity": 400, "unit_cost": 0.30, "status": "adequate", "supplier": "AstraCare Labs"},
            {"item_code": "SUP-001", "item_name": "High-Flow Nasal Cannula Kits", "category": "Equipment", "unit": "Kits", "current_stock": 14, "minimum_threshold": 25, "reorder_quantity": 50, "unit_cost": 32.00, "status": "critical", "supplier": "RespiraTech Corp"},
            {"item_code": "SUP-002", "item_name": "Sterile Surgical Gloves (Size 7.5)", "category": "Consumable", "unit": "Boxes", "current_stock": 450, "minimum_threshold": 100, "reorder_quantity": 300, "unit_cost": 12.00, "status": "adequate", "supplier": "MedSupply Direct"}
        ]
        for it in inv_data:
            db.add(InventoryItem(**it))
    db.commit()
    print("[OK] Medicine and supplies inventory seeded.")
    
    # 13. Audit Logs
    if db.query(AuditLog).count() == 0:
        db.add(AuditLog(action="SYSTEM_INITIALIZE", user_email="admin@meditwin.ai", user_role="admin", resource_type="System", details={"status": "MediTwin-AI Platform operational"}, ip_address="127.0.0.1"))
        db.add(AuditLog(action="PREDICTION_EVALUATE", user_email="doctor.sharma@meditwin.ai", user_role="doctor", resource_type="AI_Model", details={"model": "Cardiovascular_Risk_GradientBoosting", "patient": "Johnathan Miller"}, ip_address="127.0.0.1"))
    db.commit()
    print("[OK] System audit logs seeded.")
    
    db.close()
    print("==================================================================")
    print(" MediTwin-AI Synthetic Healthcare Database Seeded Successfully! ")
    print("==================================================================")


if __name__ == "__main__":
    seed_database()
