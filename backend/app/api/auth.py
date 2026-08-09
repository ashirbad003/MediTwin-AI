from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import (
    register_user,
    login_user,
    refresh_access_token,
)
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ==========================================
# Register
# ==========================================

@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    try:
        new_user = register_user(db, user)

        return {
            "status": "success",
            "message": "User registered successfully.",
            "user": {
                "id": new_user.id,
                "full_name": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ==========================================
# Login
# ==========================================

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    try:
        result = login_user(
            db,
            user.email,
            user.password
        )

        return {
            "status": "success",
            "message": "Login successful.",
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": result["token_type"],
            "user": {
                "id": result["user"].id,
                "full_name": result["user"].full_name,
                "email": result["user"].email,
                "role": result["user"].role
            }
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


# ==========================================
# Refresh Access Token
# ==========================================

@router.post("/refresh")
def refresh_token(
    refresh_token: str = Body(..., embed=True)
):
    try:
        access_token = refresh_access_token(
            refresh_token
        )

        return {
            "status": "success",
            "message": "Access token refreshed successfully.",
            "access_token": access_token,
            "token_type": "bearer"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


# ==========================================
# Current User / Protected Route
# ==========================================

@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "status": "success",
        "message": "Current user retrieved successfully.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active
        }
    }