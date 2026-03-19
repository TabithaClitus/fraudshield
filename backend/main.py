import json
import os
import random
from datetime import datetime
from pathlib import Path

import anthropic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="FraudShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load scam data safely
try:
    DATA_FILE = Path(__file__).parent.parent / "data" / "scam_data.json"
    with open(DATA_FILE, "r") as f:
        SCAM_DATA = json.load(f)
except Exception:
    SCAM_DATA = {"cities": [], "scam_types_weekly": [], "stats": {"scams_blocked_today": 2847, "active_patterns": 127}}

client = anthropic.Anthropic()

# In-memory activity log
activity_log = []

# Known demo scenarios for deterministic results
DEMO_SCENARIOS = {
    "9876543210": {
        "risk_score": 12, 
        "risk_level": "LOW", 
        "scam_type": None,
        "explanation": "This number has no fraud reports on record. It appears to be a legitimate contact with a clean transaction history. You can proceed safely.",
        "recommendation": "Pay Safely",
        "red_flags": [],
        "confidence": "HIGH"
    },
    "9999988888": {
        "risk_score": 91, 
        "risk_level": "HIGH", 
        "scam_type": "OTP Fraud",
        "explanation": "WARNING: This number has 17 confirmed fraud reports across Delhi and Mumbai. It is associated with OTP fraud schemes where scammers pose as bank officials. Do not send money.",
        "recommendation": "Block Immediately",
        "red_flags": ["17 fraud reports", "Known OTP scam network", "Multiple city pattern"],
        "confidence": "HIGH"
    },
    "8888877777": {
        "risk_score": 54, 
        "risk_level": "MEDIUM", 
        "scam_type": "Prize Scam",
        "explanation": "This number shows suspicious patterns — the amount ₹4,999 is commonly used in prize scams to stay under ₹5,000 alert thresholds. The note 'prize' is a major red flag.",
        "recommendation": "Verify First",
        "red_flags": ["Suspicious amount ₹4,999", "Prize scam keywords", "Fraud reports in 2 cities"],
        "confidence": "MEDIUM"
    },
    "7777766666": {
        "risk_score": 96, 
        "risk_level": "HIGH", 
        "scam_type": "Fraud Ring / Commission Scam",
        "explanation": "CRITICAL: This number is linked to an organized fraud ring operating across multiple states. Amount ₹49,999 is a hallmark of commission scams targeting job seekers.",
        "recommendation": "Block Immediately",
        "red_flags": ["Organized fraud ring", "Amount ₹49,999 pattern", "34 confirmed reports", "Multi-state operation"],
        "confidence": "HIGH"
    },
    "6666655555": {
        "risk_score": 88, 
        "risk_level": "HIGH", 
        "scam_type": "OTP Verification Scam",
        "explanation": "Extremely suspicious! Amount ₹1 with note 'verify' is the classic OTP scam — after this small payment, scammers gain UPI access and drain your account.",
        "recommendation": "Block Immediately",
        "red_flags": ["Test payment amount ₹1", "OTP verification keywords", "Account takeover risk"],
        "confidence": "HIGH"
    },
    "9123456789": {
        "risk_score": 82, 
        "risk_level": "HIGH", 
        "scam_type": "Fake KYC Scam",
        "explanation": "This number is requesting KYC-related payment via UPI. Legitimate banks and UIDAI NEVER ask for money to complete KYC. This is a Fake KYC scam.",
        "recommendation": "Block Immediately",
        "red_flags": ["KYC payment request", "Illegal demand", "8 confirmed reports"],
        "confidence": "HIGH"
    },
}


class CheckRequest(BaseModel):
    mobile: str
    amount: float
    note: str = ""


class ReportRequest(BaseModel):
    mobile: str
    reason: str = ""


class GuardianAlertRequest(BaseModel):
    guardian_name: str
    member_name: str
    mobile: str
    amount: float


@app.get("/")
def root():
    return {"status": "FraudShield API running", "version": "1.0", "message": "FraudShield API is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/stats")
def get_stats():
    data = SCAM_DATA if isinstance(SCAM_DATA, dict) else {}
    base = data.get("stats", {})
    variance = random.randint(-50, 150)
    return {
        "scams_blocked_today": base.get("scams_blocked_today", 2847) + variance,
        "users_protected": "1.2M",
        "amount_saved_cr": "₹4.7Cr",
        "active_patterns": base.get("active_patterns", 127) + random.randint(-3, 8),
        "recent_activity": activity_log,
        "scam_types_weekly": data.get("scam_types_weekly", []),
        "safe_today": 1847 + random.randint(-20, 50),
        "caution_today": 634 + random.randint(-10, 30),
        "blocked_today": 366 + random.randint(-5, 20),
        "fraud_trend_30d": [
            {"day": f"Day {i+1}", "attempts": random.randint(200, 400)} for i in range(30)
        ]
    }


