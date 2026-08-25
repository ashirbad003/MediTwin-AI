from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.user import User


def create_doctor_profile(
    db: Session,
    user_id: int,
    specialization: str | None = None,
    qualification: str | None = None,
    license_number: str | None = None,
    experience_years: int | None = None,
    department: str | None = None,
):
    """
    Create a Doctor profile for an existing Doctor user.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return None

    if user.role != "doctor":
        return None

    existing_doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == user_id)
        .first()
    )

    if existing_doctor:
        return None

    doctor = Doctor(
        user_id=user_id,
        specialization=specialization,
        qualification=qualification,
        license_number=license_number,
        experience_years=experience_years,
        department=department,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return doctor


def get_doctor_profile(
    db: Session,
    user_id: int
):
    """
    Get the Doctor profile for a specific user.
    """

    return (
        db.query(Doctor)
        .filter(Doctor.user_id == user_id)
        .first()
    )


def update_doctor_profile(
    db: Session,
    user_id: int,
    specialization: str | None = None,
    qualification: str | None = None,
    license_number: str | None = None,
    experience_years: int | None = None,
    department: str | None = None,
):
    """
    Update the Doctor profile for a specific user.
    """

    doctor = (
        db.query(Doctor)
        .filter(Doctor.user_id == user_id)
        .first()
    )

    if not doctor:
        return None

    if specialization is not None:
        doctor.specialization = specialization

    if qualification is not None:
        doctor.qualification = qualification

    if license_number is not None:
        doctor.license_number = license_number

    if experience_years is not None:
        doctor.experience_years = experience_years

    if department is not None:
        doctor.department = department

    db.commit()
    db.refresh(doctor)

    return doctor