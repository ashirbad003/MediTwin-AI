from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    title = Column(String(200), nullable=False)
    report_type = Column(String(100), default="Blood Test")  # Blood Test, Pathology, Radiology, Cardiology, Urinalysis, General Lab
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), default="application/pdf")
    
    # Raw extracted text
    extracted_text = Column(Text, nullable=True)
    
    # Extracted structured lab values: JSON e.g. {"Hemoglobin": {"value": 11.2, "unit": "g/dL", "normal_range": "13.5-17.5", "status": "Low"}}
    extracted_data = Column(JSON, nullable=True)
    
    # AI generated summaries
    summary_patient = Column(Text, nullable=True)  # Plain language patient explanation
    summary_doctor = Column(Text, nullable=True)   # Technical clinical findings
    key_findings = Column(JSON, nullable=True)     # List of strings/highlights
    risk_level = Column(String(50), default="Normal")  # Normal, Moderate, High, Critical
    
    status = Column(String(50), default="processed")  # pending, processing, processed, error
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="reports")
    uploader = relationship("User")
