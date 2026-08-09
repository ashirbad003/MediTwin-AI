from fastapi import FastAPI
from sqlalchemy import text

from app.database.base import Base
from app.database.database import engine
from app.api.auth import router as auth_router
from app.api.doctor import router as doctor_router
from app.api.patient import router as patient_router
from app.api.admin import router as admin_router

# Create all database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="MediTwin AI",
    description="Explainable AI Framework for Intelligent Clinical Decision Support and Smart Hospital Management",
    version="1.0.0"
)


# Register Authentication Routes
app.include_router(auth_router)

# Register Doctor Routes
app.include_router(doctor_router)

# Register Patient Routes
app.include_router(patient_router)

# Register Admin Routes
app.include_router(admin_router)

@app.get("/")
def home():
    return {
        "project": "MediTwin AI",
        "message": "Backend is running successfully 🚀",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "Connected ✅",
            "project": "MediTwin AI",
            "message": "Database connection is working successfully."
        }

    except Exception as e:
        return {
            "status": "failed",
            "database": "Disconnected ❌",
            "error": str(e)
        }