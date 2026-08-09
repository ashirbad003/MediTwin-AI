from fastapi import APIRouter, Depends

from app.models.user import User
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