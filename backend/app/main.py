from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import engine

app = FastAPI(
    title="MediTwin AI",
    description="Explainable AI Framework for Intelligent Clinical Decision Support and Smart Hospital Management",
    version="1.0.0"
)


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