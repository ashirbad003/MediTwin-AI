"""
NEWS2 (National Early Warning Score 2) Clinical Engine
Standardized physiological scoring system validated by the Royal College of Physicians UK
to detect acute clinical deterioration in adult hospital patients.
"""

from typing import Dict, Any, List


def calculate_news2(
    respiration_rate: int,
    oxygen_saturation: int,
    supplemental_oxygen: bool,
    systolic_bp: int,
    heart_rate: int,
    consciousness_level: str,  # "Alert" or "CVPU" (Confusion, Voice, Pain, Unresponsive)
    temperature: float
) -> Dict[str, Any]:
    """
    Calculates exact NEWS2 score, component sub-scores, and clinical escalation triggers.
    """
    breakdown = []
    
    # 1. Respiration Rate (breaths/min)
    # <=8: 3, 9-11: 1, 12-20: 0, 21-24: 2, >=25: 3
    if respiration_rate <= 8:
        rr_score = 3
        rr_rat = "Severe Bradypnea (<=8 bpm) - High risk of respiratory failure"
    elif 9 <= respiration_rate <= 11:
        rr_score = 1
        rr_rat = "Mild Bradypnea (9-11 bpm)"
    elif 12 <= respiration_rate <= 20:
        rr_score = 0
        rr_rat = "Normal respiratory rate (12-20 bpm)"
    elif 21 <= respiration_rate <= 24:
        rr_score = 2
        rr_rat = "Tachypneic (21-24 bpm) - Early sign of physiological stress"
    else:
        rr_score = 3
        rr_rat = "Severe Tachypnea (>=25 bpm) - Critical respiratory workload"
    breakdown.append({"parameter": "Respiration Rate", "value": f"{respiration_rate} bpm", "sub_score": rr_score, "clinical_rationale": rr_rat})
    
    # 2. Oxygen Saturation Scale 1 (%)
    # <=91: 3, 92-93: 2, 94-95: 1, >=96: 0
    if oxygen_saturation <= 91:
        spo2_score = 3
        spo2_rat = "Severe Hypoxemia (SpO2 <=91%) - Critical oxygenation deficit"
    elif oxygen_saturation in [92, 93]:
        spo2_score = 2
        spo2_rat = "Moderate Hypoxemia (SpO2 92-93%)"
    elif oxygen_saturation in [94, 95]:
        spo2_score = 1
        spo2_rat = "Borderline low oxygen saturation (94-95%)"
    else:
        spo2_score = 0
        spo2_rat = "Normal oxygen saturation (>=96%)"
    breakdown.append({"parameter": "Oxygen Saturation (SpO2)", "value": f"{oxygen_saturation}%", "sub_score": spo2_score, "clinical_rationale": spo2_rat})
    
    # 3. Supplemental Oxygen
    # Air: 0, Oxygen: 2
    o2_score = 2 if supplemental_oxygen else 0
    o2_rat = "Patient requiring supplemental O2 therapy (+2 points)" if supplemental_oxygen else "Room air breathing (0 points)"
    breakdown.append({"parameter": "Supplemental Oxygen", "value": "Prescribed O2" if supplemental_oxygen else "Room Air", "sub_score": o2_score, "clinical_rationale": o2_rat})
    
    # 4. Systolic Blood Pressure (mmHg)
    # <=90: 3, 91-100: 2, 101-110: 1, 111-219: 0, >=220: 3
    if systolic_bp <= 90:
        bp_score = 3
        bp_rat = "Severe Hypotension (<=90 mmHg) - Shock / hypoperfusion risk"
    elif 91 <= systolic_bp <= 100:
        bp_score = 2
        bp_rat = "Moderate Hypotension (91-100 mmHg)"
    elif 101 <= systolic_bp <= 110:
        bp_score = 1
        bp_rat = "Mild Hypotension (101-110 mmHg)"
    elif 111 <= systolic_bp <= 219:
        bp_score = 0
        bp_rat = "Normotensive systolic blood pressure (111-219 mmHg)"
    else:
        bp_score = 3
        bp_rat = "Severe Hypertensive Emergency (>=220 mmHg)"
    breakdown.append({"parameter": "Systolic Blood Pressure", "value": f"{systolic_bp} mmHg", "sub_score": bp_score, "clinical_rationale": bp_rat})
    
    # 5. Heart Rate (bpm)
    # <=40: 3, 41-50: 1, 51-90: 0, 91-110: 1, 111-130: 2, >=131: 3
    if heart_rate <= 40:
        hr_score = 3
        hr_rat = "Severe Bradycardia (<=40 bpm) - Hemodynamic collapse risk"
    elif 41 <= heart_rate <= 50:
        hr_score = 1
        hr_rat = "Mild Bradycardia (41-50 bpm)"
    elif 51 <= heart_rate <= 90:
        hr_score = 0
        hr_rat = "Normal resting heart rate (51-90 bpm)"
    elif 91 <= heart_rate <= 110:
        hr_score = 1
        hr_rat = "Mild Tachycardia (91-110 bpm)"
    elif 111 <= heart_rate <= 130:
        hr_score = 2
        hr_rat = "Moderate Tachycardia (111-130 bpm)"
    else:
        hr_score = 3
        hr_rat = "Severe Tachycardia (>=131 bpm) - Severe physiological stress/sepsis risk"
    breakdown.append({"parameter": "Heart Rate", "value": f"{heart_rate} bpm", "sub_score": hr_score, "clinical_rationale": hr_rat})
    
    # 6. Consciousness (Alert vs CVPU)
    # Alert: 0, CVPU (Confusion/Voice/Pain/Unresponsive): 3
    is_alert = consciousness_level.strip().lower() in ["alert", "a"]
    cons_score = 0 if is_alert else 3
    cons_rat = "Alert and oriented (0 points)" if is_alert else "Altered mental status / CVPU (+3 points) - High encephalopathy/hypoxia risk"
    breakdown.append({"parameter": "Consciousness Level", "value": "Alert" if is_alert else "CVPU (Altered)", "sub_score": cons_score, "clinical_rationale": cons_rat})
    
    # 7. Temperature (Celsius)
    # <=35.0: 3, 35.1-36.0: 1, 36.1-38.0: 0, 38.1-39.0: 1, >=39.1: 2
    if temperature <= 35.0:
        temp_score = 3
        temp_rat = "Severe Hypothermia (<=35.0 C) - Sepsis / shock marker"
    elif 35.1 <= temperature <= 36.0:
        temp_score = 1
        temp_rat = "Mild Hypothermia (35.1-36.0 C)"
    elif 36.1 <= temperature <= 38.0:
        temp_score = 0
        temp_rat = "Normothermic body temperature (36.1-38.0 C)"
    elif 38.1 <= temperature <= 39.0:
        temp_score = 1
        temp_rat = "Pyrexia / Low-grade fever (38.1-39.0 C)"
    else:
        temp_score = 2
        temp_rat = "High Pyrexia (>=39.1 C) - Acute infection / inflammatory response"
    breakdown.append({"parameter": "Body Temperature", "value": f"{temperature:.1f} °C", "sub_score": temp_score, "clinical_rationale": temp_rat})
    
    total_score = sum([rr_score, spo2_score, o2_score, bp_score, hr_score, cons_score, temp_score])
    has_extreme_single = any(item["sub_score"] == 3 for item in breakdown)
    
    # Clinical Risk Stratification based on UK Royal College of Physicians Guidelines
    if total_score >= 7:
        risk_level = "High"
        freq = "Continuous monitoring & vital signs every 15-30 minutes"
        response = "EMERGENCY: Immediate assessment by critical care specialist or medical emergency team (MET)."
        recs = [
            "Trigger immediate Medical Emergency Team (MET) / Rapid Response Team review.",
            "Establish continuous cardiac telemetry and pulse oximetry.",
            "Obtain urgent venous/arterial blood gas, full blood count, and lactate.",
            "Consider immediate transfer to High Dependency Unit (HDU) or ICU."
        ]
    elif total_score in [5, 6] or has_extreme_single:
        risk_level = "Medium"
        freq = "Minimum hourly vital signs monitoring"
        response = "URGENT: Prompt review by ward doctor with acute medical competencies within 30-60 minutes."
        recs = [
            "Urgent clinical review by attending physician within 30 minutes.",
            "Escalate to hourly vital signs charting.",
            "Evaluate for sepsis protocol (blood cultures, IV fluids, targeted antibiotics if indicated).",
            "Prepare for potential HDU level 2 escalation if trajectory deteriorates."
        ]
    else:
        risk_level = "Low"
        freq = "Routine 4-6 hourly vital signs monitoring"
        response = "Standard ward care: Continue regular observation cycle."
        recs = [
            "Continue standard vital signs tracking every 4-6 hours.",
            "Ensure adequate hydration and clinical stabilization.",
            "Re-evaluate score if any subjective symptoms alter."
        ]
        
    return {
        "total_score": total_score,
        "clinical_risk_level": risk_level,
        "monitoring_frequency": freq,
        "clinical_response": response,
        "parameter_breakdown": breakdown,
        "recommendations": recs
    }
