from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.doctor import DoctorBase, DoctorResponse, DoctorUpdate
from app.services.doctor_service import (
    create_doctor_profile,
    get_doctor_profile,
    update_doctor_profile,
)
from app.utils.dependencies import require_roles


router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.get("/dashboard")
def doctor_dashboard(
    current_user: User = Depends(require_roles("doctor"))
):
    """
    Doctor-only dashboard endpoint.
    """

    return {
        "status": "success",
        "message": "Welcome to the Doctor Dashboard.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


@router.post(
    "/profile",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_doctor_profile_api(
    doctor_data: DoctorBase,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    """
    Create a Doctor profile for the currently authenticated Doctor.
    """

    doctor = create_doctor_profile(
        db=db,
        user_id=current_user.id,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        license_number=doctor_data.license_number,
        experience_years=doctor_data.experience_years,
        department=doctor_data.department,
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor profile could not be created. It may already exist."
        )

    return doctor


@router.get(
    "/profile",
    response_model=DoctorResponse
)
def get_doctor_profile_api(
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    """
    Get the profile of the currently authenticated Doctor.
    """

    doctor = get_doctor_profile(
        db=db,
        user_id=current_user.id
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    return doctor


@router.patch(
    "/profile",
    response_model=DoctorResponse
)
def update_doctor_profile_api(
    doctor_data: DoctorUpdate,
    current_user: User = Depends(require_roles("doctor")),
    db: Session = Depends(get_db)
):
    """
    Update the profile of the currently authenticated Doctor.
    """

    doctor = update_doctor_profile(
        db=db,
        user_id=current_user.id,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        license_number=doctor_data.license_number,
        experience_years=doctor_data.experience_years,
        department=doctor_data.department,
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found."
        )

    return doctor