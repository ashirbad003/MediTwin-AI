# REST API Documentation & Endpoints

## Base URL: `http://localhost:8000/api`

---

## 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user account (`PATIENT`, `DOCTOR`, `ADMIN`) | No |
| `POST` | `/auth/token` | OAuth2 password login, returns JWT access and refresh tokens | No |
| `POST` | `/auth/login` | JSON login endpoint | No |
| `POST` | `/auth/refresh` | Exchange valid refresh token for a new access token | No |
| `GET` | `/auth/me` | Fetch currently authenticated user identity and profile | Yes (Bearer) |

---

## 2. Patient Services (`/patient`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `GET` | `/patient/dashboard` | Aggregated patient summary: vitals, appointments, active Rx, risk scores | `PATIENT` |
| `GET` | `/patient/profile` | Full demographics, biometric indices, allergies, and conditions | `PATIENT` |
| `PUT` | `/patient/profile` | Update personal details, contact, lifestyle parameters, height/weight | `PATIENT` |
| `POST` | `/patient/allergies` | Record a new drug or environmental allergy | `PATIENT` |
| `DELETE` | `/patient/allergies/{id}` | Remove recorded allergy | `PATIENT` |
| `POST` | `/patient/conditions` | Add chronic medical condition to health record | `PATIENT` |
| `DELETE` | `/patient/conditions/{id}` | Delete recorded chronic condition | `PATIENT` |
| `GET` | `/patient/appointments` | List all historical and upcoming patient visits | `PATIENT` |
| `POST` | `/patient/appointments` | Book a consultation with a chosen specialist | `PATIENT` |
| `PUT` | `/patient/appointments/{id}/cancel` | Cancel a scheduled appointment | `PATIENT` |
| `GET` | `/patient/prescriptions` | Retrieve active digital prescriptions and regimens | `PATIENT` |
| `GET` | `/patient/doctors` | List available specialists and consultation fees | `PATIENT` |

---

## 3. Doctor Decision Support (`/doctor`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `GET` | `/doctor/dashboard` | Clinical overview: appointments, high-risk patient flags, recent reports | `DOCTOR` |
| `GET` | `/doctor/patients` | Patient roster with search and status filters | `DOCTOR` |
| `GET` | `/doctor/patients/{id}` | 360° Patient Digital Twin dossier | `DOCTOR` |
| `POST` | `/doctor/medical-records` | Append vital sign telemetry record | `DOCTOR` |
| `POST` | `/doctor/clinical-notes` | Record physician SOAP clinical notes | `DOCTOR` |
| `GET` | `/doctor/appointments` | Doctor's daily and upcoming appointment schedule | `DOCTOR` |
| `PUT` | `/doctor/appointments/{id}` | Update appointment status (`COMPLETED`, `CANCELLED`) | `DOCTOR` |

---

## 4. Artificial Intelligence & Explainability (`/ai`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/ai/disease-risk` | Predict 10-year CVD risk with per-feature SHAP attributions | `DOCTOR`, `PATIENT` |
| `POST` | `/ai/early-warning` | Compute Royal College of Physicians NEWS2 score & alert level | `DOCTOR`, `PATIENT` |
| `POST` | `/ai/readmission-risk` | Calculate 30-day post-discharge readmission probability | `DOCTOR` |

---

## 5. Clinical Knowledge RAG (`/rag`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/rag/query` | Retrieve evidence-based answers with grounded guideline citations (`patient` or `doctor` mode) | Any Authenticated |

---

## 6. Document Intelligence (`/reports`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/reports/upload` | Upload PDF report; triggers OCR and biomarker extraction | `PATIENT`, `DOCTOR` |
| `GET` | `/reports/my-reports` | List patient's uploaded diagnostic reports | `PATIENT` |
| `GET` | `/reports/patient/{id}` | Retrieve patient reports for physician review | `DOCTOR` |
| `GET` | `/reports/{id}` | Fetch full report with extracted biomarkers and AI summary | Any Authorized |
| `DELETE` | `/reports/{id}` | Delete uploaded report record | Any Authorized |

---

## 7. Prescription Intelligence (`/prescriptions`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `POST` | `/prescriptions/validate` | Check multi-drug prescription for pairwise drug-drug interactions and allergies | `DOCTOR` |
| `POST` | `/prescriptions/create` | Validate and persist multi-item prescription | `DOCTOR` |

---

## 8. Hospital Administration (`/admin`)
| Method | Endpoint | Description | Required Role |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Executive hospital KPIs, occupancy rates, and inventory alerts | `ADMIN` |
| `GET` | `/admin/beds` | Inpatient bed roster and ward allocations | `ADMIN` |
| `PUT` | `/admin/beds/{id}` | Modify bed status or assign admitted patient | `ADMIN` |
| `GET` | `/admin/icu` | ICU critical care and ventilator status | `ADMIN` |
| `PUT` | `/admin/icu/{id}` | Update ICU unit status and ventilator assignments | `ADMIN` |
| `GET` | `/admin/inventory` | Hospital pharmacy and consumables ledger | `ADMIN` |
| `POST` | `/admin/inventory` | Create new inventory stock item | `ADMIN` |
| `PUT` | `/admin/inventory/{id}` | Update item stock level and reorder thresholds | `ADMIN` |
| `GET` | `/admin/users` | Personnel and patient user directory | `ADMIN` |
| `POST` | `/admin/users` | Provision new doctor or admin account | `ADMIN` |
| `PUT` | `/admin/users/{id}/status` | Activate or suspend user account | `ADMIN` |
| `GET` | `/admin/forecasting` | 14-day bed and ICU demand time-series projections | `ADMIN` |
| `GET` | `/admin/audit-logs` | Immutable security and clinical action audit trail | `ADMIN` |
