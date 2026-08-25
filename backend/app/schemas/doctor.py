from pydantic import BaseModel, ConfigDict


class DoctorBase(BaseModel):
    specialization: str | None = None
    qualification: str | None = None
    license_number: str | None = None
    experience_years: int | None = None
    department: str | None = None


class DoctorCreate(DoctorBase):
    user_id: int


class DoctorUpdate(BaseModel):
    specialization: str | None = None
    qualification: str | None = None
    license_number: str | None = None
    experience_years: int | None = None
    department: str | None = None


class DoctorResponse(DoctorBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)