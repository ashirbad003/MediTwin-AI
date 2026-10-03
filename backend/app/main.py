from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.base import Base
from app.database.database import engine

# Import all models to ensure metadata registration
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.medical_record import MedicalRecord, ClinicalNote, PatientAllergy, PatientCondition
from app.models.medical_report import MedicalReport
from app.models.prescription import Prescription, PrescriptionItem, Medication, DrugInteraction
from app.models.appointment import Appointment
from app.models.ai_prediction import AIPrediction
from app.models.hospital import Department, HospitalBed, IcuUnit, InventoryItem, Notification, AuditLog

# Import API Routers
from app.api.auth import router as auth_router
from app.api.doctor import router as doctor_router
from app.api.patient import router as patient_router
from app.api.admin import router as admin_router
from app.api.ai import router as ai_router
from app.api.rag import router as rag_router
from app.api.prescriptions import router as prescriptions_router
from app.api.reports import router as reports_router


# ==========================================
# FastAPI Application & Startup Lifespan
# ==========================================

app = FastAPI(
    title="MediTwin-AI",
    description="AI-Powered Explainable Multimodal Healthcare & Hospital Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.on_event("startup")
def on_startup():
    """Automatically ensure database tables and idempotent seed data are initialized."""
    try:
        Base.metadata.create_all(bind=engine)
        from app.utils.seed_data import seed_database
        seed_database()
        print("[MediTwin-AI] Startup initialization & synthetic seed verification complete.")
    except Exception as e:
        print(f"[MediTwin-AI] Warning during startup initialization: {e}")


# ==========================================
# CORS Configuration
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Register Routers
# ==========================================

app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(patient_router)
app.include_router(admin_router)
app.include_router(ai_router)
app.include_router(rag_router)
app.include_router(prescriptions_router)
app.include_router(reports_router)


# ==========================================
# Health Check & Root
# ==========================================

@app.get("/")
def home():
    return {
        "project": "MediTwin-AI",
        "title": "AI-Powered Explainable Multimodal Healthcare & Hospital Intelligence Platform",
        "status": "operational",
        "version": "1.0.0",
        "modules": [
            "Patient Digital Twin",
            "Doctor Clinical Decision Support",
            "Hospital Administration Intelligence",
            "Explainable AI Disease Risk & Early Warning (NEWS2)",
            "Medical Knowledge RAG Engine",
            "Prescription Intelligence & Drug-Drug Interaction Checker",
            "Medical Document Intelligence & Lab Value Extraction"
        ]
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "Connected",
            "project": "MediTwin-AI",
            "message": "Database connection and backend services are operational."
        }

    except Exception as e:
        return {
            "status": "failed",
            "database": "Disconnected",
            "error": str(e)
        }