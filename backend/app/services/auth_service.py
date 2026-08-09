from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password, verify_password
from app.utils.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
)


def register_user(db: Session, user: UserCreate):
    """
    Register a new user.
    """

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise ValueError("Email already registered.")

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    """
    Authenticate a user using email and password.
    """

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    if not user.is_active:
        return None

    return user


def login_user(
    db: Session,
    email: str,
    password: str
):
    """
    Authenticate user and generate access and refresh tokens.
    """

    user = authenticate_user(
        db,
        email,
        password
    )

    if not user:
        raise ValueError("Invalid email or password.")

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def refresh_access_token(refresh_token: str):
    """
    Create a new access token using a valid refresh token.
    """

    payload = decode_token(refresh_token)

    if not payload:
        raise ValueError("Invalid or expired refresh token.")

    if payload.get("token_type") != "refresh":
        raise ValueError("Invalid refresh token.")

    user_id = payload.get("sub")
    email = payload.get("email")
    role = payload.get("role")

    if not user_id or not email or not role:
        raise ValueError("Invalid refresh token payload.")

    access_token = create_access_token(
        {
            "sub": user_id,
            "email": email,
            "role": role
        }
    )

    return access_token