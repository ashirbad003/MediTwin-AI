from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    specialization = Column(String(100), nullable=True)
    qualification = Column(String(255), nullable=True)
    license_number = Column(String(100), unique=True, nullable=True)
    experience_years = Column(Integer, nullable=True)
    department = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    consultation_fee = Column(Integer, default=500)
    availability = Column(String(255), default="Mon-Fri, 9:00 AM - 5:00 PM")

    user = relationship("User", back_populates="doctor_profile")
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    clinical_notes = relationship("ClinicalNote", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")