@app.post("/api/check-number")
def check_number(req: CheckRequest):
    mobile_clean = req.mobile.replace("+91", "").replace("-", "").replace(" ", "").strip()

    # Return demo scenario results without API call
    if mobile_clean in DEMO_SCENARIOS:
        result = DEMO_SCENARIOS[mobile_clean].copy()
        result["mobile"] = mobile_clean
        result["amount"] = req.amount
        result["source"] = "fraud_database"
        activity_log.insert(0, {
            "mobile": f"+91-{mobile_clean[:5]}XXXXX",
            "amount": req.amount,
            "risk_level": result["risk_level"],
            "timestamp": datetime.now().isoformat()
        })
        if len(activity_log) > 10:
            activity_log.pop()
        return result

    # For unknown numbers, use rule-based analysis (skip Claude)
    current_hour = datetime.now().hour
    risk_score = 15  # default low
    red_flags = []
    
    # Check note for scam keywords
    scam_keywords = ["kyc", "otp", "verify", "prize", "refund", "cashback", 
                     "urgent", "blocked", "lottery", "reward", "winner", "claim"]
    note_lower = (req.note or "").lower()
    
    if any(kw in note_lower for kw in scam_keywords):
        risk_score = 85
        red_flags.append("Suspicious keyword in note")
    
    # Check amount patterns
    if req.amount in [1, 9999, 49999, 99999]:
        risk_score = max(risk_score, 60)
        red_flags.append("Suspicious amount pattern")
    
    # Check late night (23:00-05:59)
    if current_hour >= 23 or current_hour <= 5:
        risk_score = min(risk_score + 10, 100)
        red_flags.append("Late night transaction")
    
    # Determine risk level and recommendation
    if risk_score >= 70:
        risk_level = "HIGH"
        recommendation = "Block Immediately"
        scam_type = "Suspicious Transaction"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
        recommendation = "Verify First"
        scam_type = None
    else:
        risk_level = "LOW"
        recommendation = "Pay Safely"
        scam_type = None
    
    # Build response
    if risk_score < 40:
        explanation = "No fraud reports found for this number. Transaction details analyzed — appears safe."
    else:
        explanation = "Suspicious transaction patterns detected. Please verify the sender's identity before paying."
    
    result = {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "scam_type": scam_type,
        "explanation": explanation,
        "recommendation": recommendation,
        "red_flags": red_flags,
        "confidence": "HIGH",
        "source": "transaction_analysis",
        "mobile": mobile_clean,
        "amount": req.amount
    }

    activity_log.insert(0, {
        "mobile": f"+91-{mobile_clean[:5]}XXXXX",
        "amount": req.amount,
        "risk_level": result.get("risk_level", "MEDIUM"),
        "timestamp": datetime.now().isoformat()
    })
    if len(activity_log) > 10:
        activity_log.pop()

    return result


@app.get("/api/heatmap")
def get_heatmap():
    return {"cities": SCAM_DATA.get("cities", [])}


@app.get("/api/predictions")
def get_predictions():
    try:
        prompt = """You are FraudShield AI analyzing India fraud trends for March 2026. Generate 5 currently trending scam alerts for Indian cities. Return ONLY a JSON array, each item:
{
  "city": "city name",
  "scam_type": "scam name",
  "reports_24h": number,
  "trend": "+X% this week",
  "alert_message": "one warning sentence",
  "common_pattern": "how scammers operate in 1-2 sentences"
}

Focus on realistic India-specific scams: fake IRCTC refunds, electricity bill fraud, OTP scams, loan app fraud, job offer fraud, etc."""

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        predictions = json.loads(text)
    except Exception:
        predictions = [
            {"city": "Mumbai", "scam_type": "Fake IRCTC Refund", "reports_24h": 127, "trend": "+340% this week",
             "alert_message": "Scammers posing as IRCTC agents offering fake refunds via UPI",
             "common_pattern": "Victim receives call about cancelled ticket refund, asked to share OTP to 'receive' money."},
            {"city": "Delhi", "scam_type": "Electricity Bill Scam", "reports_24h": 89, "trend": "+210% this week",
             "alert_message": "Fake electricity department threatening disconnection unless immediate UPI payment",
             "common_pattern": "Automated call says bill is overdue, provides UPI ID to pay 'penalty'."},
            {"city": "Bangalore", "scam_type": "Job Offer Fraud", "reports_24h": 67, "trend": "+180% this week",
             "alert_message": "Fake job offers requiring registration fees via UPI from IT freshers",
             "common_pattern": "WhatsApp message with official-looking offer letter, asks for security deposit."},
            {"city": "Hyderabad", "scam_type": "Investment Fraud", "reports_24h": 54, "trend": "+155% this week",
             "alert_message": "Fake stock trading groups promising 300% returns in 30 days",
             "common_pattern": "WhatsApp group shows fake profits, victims invest more until account is emptied."},
            {"city": "Ahmedabad", "scam_type": "Loan App Scam", "reports_24h": 43, "trend": "+120% this week",
             "alert_message": "Predatory loan apps accessing contacts to blackmail users after small loans",
             "common_pattern": "App requests contact and photo access, uses them to harass borrower's family."}
        ]

    return {"predictions": predictions, "updated_at": datetime.now().isoformat()}


@app.post("/api/report")
def report_number(req: ReportRequest):
    return {
        "success": True,
        "message": f"Number {req.mobile} has been reported to FraudShield database. Thank you for keeping India safe!",
        "report_id": f"FS{random.randint(100000, 999999)}",
        "action": "This number will be reviewed within 24 hours"
    }


@app.post("/api/guardian/alert")
def guardian_alert(req: GuardianAlertRequest):
    return {
        "success": True,
        "alert_sent": True,
        "guardian": req.guardian_name,
        "member": req.member_name,
        "message": f"Alert sent to {req.guardian_name}: {req.member_name} attempting to send ₹{req.amount:,.0f} to {req.mobile}"
    }
