from sqlalchemy import Column, Date, ForeignKey, Integer, String, Float, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    
    # Additional baseline health metrics
    height = Column(Float, nullable=True)          # in cm
    weight = Column(Float, nullable=True)          # in kg
    smoking_status = Column(String(50), nullable=True)  # never, former, current
    alcohol_intake = Column(String(50), nullable=True)  # none, moderate, heavy
    physical_activity = Column(String(50), nullable=True) # sedentary, moderate, active
    family_history = Column(Text, nullable=True)

    user = relationship("User", back_populates="patient_profile")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
    clinical_notes = relationship("ClinicalNote", back_populates="patient", cascade="all, delete-orphan")
    allergies = relationship("PatientAllergy", back_populates="patient", cascade="all, delete-orphan")
    conditions = relationship("PatientCondition", back_populates="patient", cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", back_populates="patient", cascade="all, delete-orphan")