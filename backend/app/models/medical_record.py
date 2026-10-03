from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    
    # Clinical Vitals
    heart_rate = Column(Float, nullable=True)          # bpm
    systolic_bp = Column(Float, nullable=True)         # mmHg
    diastolic_bp = Column(Float, nullable=True)        # mmHg
    respiratory_rate = Column(Float, nullable=True)    # breaths/min
    oxygen_saturation = Column(Float, nullable=True)   # % (SpO2)
    body_temperature = Column(Float, nullable=True)    # Celsius
    blood_glucose = Column(Float, nullable=True)       # mg/dL
    bmi = Column(Float, nullable=True)
    
    # Clinical notes & observations
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    record_type = Column(String(50), default="routine_checkup")  # routine_checkup, emergency, follow_up
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    
    title = Column(String(200), nullable=False)
    note_content = Column(Text, nullable=False)
    category = Column(String(50), default="general")  # general, progress, surgical, discharge, consultation
    is_confidential = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="clinical_notes")
    doctor = relationship("Doctor", back_populates="clinical_notes")


class PatientAllergy(Base):
    __tablename__ = "patient_allergies"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    allergen = Column(String(150), nullable=False)
    reaction = Column(String(255), nullable=True)
    severity = Column(String(50), default="moderate")  # mild, moderate, severe, life-threatening
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="allergies")


class PatientCondition(Base):
    __tablename__ = "patient_conditions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    condition_name = Column(String(200), nullable=False)
    diagnosed_date = Column(String(50), nullable=True)
    status = Column(String(50), default="active")  # active, in_remission, resolved
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="conditions")
