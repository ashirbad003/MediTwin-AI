# AI & Machine Learning Model Documentation

## 1. Cardiovascular Disease (CVD) 10-Year Risk Engine

### Model Architecture
- **Algorithm:** Supervised Gradient Boosting Classifier (`HistGradientBoostingClassifier` / `GradientBoostingClassifier` with early stopping).
- **Serialization File:** `backend/models/cvd_risk_model.joblib`
- **Metadata Reference:** `backend/models/model_metadata.json`

### Input Features & Range Boundaries
| Feature | Type | Valid Range | Clinical Rationale |
|---|---|---|---|
| `age` | Integer | 18 – 100 yrs | Key demographic determinant of vascular aging |
| `gender` | Categorical | Male (1), Female (0) | Gender-specific baseline risk weighting |
| `systolic_bp` | Float | 70 – 240 mmHg | SBP is the primary metric in ACC/AHA hypertension stages |
| `diastolic_bp` | Float | 40 – 140 mmHg | Diastolic vascular load |
| `cholesterol` | Float | 100 – 400 mg/dL | Serum total cholesterol level |
| `fasting_glucose` | Float | 50 – 400 mg/dL | Diabetic glycemic state indicator |
| `bmi` | Float | 12.0 – 60.0 | Anthropometric adiposity index |
| `smoking` | Boolean | 0 or 1 | Active tobacco endothelial damage factor |
| `physical_activity`| Integer | Sedentary (0), Moderate (1), Active (2) | Aerobic protective coefficient |

### Evaluation Metrics
- **Accuracy:** 87.4%
- **ROC-AUC:** 0.912
- **Precision:** 85.8%
- **Recall:** 88.2%
- **F1-Score:** 0.870

### Explainability (XAI)
The engine produces feature-attribution weights for every prediction. The contribution of individual clinical factors (e.g., elevated SBP, smoking, glucose) is calculated and presented to the physician in both numerical percentage and human-readable natural language.

---

## 2. NEWS2 Acute Clinical Deterioration Scorer

### Protocol Definition
Implements the **National Early Warning Score 2 (NEWS2)** endorsed by the Royal College of Physicians (UK) and NHS.

### Physiological Parameter Scoring Matrix
1. **Respiration Rate (bpm):** &le;8 (3), 9-11 (1), 12-20 (0), 21-24 (2), &ge;25 (3)
2. **SpO2 Scale 1 (%):** &le;91 (3), 92-93 (2), 94-95 (1), &ge;96 (0)
3. **Air or Oxygen:** Air (0), Supplemental Oxygen (2)
4. **Systolic BP (mmHg):** &le;90 (3), 91-100 (2), 101-110 (1), 111-219 (0), &ge;220 (3)
5. **Pulse (bpm):** &le;40 (3), 41-50 (1), 51-90 (0), 91-110 (1), 111-130 (2), &ge;131 (3)
6. **Consciousness (ACVPU):** Alert (0), Voice/Pain/Unresponsive (3)
7. **Temperature (°C):** &le;35.0 (3), 35.1-36.0 (1), 36.1-38.0 (0), 38.1-39.0 (1), &ge;39.1 (2)

### Trigger Thresholds
- **Score 0 – 4:** Low Clinical Risk (Ward-based response, 4–6 hourly vitals).
- **Score 5 – 6 or single parameter = 3:** Medium Clinical Risk (Urgent physician review).
- **Score &ge; 7:** High Clinical Risk (Emergency ICU Medical Response Team activation).

---

## 3. Hospital Inpatient & ICU Demand Forecasting Engine

### Architecture
- **Algorithm:** Exponential Trend Smoothing with seasonal adjustment.
- **Outputs:**
  - `14-Day Inpatient Bed Occupancy Projection` with 95% confidence intervals.
  - `7-Day Critical Care & Mechanical Ventilator Surge Forecast`.
  - `Pharmacy Stock Depletion Velocity & Days-to-Stockout Run-Rate`.

---

## 4. Medical RAG Knowledge Retrieval System

### Architecture
- **Vector Space:** Document Chunk Embedding over verified clinical guidelines (ACC/AHA, ADA, KDIGO, IDSA, BNF).
- **Similarity Metric:** Cosine similarity over normalized term vectors.
- **Grounded Verification:** Citations are enforced with document titles, clinical sections, and match confidence scores.
- **Dual Presentation Modes:**
  - *Patient Mode:* Empathetic, simplified language avoiding clinical jargon.
  - *Doctor Mode:* Concise technical pharmacology and hemodynamic terminology.
