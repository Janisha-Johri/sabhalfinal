"""
SABHAL — Healthcare AI Backend
FastAPI + Groq AI + Supabase
"""

import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supabase import create_client, Client

load_dotenv()

# ============================================================
# INIT
# ============================================================

app = FastAPI(title="Sabhal API", version="1.0.0")

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Supabase
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY"),
)

# ============================================================
# MODELS
# ============================================================

class AIRequest(BaseModel):
    patient_name: str
    age: int
    gender: str
    blood_group: str
    allergies: Optional[str] = ""
    symptoms: str
    duration: str
    severity: str

class AIResponse(BaseModel):
    summary: str
    urgency_level: str
    recommendations: str

class StatusUpdate(BaseModel):
    case_id: str
    status: str

# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return {"status": "Sabhal API is running", "version": "1.0.0"}


@app.post("/api/analyze", response_model=AIResponse)
async def analyze_symptoms(req: AIRequest):
    prompt = f"""
You are an experienced medical triage AI assistant.
Analyze the following patient information and provide a structured medical summary.

PATIENT INFORMATION:
- Name: {req.patient_name}
- Age: {req.age}
- Gender: {req.gender}
- Blood Group: {req.blood_group}
- Known Allergies: {req.allergies or "None"}

REPORTED SYMPTOMS:
- Symptoms: {req.symptoms}
- Duration: {req.duration}
- Severity: {req.severity}

Please respond ONLY in the following exact format (no markdown, no extra text):

SUMMARY: [2-3 sentence clinical summary of the patient's condition]
URGENCY: [ONE word only — either LOW, MEDIUM, or HIGH]
RECOMMENDATIONS: [3-5 actionable bullet points starting with • for the doctor]

Urgency guidelines:
- HIGH: Potentially life-threatening, needs immediate attention
- MEDIUM: Needs prompt medical attention within 24 hours
- LOW: Non-urgent, can be managed with routine care
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        text = response.choices[0].message.content.strip()

        # Parse response
        lines = text.split("\n")
        summary = ""
        urgency = "MEDIUM"
        rec_lines = []
        current_section = None

        for line in lines:
            line = line.strip()
            if line.startswith("SUMMARY:"):
                current_section = "summary"
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("URGENCY:"):
                current_section = "urgency"
                raw = line.replace("URGENCY:", "").strip().upper()
                urgency = raw if raw in ["LOW", "MEDIUM", "HIGH"] else "MEDIUM"
            elif line.startswith("RECOMMENDATIONS:"):
                current_section = "recommendations"
                rest = line.replace("RECOMMENDATIONS:", "").strip()
                if rest:
                    rec_lines.append(rest)
            elif current_section == "summary" and line:
                summary += " " + line
            elif current_section == "recommendations" and line:
                rec_lines.append(line)

        recommendations = "\n".join(rec_lines) if rec_lines else "• Consult a physician promptly\n• Monitor symptoms closely\n• Stay hydrated and rest"

        return AIResponse(
            summary=summary or "Patient presents with the described symptoms requiring medical evaluation.",
            urgency_level=urgency,
            recommendations=recommendations,
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")


@app.patch("/api/cases/status")
async def update_case_status(req: StatusUpdate):
    valid_statuses = ["under_review", "resolved", "pending"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value")

    try:
        result = (
            supabase.table("cases")
            .update({"status": req.status})
            .eq("id", req.case_id)
            .execute()
        )
        return {"success": True, "updated": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cases")
async def get_all_cases():
    try:
        result = (
            supabase.table("cases")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        return {"cases": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)