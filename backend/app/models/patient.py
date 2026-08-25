from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    date_of_birth = Column(Date, nullable=True)

    gender = Column(String(20), nullable=True)

    blood_group = Column(String(10), nullable=True)

    phone = Column(String(20), nullable=True)

    address = Column(String(255), nullable=True)

    emergency_contact = Column(String(100), nullable=True)

    user = relationship("User")