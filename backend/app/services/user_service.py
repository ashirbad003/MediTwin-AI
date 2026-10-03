from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password


def get_all_users(db: Session):
    """
    Get all registered users.
    """
    return db.query(User).order_by(User.id.asc()).all()


def get_user_by_id(db: Session, user_id: int):
    """
    Get a single user by ID.
    """
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate):
    """
    Create a new user with hashed password.
    """
    hashed = hash_password(user_data.password)
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password=hashed,
        role=user_data.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_status(
    db: Session,
    user_id: int,
    is_active: bool
):
    """
    Update the active status of a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user