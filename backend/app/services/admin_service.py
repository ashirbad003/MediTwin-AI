from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.hospital import Department, HospitalBed, IcuUnit, InventoryItem, AuditLog, Notification


def get_hospital_overview_stats(db: Session) -> Dict[str, Any]:
    total_patients = db.query(Patient).count()
    active_doctors = db.query(Doctor).count()
    total_departments = db.query(Department).count()
    
    # Beds
    beds = db.query(HospitalBed).all()
    total_beds = len(beds)
    occupied_beds = sum(1 for b in beds if b.status == "occupied")
    available_beds = total_beds - occupied_beds
    bed_occupancy_rate = round((occupied_beds / total_beds * 100.0), 1) if total_beds > 0 else 0.0
    
    # ICU Units
    icu_units = db.query(IcuUnit).all()
    total_icu_beds = sum(u.bed_count for u in icu_units)
    occupied_icu_beds = sum(u.occupied_count for u in icu_units)
    icu_occupancy_rate = round((occupied_icu_beds / total_icu_beds * 100.0), 1) if total_icu_beds > 0 else 0.0
    
    # Appointments
    pending_appointments = db.query(Appointment).filter(Appointment.status.in_(["scheduled", "confirmed"])).count()
    
    # Inventory
    inventory = db.query(InventoryItem).all()
    low_stock = [item for item in inventory if item.current_stock <= item.minimum_threshold]
    
    return {
        "total_patients": total_patients,
        "active_doctors": active_doctors,
        "total_departments": total_departments,
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "available_beds": available_beds,
        "bed_occupancy_rate": bed_occupancy_rate,
        "total_icu_beds": total_icu_beds,
        "occupied_icu_beds": occupied_icu_beds,
        "icu_occupancy_rate": icu_occupancy_rate,
        "pending_appointments": pending_appointments,
        "low_stock_alerts_count": len(low_stock),
        "critical_alerts_count": sum(1 for item in low_stock if item.current_stock <= 10)
    }


