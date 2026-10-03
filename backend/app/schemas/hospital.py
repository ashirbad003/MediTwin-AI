from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    head_of_department: Optional[str] = None
    total_staff: int

    class Config:
        from_attributes = True


class BedResponse(BaseModel):
    id: int
    bed_number: str
    ward_type: str
    ward_name: str
    floor: int
    status: str
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    admission_date: Optional[datetime] = None
    expected_discharge: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class BedUpdate(BaseModel):
    status: Optional[str] = None
    patient_id: Optional[int] = None
    notes: Optional[str] = None


class IcuResponse(BaseModel):
    id: int
    unit_code: str
    unit_type: str
    bed_count: int
    occupied_count: int
    ventilators_available: int
    ventilators_in_use: int
    status: str

    class Config:
        from_attributes = True


class InventoryItemResponse(BaseModel):
    id: int
    item_code: str
    item_name: str
    category: str
    unit: str
    current_stock: int
    minimum_threshold: int
    reorder_quantity: int
    unit_cost: float
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class InventoryCreate(BaseModel):
    item_code: Optional[str] = None
    item_name: str
    category: Optional[str] = "Medication"
    unit: Optional[str] = "Units"
    current_stock: Optional[int] = None
    quantity: Optional[int] = None
    minimum_threshold: Optional[int] = None
    reorder_threshold: Optional[int] = None
    reorder_quantity: Optional[int] = 200
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None


class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[int] = None
    quantity: Optional[int] = None
    minimum_threshold: Optional[int] = None
    reorder_threshold: Optional[int] = None
    reorder_quantity: Optional[int] = None
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None


class IcuUpdate(BaseModel):
    status: Optional[str] = None
    patient_id: Optional[int] = None
    occupied_count: Optional[int] = None
    ventilator_assigned: Optional[bool] = None
    ventilators_in_use: Optional[int] = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HospitalOverviewResponse(BaseModel):
    total_patients: int
    active_doctors: int
    total_departments: int
    total_beds: int
    occupied_beds: int
    available_beds: int
    bed_occupancy_rate: float
    total_icu_beds: int
    occupied_icu_beds: int
    icu_occupancy_rate: float
    pending_appointments: int
    low_stock_alerts_count: int
    critical_alerts_count: int
