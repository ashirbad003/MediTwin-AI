import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["project"] == "MediTwin-AI"
    assert data["status"] == "operational"
    
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["database"] == "Connected"


def test_auth_login_patient():
    res = client.post("/auth/login", json={
        "email": "john.miller@example.com",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "patient"
    
    token = data["access_token"]
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == "john.miller@example.com"


def test_auth_login_doctor():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "doctor"


def test_auth_login_admin():
    res = client.post("/auth/login", json={
        "email": "admin@meditwin.ai",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "admin"


def test_rbac_doctor_route_protection():
    # Login as patient
    patient_res = client.post("/auth/login", json={
        "email": "john.miller@example.com",
        "password": "Password123!"
    })
    patient_token = patient_res.json()["access_token"]
    
    # Attempt to access doctor dashboard
    doc_res = client.get("/doctor/dashboard", headers={"Authorization": f"Bearer {patient_token}"})
    assert doc_res.status_code == 403


def test_patient_dashboard_api():
    res = client.post("/auth/login", json={
        "email": "john.miller@example.com",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    dash_res = client.get("/patient/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert data["status"] == "success"
    assert "latest_vitals" in data["data"]
    assert "allergies" in data["data"]


def test_doctor_patients_and_digital_twin():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    # Get patients list
    pats_res = client.get("/doctor/patients", headers={"Authorization": f"Bearer {token}"})
    assert pats_res.status_code == 200
    patients = pats_res.json()["patients"]
    assert len(patients) > 0
    
    first_patient_id = patients[0]["patient_id"]
    twin_res = client.get(f"/doctor/patients/{first_patient_id}", headers={"Authorization": f"Bearer {token}"})
    assert twin_res.status_code == 200
    twin = twin_res.json()["digital_twin"]
    assert "vitals_history" in twin
    assert "prescriptions" in twin


def test_admin_dashboard_and_beds():
    res = client.post("/auth/login", json={
        "email": "admin@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    admin_dash = client.get("/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert admin_dash.status_code == 200
    stats = admin_dash.json()["stats"]
    assert stats["total_beds"] > 0
    assert stats["active_doctors"] > 0
    
    beds_res = client.get("/admin/beds", headers={"Authorization": f"Bearer {token}"})
    assert beds_res.status_code == 200
    assert len(beds_res.json()["beds"]) > 0


def test_ai_disease_risk_prediction():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    ai_res = client.post("/ai/disease-risk", headers={"Authorization": f"Bearer {token}"}, json={
        "age": 58,
        "gender": "male",
        "systolic_bp": 148,
        "diastolic_bp": 92,
        "cholesterol": 235,
        "blood_glucose": 130,
        "bmi": 28.5,
        "smoking": 1,
        "alcohol_intake": 0,
        "physical_activity": 0,
        "family_history": 1
    })
    assert ai_res.status_code == 200
    data = ai_res.json()
    assert "risk_score_percent" in data
    assert "feature_contributions" in data
    assert len(data["feature_contributions"]) > 0
    assert "clinical_recommendations" in data


def test_ai_news2_early_warning():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    news2_res = client.post("/ai/news2", headers={"Authorization": f"Bearer {token}"}, json={
        "respiration_rate": 26,
        "oxygen_saturation": 91,
        "supplemental_oxygen": True,
        "systolic_bp": 88,
        "heart_rate": 134,
        "consciousness_level": "CVPU",
        "temperature": 39.2
    })
    assert news2_res.status_code == 200
    data = news2_res.json()
    assert data["total_score"] >= 10
    assert data["clinical_risk_level"] == "High"


def test_drug_interaction_checker():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    inter_res = client.post("/prescriptions/check-interactions", headers={"Authorization": f"Bearer {token}"}, json={
        "medications": ["Warfarin", "Aspirin", "Ibuprofen"]
    })
    assert inter_res.status_code == 200
    data = inter_res.json()
    assert data["has_interactions"] is True
    assert data["max_severity"] == "Major"


def test_rag_query_engine():
    res = client.post("/auth/login", json={
        "email": "doctor.sharma@meditwin.ai",
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    
    rag_res = client.post("/rag/query", headers={"Authorization": f"Bearer {token}"}, json={
        "query": "What are the first-line guidelines for managing hypertension in patients with type 2 diabetes?",
        "mode": "doctor"
    })
    assert rag_res.status_code == 200
    data = rag_res.json()
    assert "answer" in data
    assert len(data["grounded_citations"]) > 0
    assert "clinical_disclaimer" in data
