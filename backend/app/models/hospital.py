from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    head_of_department = Column(String(100), nullable=True)
    total_staff = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HospitalBed(Base):
    __tablename__ = "hospital_beds"

    id = Column(Integer, primary_key=True, index=True)
    bed_number = Column(String(50), unique=True, nullable=False, index=True)
    ward_type = Column(String(50), nullable=False)  # General, ICU, CCU, Emergency, Pediatric, Maternity
    ward_name = Column(String(100), nullable=False)
    floor = Column(Integer, default=1)
    status = Column(String(50), default="available")  # available, occupied, maintenance, cleaning, reserved
    
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    admission_date = Column(DateTime(timezone=True), nullable=True)
    expected_discharge = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("Patient")


class IcuUnit(Base):
    __tablename__ = "icu_units"

    id = Column(Integer, primary_key=True, index=True)
    unit_code = Column(String(50), unique=True, nullable=False)
    unit_type = Column(String(50), default="Medical ICU")  # Medical ICU, Surgical ICU, Cardiac ICU, Neuro ICU, Neonatal ICU
    bed_count = Column(Integer, default=10)
    occupied_count = Column(Integer, default=0)
    ventilators_available = Column(Integer, default=5)
    ventilators_in_use = Column(Integer, default=0)
    status = Column(String(50), default="operational")  # operational, high_demand, critical_capacity
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(50), unique=True, nullable=False, index=True)
    item_name = Column(String(200), nullable=False)
    category = Column(String(100), default="Medication")  # Medication, Consumable, Equipment, Surgical, Diagnostic
    unit = Column(String(50), default="Units")            # Tablets, Vials, Boxes, Kits, Bottles
    
    current_stock = Column(Integer, nullable=False, default=0)
    minimum_threshold = Column(Integer, nullable=False, default=50)
    reorder_quantity = Column(Integer, nullable=False, default=200)
    unit_cost = Column(Float, default=0.0)
    
    batch_number = Column(String(100), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    supplier = Column(String(150), nullable=True)
    status = Column(String(50), default="adequate")  # adequate, low_stock, critical, out_of_stock
    
    last_restocked = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, alert, appointment, prescription, risk_warning
    is_read = Column(Boolean, default=False)
    action_link = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)           # LOGIN, PRESCRIBE, ML_PREDICTION, REPORT_UPLOAD, USER_STATUS_CHANGE, RAG_QUERY
    resource_type = Column(String(100), nullable=True)     # Patient, Prescription, Report, AI_Model, User
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
