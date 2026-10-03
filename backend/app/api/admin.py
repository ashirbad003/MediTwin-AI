from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate, UserStatusUpdate
from app.schemas.hospital import (
    BedResponse, BedUpdate, IcuResponse, IcuUpdate,
    InventoryItemResponse, InventoryCreate, InventoryUpdate,
    DepartmentResponse, AuditLogResponse, HospitalOverviewResponse
)
from app.services.user_service import (
    get_all_users,
    create_user,
    update_user_status
)
from app.services.admin_service import (
    get_hospital_overview_stats,
    get_all_beds,
    update_bed_status,
    get_all_icu_units,
    update_icu_unit,
    get_inventory_items,
    create_inventory_item,
    update_inventory_stock,
    get_all_departments,
    get_forecasting_data,
    get_audit_logs,
    create_audit_log
)
from app.utils.dependencies import require_roles

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    """
    Hospital Admin Dashboard overview containing vital hospital KPIs,
    bed occupancy rates, ICU capacity, and inventory alerts.
    """
    stats = get_hospital_overview_stats(db)
    return {
        "status": "success",
        "message": "Welcome to the Hospital Administration Intelligence Dashboard.",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "stats": stats
    }


@router.get("/forecasting")
def get_forecasting_api(
    horizon: int = 14,
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Predictive hospital operations, inpatient bed demand, ICU surge risk,
    and pharmacy depletion horizons.
    """
    return get_forecasting_data(db, horizon_days=horizon)


@router.get("/beds")
def get_beds_api(
    ward: Optional[str] = None,
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    beds = get_all_beds(db, ward_filter=ward)
    return {
        "status": "success",
        "total_beds": len(beds),
        "beds": beds
    }


@router.put("/beds/{bed_id}")
@router.patch("/beds/{bed_id}")
def update_bed_api(
    bed_id: int,
    data: BedUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    status_val = data.status.lower() if data.status else None
    bed = update_bed_status(db, bed_id, status=status_val, patient_id=data.patient_id, notes=data.notes)
    if not bed:
        raise HTTPException(status_code=404, detail="Hospital bed not found.")
        
    create_audit_log(
        db,
        action="BED_STATUS_UPDATE",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="HospitalBed",
        resource_id=str(bed_id),
        details={"status": bed.status, "patient_id": bed.patient_id}
    )
    return {"status": "success", "message": "Bed updated successfully.", "bed_id": bed.id}


@router.get("/icu")
def get_icu_units_api(
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    units = get_all_icu_units(db)
    return {"status": "success", "icu_units": units}


@router.put("/icu/{icu_id}")
@router.patch("/icu/{icu_id}")
def update_icu_api(
    icu_id: int,
    data: IcuUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    unit = update_icu_unit(
        db,
        icu_id,
        status=data.status,
        occupied_count=data.occupied_count,
        ventilator_assigned=data.ventilator_assigned,
        ventilators_in_use=data.ventilators_in_use
    )
    if not unit:
        raise HTTPException(status_code=404, detail="ICU unit not found.")

    create_audit_log(
        db,
        action="ICU_STATUS_UPDATE",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="IcuUnit",
        resource_id=str(icu_id),
        details={"unit_code": unit.unit_code, "status": unit.status, "occupied": unit.occupied_count}
    )
    return {"status": "success", "message": "ICU unit updated successfully.", "unit": unit}


@router.get("/inventory")
def get_inventory_api(
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    items = get_inventory_items(db)
    return {"status": "success", "total_items": len(items), "inventory": items}


@router.post("/inventory", status_code=status.HTTP_201_CREATED)
def create_inventory_api(
    data: InventoryCreate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    item = create_inventory_item(db, data.dict(exclude_unset=True))
    create_audit_log(
        db,
        action="INVENTORY_ITEM_CREATED",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="InventoryItem",
        resource_id=str(item.id),
        details={"item_name": item.item_name, "stock": item.current_stock}
    )
    return {"status": "success", "message": "Inventory item created successfully.", "item": item}


@router.put("/inventory/{item_id}")
@router.patch("/inventory/{item_id}")
def update_inventory_api(
    item_id: int,
    data: InventoryUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    stock = data.current_stock if data.current_stock is not None else data.quantity
    min_thresh = data.minimum_threshold if data.minimum_threshold is not None else data.reorder_threshold
    cost = data.unit_cost if data.unit_cost is not None else data.unit_price

    item = update_inventory_stock(
        db,
        item_id,
        current_stock=stock,
        minimum_threshold=min_thresh,
        reorder_quantity=data.reorder_quantity,
        item_name=data.item_name,
        category=data.category,
        unit=data.unit,
        unit_cost=cost,
        batch_number=data.batch_number,
        expiry_date=data.expiry_date,
        supplier=data.supplier
    )
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
        
    create_audit_log(
        db,
        action="INVENTORY_STOCK_UPDATE",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="InventoryItem",
        resource_id=str(item_id),
        details={"item_name": item.item_name, "stock": item.current_stock, "status": item.status}
    )
    return {"status": "success", "message": "Inventory updated successfully.", "item": item}


@router.get("/departments")
def get_departments_api(
    current_user: User = Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    depts = get_all_departments(db)
    return {"status": "success", "departments": depts}


@router.get("/audit-logs")
def get_audit_logs_api(
    limit: int = 50,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    logs = get_audit_logs(db, limit=limit)
    return {"status": "success", "logs": logs}


@router.get(
    "/users",
    response_model=List[UserResponse]
)
def get_users_api(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    return get_all_users(db)


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_api(
    user_data: UserCreate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    return create_user(db, user_data)


@router.put("/users/{user_id}/status")
@router.patch("/users/{user_id}/status")
def update_user_status_api(
    user_id: int,
    status_data: UserStatusUpdate,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    user = update_user_status(db, user_id, status_data.is_active)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    create_audit_log(
        db,
        action="USER_STATUS_UPDATE",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="User",
        resource_id=str(user_id),
        details={"target_user": user.email, "is_active": user.is_active}
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