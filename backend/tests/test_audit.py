import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_complete_audit_workflow():
    # 1. Verify Demo Users & Token Generation
    users = [
        ('doctor@example.com', 'password', 'DOCTOR'),
        ('patient@example.com', 'password', 'PATIENT'),
        ('admin@example.com', 'password', 'ADMIN')
    ]

    tokens = {}
    for email, pwd, expected_role in users:
        res = client.post('/auth/login', json={'email': email, 'password': pwd})
        assert res.status_code == 200, f'Login failed for {email}: {res.text}'
        data = res.json()
        assert 'access_token' in data, f'No access token for {email}'
        assert data['user']['role'].upper() == expected_role, f'Role mismatch for {email}'
        tokens[expected_role] = data['access_token']
        print(f'[OK] Auth Verified: {email} -> Role: {expected_role}')

    # 2. Verify Invalid Password Rejection
    bad_res = client.post('/auth/login', json={'email': 'doctor@example.com', 'password': 'wrongpassword'})
    assert bad_res.status_code == 401
    print('[OK] Invalid credentials correctly rejected (401)')

    # 3. Verify RBAC Cross-Role Isolation
    # Patient trying to access Admin
    p_admin = client.get('/admin/dashboard', headers={'Authorization': f'Bearer {tokens["PATIENT"]}'})
    assert p_admin.status_code == 403
    print('[OK] RBAC verified: Patient blocked from Admin API (403)')

    # Doctor trying to access Admin
    d_admin = client.get('/admin/dashboard', headers={'Authorization': f'Bearer {tokens["DOCTOR"]}'})
    assert d_admin.status_code == 403
    print('[OK] RBAC verified: Doctor blocked from Admin API (403)')

    # Patient trying to access Doctor
    p_doc = client.get('/doctor/dashboard', headers={'Authorization': f'Bearer {tokens["PATIENT"]}'})
    assert p_doc.status_code == 403
    print('[OK] RBAC verified: Patient blocked from Doctor API (403)')

    # 4. Patient Subsystem Verification
    p_headers = {'Authorization': f'Bearer {tokens["PATIENT"]}'}
    p_dash = client.get('/patient/dashboard', headers=p_headers)
    assert p_dash.status_code == 200
    p_data = p_dash.json()
    assert 'patient' in p_data or 'latest_vitals' in p_data.get('data', {}) or p_data.get('status') == 'success'

    # 5. Doctor Subsystem Verification
    d_headers = {'Authorization': f'Bearer {tokens["DOCTOR"]}'}
    d_pts = client.get('/doctor/patients', headers=d_headers)
    assert d_pts.status_code == 200
    pts_res = d_pts.json()
    pts_list = pts_res.get('patients', pts_res if isinstance(pts_res, list) else [])
    assert len(pts_list) > 0
    test_pt_id = pts_list[0].get('patient_id') or pts_list[0].get('id')

    # Patient 360 view
    d_360 = client.get(f'/doctor/patients/{test_pt_id}', headers=d_headers)
    assert d_360.status_code == 200

    # 6. Admin Subsystem Verification
    a_headers = {'Authorization': f'Bearer {tokens["ADMIN"]}'}
    a_dash = client.get('/admin/dashboard', headers=a_headers)
    assert a_dash.status_code == 200

    a_beds = client.get('/admin/beds', headers=a_headers)
    assert a_beds.status_code == 200

    a_forecast = client.get('/admin/forecasting', headers=a_headers)
    assert a_forecast.status_code == 200

    # 7. AI Model Verification
    ai_risk = client.post('/ai/disease-risk', headers=d_headers, json={
        'age': 55, 'gender': 1, 'systolic_bp': 150, 'diastolic_bp': 95,
        'cholesterol': 240, 'fasting_glucose': 130, 'bmi': 28.5,
        'smoking': 1, 'physical_activity': 0
    })
    assert ai_risk.status_code == 200
    ai_risk_data = ai_risk.json()
    assert 'risk_score' in ai_risk_data or 'risk_score_percent' in ai_risk_data

    # NEWS2
    news_res = client.post('/ai/early-warning', headers=d_headers, json={
        'respiratory_rate': 26, 'spo2': 90, 'supplemental_oxygen': True,
        'temperature': 38.5, 'systolic_bp': 88, 'pulse': 135, 'consciousness': 'V'
    })
    assert news_res.status_code == 200
    news_data = news_res.json()
    score = news_data.get('news2_score', news_data.get('total_score', 0))
    assert score >= 7

    # 8. RAG 5 Questions Verification
    test_queries = [
        "What are normal fasting blood glucose targets for diabetics according to ADA?",
        "What is the first-line medication for essential hypertension per ACC/AHA?",
        "Can a patient take ACE inhibitors with ARBs simultaneously?",
        "What are the clinical criteria for chronic kidney disease stage 3 per KDIGO?",
        "What is the management guideline for acute bacterial pneumonia in adults?"
    ]
    for q in test_queries:
        rag_res = client.post('/rag/query', headers=p_headers, json={'query': q, 'mode': 'doctor'})
        assert rag_res.status_code == 200
        rag_data = rag_res.json()
        assert 'response' in rag_data or 'answer' in rag_data
        citations = rag_data.get('sources', rag_data.get('grounded_citations', []))
        assert len(citations) > 0
        print(f"[OK] RAG Query: '{q[:40]}...' -> Grounded citations: {len(citations)}")

    # 9. Drug Interaction Matrix Verification
    drug_check = client.post('/prescriptions/check-interactions', headers=d_headers, json={
        'medications': ['Aspirin', 'Warfarin', 'Ibuprofen']
    })
    assert drug_check.status_code == 200
    interaction_data = drug_check.json()
    assert interaction_data.get('has_interactions') is True
    print(f"[OK] Drug Interaction Checker: Detected {len(interaction_data.get('interactions', []))} pairwise conflicts.")

    print("\nAll 9 Comprehensive Audit Domains Verified Successfully!")

if __name__ == '__main__':
    test_complete_audit_workflow()
