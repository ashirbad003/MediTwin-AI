from fastapi import APIRouter, Depends

from app.models.user import User
from app.utils.dependencies import require_roles


router = APIRouter(
    prefix="/admin",
    tags=["Hospital Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_roles("admin"))
):
    """
    Hospital Admin-only dashboard endpoint.
    """

    return {
        "status": "success",
        "message": "Welcome to the Hospital Admin Dashboard.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }