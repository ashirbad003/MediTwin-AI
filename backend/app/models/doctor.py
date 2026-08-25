from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    specialization = Column(String(100), nullable=True)

    qualification = Column(String(255), nullable=True)

    license_number = Column(String(100), unique=True, nullable=True)

    experience_years = Column(Integer, nullable=True)

    department = Column(String(100), nullable=True)

    user = relationship("User")