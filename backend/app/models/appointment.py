from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    
    appointment_date = Column(Date, nullable=False, index=True)
    appointment_time = Column(String(20), nullable=False)   # e.g., "10:30 AM", "14:00"
    status = Column(String(50), default="scheduled")        # scheduled, confirmed, in_progress, completed, cancelled, no_show
    appointment_type = Column(String(50), default="consultation") # consultation, follow_up, emergency, telemedicine, checkup
    
    reason = Column(String(255), nullable=True)
    symptoms = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
