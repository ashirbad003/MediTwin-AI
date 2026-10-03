from pydantic import BaseModel
from typing import Optional, Any, Union
from datetime import date, datetime


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: Union[date, str, datetime]
    appointment_time: Optional[str] = "10:00 AM"
    appointment_type: Optional[str] = "consultation"
    reason: Optional[str] = None
    symptoms: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    doctor_notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    doctor_id: int
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    appointment_date: date
    appointment_time: str
    status: str
    appointment_type: str
    reason: Optional[str] = None
    symptoms: Optional[str] = None
    doctor_notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
