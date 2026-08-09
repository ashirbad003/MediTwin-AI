from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserStatusUpdate
from app.services.user_service import (
    get_all_users,
    get_user_by_id,
    update_user_status,
)
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


@router.get("/users")
def list_users(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Get all registered users.
    Only Hospital Admin can access this endpoint.
    """

    users = get_all_users(db)

    return {
        "status": "success",
        "message": "Users retrieved successfully.",
        "count": len(users),
        "users": [
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]
    }


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Get a single user by ID.
    Only Hospital Admin can access this endpoint.
    """

    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "status": "success",
        "message": "User retrieved successfully.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    }


@router.patch("/users/{user_id}/status")
def update_user_status_api(
    user_id: int,
    status_data: UserStatusUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Activate or deactivate a user.
    Only Hospital Admin can access this endpoint.
    """

    user = update_user_status(
        db,
        user_id,
        status_data.is_active
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    return {
        "status": "success",
        "message": "User status updated successfully.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }