const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ============================================================
// Analyze symptoms via Gemini (through backend)
// ============================================================
export async function analyzeSymptoms(patientData) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patientData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to analyze symptoms");
  }

  return response.json(); // { summary, urgency_level, recommendations }
}

// ============================================================
// Update case status (doctor action)
// ============================================================
export async function updateCaseStatus(caseId, status) {
  const response = await fetch(`${API_BASE}/api/cases/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ case_id: caseId, status }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to update status");
  }

  return response.json();
}