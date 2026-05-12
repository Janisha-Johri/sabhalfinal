import { useState } from "react";
import { analyzeSymptoms } from "../lib/api";
import { insertCase, updateCase } from "../lib/supabase";
import GlassCard from "../components/GlassCard";
import UrgencyBadge from "../components/UrgencyBadge";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SEVERITIES = [
  { value: "mild", label: "Mild", color: "emerald" },
  { value: "moderate", label: "Moderate", color: "amber" },
  { value: "severe", label: "Severe", color: "red" },
];

const DURATIONS = [
  "Less than 24 hours",
  "1–3 days",
  "4–7 days",
  "1–2 weeks",
  "More than 2 weeks",
];

const defaultPatient = {
  patient_name: "",
  age: "",
  gender: "",
  blood_group: "",
  allergies: "",
};

const defaultSymptoms = {
  symptoms: "",
  duration: "",
  severity: "",
};

export default function PatientDashboard({ user }) {
  const [patient, setPatient] = useState(defaultPatient);
  const [symptoms, setSymptoms] = useState(defaultSymptoms);
  const [aiResult, setAiResult] = useState(null);
  const [currentCaseId, setCurrentCaseId] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const setP = (key, val) => setPatient((p) => ({ ...p, [key]: val }));
  const setS = (key, val) => setSymptoms((s) => ({ ...s, [key]: val }));

  const canAnalyze =
    patient.patient_name &&
    patient.age &&
    patient.gender &&
    patient.blood_group &&
    symptoms.symptoms &&
    symptoms.duration &&
    symptoms.severity;

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setError("Please fill in all required fields before analyzing.");
      return;
    }
    setError("");
    setAnalyzing(true);
    setAiResult(null);
    try {
      const result = await analyzeSymptoms({
        patient_name: patient.patient_name,
        age: Number(patient.age),
        gender: patient.gender,
        blood_group: patient.blood_group,
        allergies: patient.allergies,
        symptoms: symptoms.symptoms,
        duration: symptoms.duration,
        severity: symptoms.severity,
      });
      setAiResult(result);
    } catch (err) {
      setError(err.message || "AI analysis failed. Make sure the backend is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult) {
      setError("Please generate AI analysis before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const caseData = {
        patient_id: user.id,
        ...patient,
        age: Number(patient.age),
        ...symptoms,
        ai_summary: aiResult.summary,
        urgency_level: aiResult.urgency_level,
        recommendations: aiResult.recommendations,
        status: "pending",
      };

      if (currentCaseId) {
        await updateCase(currentCaseId, caseData);
      } else {
        const { data, error: dbErr } = await insertCase(caseData);
        if (dbErr) throw dbErr;
        setCurrentCaseId(data.id);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit case.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setPatient(defaultPatient);
    setSymptoms(defaultSymptoms);
    setAiResult(null);
    setCurrentCaseId(null);
    setSubmitted(false);
    setError("");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
        <GlassCard glow className="p-10 text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Case Submitted!</h2>
          <p className="text-slate-400 font-body mb-2">
            Your case has been submitted and assigned{" "}
            <UrgencyBadge level={aiResult?.urgency_level} size="sm" /> priority.
          </p>
          <p className="text-slate-500 font-body text-sm mb-6">
            A doctor will review your case shortly.
          </p>
          <button onClick={handleReset} className="btn-primary w-full">
            Submit Another Case
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Patient Dashboard</h1>
        <p className="text-slate-400 font-body mt-1">
          Fill in your details and symptoms to get an AI-powered health assessment.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-body">
          ⚠️ {error}
        </div>
      )}

      {/* ── Patient Details ── */}
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs">1</span>
          Patient Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="field-label">Full Name *</label>
            <input
              type="text"
              value={patient.patient_name}
              onChange={(e) => setP("patient_name", e.target.value)}
              placeholder="Enter your full name"
              className="input-field"
            />
          </div>

          {/* Age */}
          <div>
            <label className="field-label">Age *</label>
            <input
              type="number"
              value={patient.age}
              onChange={(e) => setP("age", e.target.value)}
              placeholder="e.g. 35"
              min="1"
              max="120"
              className="input-field"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="field-label">Gender *</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {["male", "female", "other"].map((g) => (
                <button
                  key={g}
                  onClick={() => setP("gender", g)}
                  className={`py-2.5 rounded-xl border text-sm font-display font-medium capitalize transition-all duration-200 ${
                    patient.gender === g
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="field-label">Blood Group *</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setP("blood_group", bg)}
                  className={`py-2 rounded-xl border text-xs font-display font-semibold transition-all duration-200 ${
                    patient.blood_group === bg
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="field-label">Known Allergies <span className="text-slate-600">(optional)</span></label>
            <input
              type="text"
              value={patient.allergies}
              onChange={(e) => setP("allergies", e.target.value)}
              placeholder="e.g. Penicillin, Dust"
              className="input-field"
            />
          </div>
        </div>
      </GlassCard>

      {/* ── Symptoms ── */}
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs">2</span>
          Symptoms
        </h2>
        <div className="space-y-4">
          {/* Symptoms textarea */}
          <div>
            <label className="field-label">Describe your symptoms *</label>
            <textarea
              value={symptoms.symptoms}
              onChange={(e) => setS("symptoms", e.target.value)}
              placeholder="Describe what you're experiencing in detail — e.g. headache, fever, fatigue, chest pain..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="field-label">Duration *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setS("duration", d)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-body text-left transition-all duration-200 ${
                    symptoms.duration === d
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="field-label">Severity *</label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {SEVERITIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setS("severity", value)}
                  className={`py-3 rounded-xl border font-display font-semibold text-sm transition-all duration-200 ${
                    symptoms.severity === value
                      ? value === "mild"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : value === "moderate"
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                        : "border-red-500/50 bg-red-500/10 text-red-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Generate AI Summary ── */}
      <button
        onClick={handleAnalyze}
        disabled={analyzing || !canAnalyze}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        {analyzing ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analyzing with Gemini AI...
          </>
        ) : (
          <>
            <span>✨</span>
            Generate AI Health Summary
          </>
        )}
      </button>

      {/* ── AI Result ── */}
      {aiResult && (
        <GlassCard glow className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <span>🤖</span> AI Analysis Result
            </h2>
            <UrgencyBadge level={aiResult.urgency_level} size="lg" />
          </div>

          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Clinical Summary
              </p>
              <p className="text-slate-200 font-body text-sm leading-relaxed">{aiResult.summary}</p>
            </div>

            {/* Urgency explanation */}
            <div className={`p-4 rounded-xl border ${
              aiResult.urgency_level === "HIGH"
                ? "bg-red-500/10 border-red-500/20"
                : aiResult.urgency_level === "MEDIUM"
                ? "bg-amber-500/10 border-amber-500/20"
                : "bg-emerald-500/10 border-emerald-500/20"
            }`}>
              <p className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Urgency Level
              </p>
              <p className={`text-sm font-body ${
                aiResult.urgency_level === "HIGH"
                  ? "text-red-300"
                  : aiResult.urgency_level === "MEDIUM"
                  ? "text-amber-300"
                  : "text-emerald-300"
              }`}>
                {aiResult.urgency_level === "HIGH"
                  ? "⚠️ Requires immediate medical attention."
                  : aiResult.urgency_level === "MEDIUM"
                  ? "🕐 Should see a doctor within 24 hours."
                  : "✅ Non-urgent — routine care recommended."}
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recommendations
              </p>
              <div className="space-y-2">
                {aiResult.recommendations
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300 font-body">
                      <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
                      <span>{line.replace(/^•\s*/, "")}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Submit case button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-display font-semibold text-sm hover:bg-emerald-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting case...
              </>
            ) : (
              <>📋 Submit Case to Doctor</>
            )}
          </button>
        </GlassCard>
      )}

      {/* Field label style as inline */}
      <style>{`
        .field-label {
          display: block;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgb(148 163 184);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}