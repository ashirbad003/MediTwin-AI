from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    
    # Model Metadata
    model_name = Column(String(100), nullable=False)          # e.g., "Cardiovascular_Risk_XGBoost", "Diabetes_Risk_RF", "NEWS2_Early_Warning", "Readmission_Predictor"
    model_version = Column(String(50), default="1.0.0")
    prediction_type = Column(String(100), nullable=False)     # cardiovascular, diabetes, kidney_disease, news2, readmission
    
    # Scores & Probabilities
    risk_score = Column(Float, nullable=False)               # Percentage or numeric score (e.g. 72.5% or NEWS2 score 6)
    risk_category = Column(String(50), nullable=False)        # Low, Moderate, High, Critical
    confidence_interval = Column(String(50), nullable=True)   # e.g., "68% - 77%"
    
    # Explainability Data
    input_features = Column(JSON, nullable=True)              # Dictionary of features fed to model
    feature_contributions = Column(JSON, nullable=True)       # e.g. [{"feature": "Systolic BP", "value": 150, "contribution": +0.28, "impact": "High Risk Driver"}]
    explanation_summary = Column(Text, nullable=True)         # Human-readable clinical explanation
    recommendations = Column(JSON, nullable=True)             # List of clinical action recommendations
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="ai_predictions")
    doctor = relationship("Doctor")