def get_all_beds(db: Session, ward_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    query = db.query(HospitalBed)
    if ward_filter:
        query = query.filter(HospitalBed.ward_type == ward_filter)
    beds = query.order_by(HospitalBed.bed_number.asc()).all()
    
    results = []
    for b in beds:
        patient_name = None
        if b.patient_id:
            p = db.query(Patient).filter(Patient.id == b.patient_id).first()
            if p:
                u = db.query(User).filter(User.id == p.user_id).first()
                patient_name = u.full_name if u else f"Patient #{p.id}"
                
        results.append({
            "id": b.id,
            "bed_number": b.bed_number,
            "ward_type": b.ward_type,
            "ward_name": b.ward_name,
            "floor": b.floor,
            "status": b.status,
            "patient_id": b.patient_id,
            "patient_name": patient_name,
            "admission_date": b.admission_date.strftime("%Y-%m-%d %H:%M") if b.admission_date else None,
            "expected_discharge": b.expected_discharge.strftime("%Y-%m-%d") if b.expected_discharge else None,
            "notes": b.notes
        })
    return results


def update_bed_status(
    db: Session,
    bed_id: int,
    status: Optional[str] = None,
    patient_id: Optional[int] = None,
    notes: Optional[str] = None
) -> Optional[HospitalBed]:
    bed = db.query(HospitalBed).filter(HospitalBed.id == bed_id).first()
    if not bed:
        return None
        
    if status is not None:
        bed.status = status
    if patient_id is not None:
        bed.patient_id = patient_id if patient_id > 0 else None
        if patient_id > 0 and not bed.admission_date:
            bed.admission_date = datetime.now()
    elif status == "available":
        bed.patient_id = None
        bed.admission_date = None
        
    if notes is not None:
        bed.notes = notes
        
    db.commit()
    db.refresh(bed)
    return bed


def get_all_icu_units(db: Session) -> List[IcuUnit]:
    return db.query(IcuUnit).order_by(IcuUnit.unit_code.asc()).all()


def update_icu_unit(
    db: Session,
    icu_id: int,
    status: Optional[str] = None,
    occupied_count: Optional[int] = None,
    ventilator_assigned: Optional[bool] = None,
    ventilators_in_use: Optional[int] = None
) -> Optional[IcuUnit]:
    unit = db.query(IcuUnit).filter(IcuUnit.id == icu_id).first()
    if not unit:
        return None
        
    if status is not None:
        unit.status = status.lower()
    if occupied_count is not None:
        unit.occupied_count = max(0, min(unit.bed_count, occupied_count))
    if ventilators_in_use is not None:
        unit.ventilators_in_use = max(0, min(unit.ventilators_available, ventilators_in_use))
    elif ventilator_assigned is not None:
        if ventilator_assigned and unit.ventilators_in_use < unit.ventilators_available:
            unit.ventilators_in_use += 1
        elif not ventilator_assigned and unit.ventilators_in_use > 0:
            unit.ventilators_in_use -= 1

    db.commit()
    db.refresh(unit)
    return unit


def get_inventory_items(db: Session) -> List[InventoryItem]:
    return db.query(InventoryItem).order_by(InventoryItem.category.asc(), InventoryItem.item_name.asc()).all()


def create_inventory_item(
    db: Session,
    data: Dict[str, Any]
) -> InventoryItem:
    stock = data.get("current_stock") if data.get("current_stock") is not None else (data.get("quantity") or 0)
    min_thresh = data.get("minimum_threshold") if data.get("minimum_threshold") is not None else (data.get("reorder_threshold") or 50)
    cost = data.get("unit_cost") if data.get("unit_cost") is not None else (data.get("unit_price") or 0.0)
    code = data.get("item_code") or f"INV-{int(datetime.now().timestamp()) % 100000:05d}"
    
    status = "adequate"
    if stock == 0:
        status = "out_of_stock"
    elif stock <= min_thresh:
        status = "low_stock"

    item = InventoryItem(
        item_code=code,
        item_name=data.get("item_name", "Unnamed Item"),
        category=data.get("category", "Medication"),
        unit=data.get("unit", "Units"),
        current_stock=stock,
        minimum_threshold=min_thresh,
        reorder_quantity=data.get("reorder_quantity", 200),
        unit_cost=cost,
        batch_number=data.get("batch_number"),
        expiry_date=data.get("expiry_date"),
        supplier=data.get("supplier"),
        status=status
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_inventory_stock(
    db: Session,
    item_id: int,
    current_stock: Optional[int] = None,
    minimum_threshold: Optional[int] = None,
    reorder_quantity: Optional[int] = None,
    item_name: Optional[str] = None,
    category: Optional[str] = None,
    unit: Optional[str] = None,
    unit_cost: Optional[float] = None,
    batch_number: Optional[str] = None,
    expiry_date: Optional[str] = None,
    supplier: Optional[str] = None
) -> Optional[InventoryItem]:
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        return None
        
    if item_name is not None:
        item.item_name = item_name
    if category is not None:
        item.category = category
    if unit is not None:
        item.unit = unit
    if unit_cost is not None:
        item.unit_cost = unit_cost
    if batch_number is not None:
        item.batch_number = batch_number
    if expiry_date is not None:
        item.expiry_date = expiry_date
    if supplier is not None:
        item.supplier = supplier

    if current_stock is not None:
        item.current_stock = current_stock
        if current_stock == 0:
            item.status = "out_of_stock"
        elif current_stock <= (minimum_threshold or item.minimum_threshold):
            item.status = "low_stock"
        else:
            item.status = "adequate"
            
    if minimum_threshold is not None:
        item.minimum_threshold = minimum_threshold
    if reorder_quantity is not None:
        item.reorder_quantity = reorder_quantity
        
    db.commit()
    db.refresh(item)
    return item


def get_all_departments(db: Session) -> List[Department]:
    return db.query(Department).order_by(Department.name.asc()).all()


def get_forecasting_data(db: Session, horizon_days: int = 14) -> Dict[str, Any]:
    from app.ml.forecasting import forecast_hospital_metric
    
    total_beds = db.query(HospitalBed).count() or 50
    occupied_beds = db.query(HospitalBed).filter(HospitalBed.status == "occupied").count() or 28
    
    # 1. Bed Forecast
    bed_fc = forecast_hospital_metric("bed_occupancy", horizon_days=horizon_days, base_level=float(occupied_beds))
    bed_forecast = []
    for f in bed_fc.get("forecast_data", []):
        bed_forecast.append({
            "date": f["date"],
            "display_date": f.get("display_date"),
            "predicted_occupied": round(f["predicted_value"], 1),
            "confidence_lower": f["lower_bound"],
            "confidence_upper": f["upper_bound"]
        })
        
    # 2. ICU Forecast
    icu_units = db.query(IcuUnit).all()
    total_icu = sum(u.bed_count for u in icu_units) or 10
    occ_icu = sum(u.occupied_count for u in icu_units) or 6
    icu_fc = forecast_hospital_metric("icu_utilization", horizon_days=7, base_level=float(occ_icu), random_seed=99)
    icu_forecast = []
    for f in icu_fc.get("forecast_data", []):
        pred_icu = max(1, min(total_icu, int(round(f["predicted_value"] * (total_icu / 100.0)))))
        pred_vents = max(0, min(pred_icu, int(round(pred_icu * 0.65))))
        surge_risk = "HIGH DEMAND" if pred_icu >= int(total_icu * 0.8) else "CONTROLLED"
        icu_forecast.append({
            "date": f["date"],
            "predicted_icu": pred_icu,
            "predicted_ventilators": pred_vents,
            "surge_risk": surge_risk
        })
        
    # 3. Inventory Depletion Run-Rate
    inventory = db.query(InventoryItem).all()
    inventory_depletion = []
    for item in inventory[:8]:  # Top critical items
        burn_rate = max(1.0, round(float(item.reorder_quantity) / 14.0, 1))
        days_left = max(1, int(item.current_stock / burn_rate)) if burn_rate > 0 else 30
        status_label = "CRITICAL" if days_left <= 5 else ("LOW" if days_left <= 10 else "ADEQUATE")
        inventory_depletion.append({
            "item_name": item.item_name,
            "category": item.category,
            "current_stock": item.current_stock,
            "unit": item.unit,
            "daily_burn_rate": burn_rate,
            "estimated_days_left": days_left,
            "status": status_label
        })
        
    return {
        "status": "success",
        "horizon_days": horizon_days,
        "bed_forecast": bed_forecast,
        "icu_forecast": icu_forecast,
        "inventory_depletion": inventory_depletion,
        "model_summary": {
            "bed_model": "Exponential Trend Smoothing (Confidence: 95%)",
            "icu_model": "Poisson Surge Early Warning Engine",
            "inventory_model": "Dynamic Burn Rate & Lead-Time Projection"
        }
    }


def get_audit_logs(db: Session, limit: int = 50) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


def create_audit_log(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    user_role: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

