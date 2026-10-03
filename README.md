# MEDiTWIN-AI

### AI-Powered Explainable Multimodal Healthcare & Hospital Intelligence Platform

---

## ⚡ How to Run MediTwin-AI (Single Command Startup)

### Method 1: Docker (Recommended for Non-Technical Users)
```bash
# 1. Navigate to project root
cd MediTwin-AI

# 2. Build and launch all services
docker compose up --build
```
- **Open Web Application:** [http://localhost:3000](http://localhost:3000)
- **API & Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Automatic Initialization:** PostgreSQL tables and demo accounts are initialized and seeded automatically.

### Method 2: Local Python & Node Environment
```bash
# Terminal 1 - Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m app.utils.seed_data
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```
- **Local Frontend:** [http://localhost:5173](http://localhost:5173)
- **Local Backend:** [http://localhost:8000](http://localhost:8000)

---

## 🌟 Executive Summary & Overview

**MediTwin-AI** is a comprehensive, production-grade clinical intelligence and hospital operations platform. It unifies patient self-service, physician clinical decision support, explainable machine learning diagnostics, multi-modal medical document parsing, grounded retrieval-augmented generation (RAG) guidelines, pairwise drug-drug interaction safety, and hospital operational forecasting into a single unified SaaS ecosystem.

Designed for B.Tech Major Project submission and clinical research demonstration, MediTwin-AI strictly adheres to evidence-based healthcare protocols (ACC/AHA, ADA, KDIGO, and Royal College of Physicians NEWS2).

---

## 🚀 Core Platform Modules

### 1. Patient Experience & Digital Health Twin
- **Patient Profile & Biometrics:** Demographics, anthropometrics (BMI calculation), chronic condition registry, allergy tracking (NKDA protocols).
- **Document Intelligence:** Upload PDF diagnostic reports with automated OCR biomarker extraction, reference range comparison, and dual-mode plain-language summaries.
- **Consultation Booking:** Specialization and doctor picker with real-time appointment scheduling and cancellation.
- **Active Regimens & Pharmacotherapy:** Visual digital prescription viewer with dosage instructions, food warnings, and adherence reminders.
- **RAG Health Assistant:** Conversational health companion grounded in verified medical literature with citation confidence scoring.

### 2. Doctor Decision Support (CDS) & 360° Digital Twin
- **Patient Cohort Roster:** Real-time patient lookup, age/gender breakdown, blood type filtering, and latest clinical status.
- **360° Patient Digital Twin View:** Longitudinal vitals history, active chronic diagnoses, documented allergies, past prescriptions, and lab test archives.
- **Clinical AI Suite:**
  - *Disease Risk Engine:* Supervised Gradient Boosting Classifier predicting 10-year CVD risk with per-feature SHAP/feature contribution explanations.
  - *NEWS2 Clinical Early Warning System:* Standard Royal College of Physicians score computing acute illness deterioration risk across 7 physiological parameters with automated clinical response triggers.
  - *30-Day Readmission Risk:* Multivariate scoring evaluating post-discharge readmission likelihood.
- **Smart Prescription Manager:** Multi-item drug prescription builder featuring real-time pairwise drug-drug interaction checks (Moderate, Major, Severe) and cross-checking against patient allergies.
- **Specialist Clinical RAG Assistant:** Doctor-mode literature query retrieval displaying authoritative guideline citations (ACC/AHA, ADA, KDIGO, BNF).

### 3. Hospital Administration & Operational Intelligence
- **Executive Operations Dashboard:** Real-time metrics on registered patients, attending physicians, overall bed occupancy rate, ICU critical care capacity, and low-inventory alerts.
- **Bed & ICU Ward Logistics:** Interactive room and ward allocator supporting status toggles (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`), patient admission assignment, and mechanical ventilator monitoring.
- **Pharmacy & Consumables Ledger:** Inventory manager tracking medicine quantities, reorder thresholds, batch numbers, and expiry alerts.
- **Staff & IAM Governance:** User account provisioning, role-based access management (`DOCTOR`, `PATIENT`, `ADMIN`), and account suspension/activation toggles.
- **Hospital Demand Forecasting:** Time-series predictive models forecasting 14-day inpatient bed occupancy, 7-day ICU surge demand, and pharmaceutical stockout run-rates.
- **Compliance & Security Audit Trail:** Immutable audit logs capturing user authentication, medical report access, AI model inferences, and electronic prescription creations.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | FastAPI (Python 3.11+), Uvicorn, Pydantic v2 |
| **Relational Database** | PostgreSQL 15+, SQLAlchemy ORM |
| **Authentication** | JWT (JSON Web Tokens) with HS256, bcrypt password hashing, RBAC |
| **Machine Learning & XAI** | Scikit-Learn (Gradient Boosting), Joblib, NumPy, Pandas, SHAP Explainability |
| **Medical RAG Engine** | TF-IDF / Cosine Similarity Vector Retrieval over Clinical Knowledge Base |
| **Document Intelligence** | PyPDF Text Extractor, Regular Expression Biomarker Parser |
| **Frontend Web App** | React 19, Vite, React Router v7, Axios, Lucide React |
| **Styling & Design System** | Custom Clinical SaaS CSS Design System (Light/Dark Glassmorphism) |
| **Testing Suite** | Pytest, FastAPI TestClient |
| **Containerization** | Docker, Docker Compose |

---

## 🏗 System Architecture

```
                                  +---------------------------------------+
                                  |    React 19 + Vite Frontend Client    |
                                  | (Doctor / Patient / Admin Dashboards) |
                                  +-------------------+-------------------+
                                                      |
                                           REST API / JSON (Axios)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        FastAPI Backend Engine         |
                                  |       (Auth, RBAC, Middleware)        |
                                  +---+-------+-------+-------+-------+---+
                                      |       |       |       |       |
                 +--------------------+       |       |       |       +--------------------+
                 |                            |       |       |                            |
                 v                            v       v       v                            v
    +------------------------+      +-----------+   +---+   +-----------+      +------------------------+
    | PostgreSQL Database    |      |  ML & XAI |   |RAG|   | Document  |      |   Prescription Engine  |
    | (20 Relational Tables) |      |   Engine  |   |   |   |   Parser  |      | (Drug Interactions)    |
    +------------------------+      +-----------+   +---+   +-----------+      +------------------------+
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 14+ (or Docker)

### 1. Database Setup
Create a PostgreSQL database named `meditwin_ai`:
```sql
CREATE DATABASE meditwin_ai;
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# Windows activation:
.venv\Scripts\activate
# Linux/macOS activation:
source .venv/bin/activate

pip install -r requirements.txt

# Seed realistic demonstration clinical data
python -m app.utils.seed_data

# Start FastAPI backend
uvicorn app.main:app --reload --port 8000
```
Backend Swagger Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application will be live at: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

Pre-seeded demonstration accounts with instant one-click login on the homepage:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Doctor** | `doctor@example.com` | `password` | Clinical Decision Support, Patient 360°, Prescriptions, Clinical AI |
| **Patient** | `patient@example.com` | `password` | Health Twin, Medical Reports, Appointments, Medications, AI Assistant |
| **Admin** | `admin@example.com` | `password` | Hospital Operations, Bed Management, Inventory, Staff, Analytics |

---

## 🧪 Running Automated Tests

MediTwin-AI includes a comprehensive end-to-end integration and unit test suite:
```bash
cd backend
python -m pytest -v
```
**Test Coverage Includes:**
- JWT Authentication & RBAC Route Protection
- Patient & Doctor Dashboard Telemetry APIs
- Gradient Boosting CVD Model Risk Predictions & Attributions
- Royal College of Physicians NEWS2 Score Calculation
- Pairwise Drug-Drug Interaction Safety Checking
- Medical RAG Query Engine & Grounded Guideline Citations
- Hospital Bed & ICU Unit Allocations

---

## 🐳 Docker Deployment

To launch the entire platform (PostgreSQL, Backend, and Frontend) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 📚 Technical Documentation Index
- [System Architecture](ARCHITECTURE.md)
- [REST API Specification](API_DOCUMENTATION.md)
- [AI & ML Model Documentation](AI_MODEL_DOCUMENTATION.md)
- [Local Setup Guide](SETUP.md)
- [Production Deployment Guide](DEPLOYMENT.md)
