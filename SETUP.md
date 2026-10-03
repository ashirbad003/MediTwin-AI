# Setup & How to Run MediTwin-AI

## Quick Startup (Recommended)

### 🐳 Method 1: Docker Compose (Zero Configuration)
1. Ensure **Docker Desktop** is running on your machine.
2. Open your terminal in the project root:
   ```bash
   cd MediTwin-AI
   docker compose up --build
   ```
3. Open your browser:
   - **Frontend SaaS Application:** [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

All 20 PostgreSQL tables, synthetic patient records, hospital beds, and clinical models are automatically initialized on first run.

---

### 💻 Method 2: Manual Local Development

#### Prerequisites
- **Python:** 3.11+
- **Node.js:** 18+ with `npm`
- **PostgreSQL:** Running locally on port `5432` with a database named `meditwin_ai`

#### 1. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial demonstration data
python -m app.utils.seed_data

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Login Credentials

Instant one-click pills are available on the login page:

| Subsystem | Email | Password | Role |
|---|---|---|---|
| **Doctor** | `doctor@example.com` | `password` | Clinical Decision Support, 360° Digital Twin, Prescriptions, Clinical AI |
| **Patient** | `patient@example.com` | `password` | Personal Health Twin, Diagnostic Reports, Appointments, Medications, AI Assistant |
| **Admin** | `admin@example.com` | `password` | Hospital Operations Command, Inpatient Beds, ICU, Inventory, Staff IAM, Forecasting |

---

## 🧪 Automated Testing
```bash
cd backend
.venv\Scripts\activate
python -m pytest -v
```
All 12 comprehensive integration and unit tests will run and pass.
