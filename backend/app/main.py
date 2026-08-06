from fastapi import FastAPI

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