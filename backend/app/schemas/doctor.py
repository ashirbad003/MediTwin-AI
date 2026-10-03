from pydantic import BaseModel
from typing import Optional


class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    consultation_fee: Optional[int] = 500
    availability: Optional[str] = "Mon-Fri, 9:00 AM - 5:00 PM"


class DoctorCreate(DoctorBase):
    pass


class DoctorUpdate(DoctorBase):
    pass


class DoctorResponse(DoctorBase):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True