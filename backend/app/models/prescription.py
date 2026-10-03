from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    
    diagnosis = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # active, completed, cancelled
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False, index=True)
    
    medicine_name = Column(String(200), nullable=False)
    generic_name = Column(String(200), nullable=True)
    dosage = Column(String(100), nullable=False)          # e.g., 500mg, 10ml
    frequency = Column(String(100), nullable=False)       # e.g., Once daily, Twice daily (1-0-1), 3 times a day
    duration = Column(String(100), nullable=False)        # e.g., 7 days, 1 month, Ongoing
    timing = Column(String(100), default="After meals")   # Before meals, After meals, At bedtime
    instructions = Column(Text, nullable=True)            # Special instructions
    is_active = Column(Boolean, default=True)

    prescription = relationship("Prescription", back_populates="items")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True, nullable=False)
    generic_name = Column(String(200), index=True, nullable=True)
    drug_class = Column(String(150), nullable=True)
    standard_dosage = Column(String(100), nullable=True)
    indications = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    side_effects = Column(Text, nullable=True)
    black_box_warning = Column(Text, nullable=True)


class DrugInteraction(Base):
    __tablename__ = "drug_interactions"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String(150), nullable=False, index=True)
    drug_b = Column(String(150), nullable=False, index=True)
    severity = Column(String(50), nullable=False)  # Major, Moderate, Minor
    interaction_effect = Column(Text, nullable=False)
    clinical_mechanism = Column(Text, nullable=True)
    action_required = Column(Text, nullable=True)
