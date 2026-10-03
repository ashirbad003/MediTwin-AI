from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import date, datetime


class PatientBase(BaseModel):
    date_of_birth: Optional[Union[date, str]] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    smoking_status: Optional[str] = "never"
    alcohol_intake: Optional[str] = "none"
    alcohol_consumption: Optional[str] = None
    physical_activity: Optional[str] = "moderate"
    physical_activity_level: Optional[str] = None
    family_history: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientAllergySchema(BaseModel):
    id: Optional[int] = None
    allergen: str
    reaction: Optional[str] = None
    severity: Optional[str] = "moderate"

    class Config:
        from_attributes = True


class PatientConditionSchema(BaseModel):
    id: Optional[int] = None
    condition_name: str
    diagnosed_date: Optional[str] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class PatientResponse(PatientBase):
    id: int
    user_id: int
    full_name: Optional[str] = None
    email: Optional[str] = None
    allergies: Optional[List[PatientAllergySchema]] = []
    conditions: Optional[List[PatientConditionSchema]] = []

    class Config:
        from_attributes = True
