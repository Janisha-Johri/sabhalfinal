import { useState, useEffect } from "react";
import { getAllCases } from "../lib/supabase";
import { updateCaseStatus } from "../lib/api";
import GlassCard from "../components/GlassCard";
import UrgencyBadge from "../components/UrgencyBadge";

const FILTERS = ["ALL", "HIGH", "MEDIUM", "LOW"];
const STATUS_COLORS = {
  pending: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  under_review: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  resolved: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
};

function PatientCard({ c, onStatusChange }) {
  const [loading, setLoading] = useState(null);
  const [status, setStatus] = useState(c.status);

  const handleStatus = async (newStatus) => {
    setLoading(newStatus);
    try {
      await updateCaseStatus(c.id, newStatus);
      setStatus(newStatus);
      onStatusChange(c.id, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const recs = c.recommendations
    ? c.recommendations.split("\n").filter((l) => l.trim()).slice(0, 3)
    : [];

  return (
    <GlassCard className="p-5 flex flex-col gap-4 hover:border-white/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-white text-lg leading-tight">
            {c.patient_name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-500 font-body">
              {c.age}y · {c.gender} · {c.blood_group}
            </span>
            {c.allergies && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                ⚠ {c.allergies}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <UrgencyBadge level={c.urgency_level} />
          <span className={`text-xs px-2 py-0.5 rounded-full border font-display font-semibold capitalize ${STATUS_COLORS[status]}`}>
            {status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Symptoms */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Symptoms · {c.duration} · <span className="capitalize">{c.severity}</span>
        </p>
        <p className="text-sm text-slate-300 font-body leading-relaxed line-clamp-2">
          {c.symptoms}
        </p>
      </div>

      {/* AI Summary */}
      {c.ai_summary && (
        <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
          <p className="text-xs font-display font-semibold text-cyan-500/70 uppercase tracking-wider mb-1">
            🤖 AI Summary
          </p>
          <p className="text-sm text-slate-300 font-body leading-relaxed line-clamp-3">
            {c.ai_summary}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">
            Recommendations
          </p>
          {recs.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400 font-body">
              <span className="text-cyan-500 mt-0.5 flex-shrink-0">•</span>
              <span>{r.replace(/^•\s*/, "")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-slate-600 font-body">
        Submitted {new Date(c.created_at).toLocaleString()}
      </p>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
        <button
          onClick={() => handleStatus("under_review")}
          disabled={status === "under_review" || loading !== null}
          className={`py-2.5 rounded-xl border text-xs font-display font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            status === "under_review"
              ? "border-sky-500/40 bg-sky-500/15 text-sky-300 cursor-default"
              : "border-white/15 bg-white/5 text-slate-400 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
          }`}
        >
          {loading === "under_review" ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : "🔍"}
          Under Review
        </button>
        <button
          onClick={() => handleStatus("resolved")}
          disabled={status === "resolved" || loading !== null}
          className={`py-2.5 rounded-xl border text-xs font-display font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            status === "resolved"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-default"
              : "border-white/15 bg-white/5 text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
          }`}
        >
          {loading === "resolved" ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : "✅"}
          Resolved
        </button>
      </div>
    </GlassCard>
  );
}

export default function DoctorDashboard() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await getAllCases();
      if (error) setError(error.message);
      else setCases(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  const sorted = [...cases].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.urgency_level] ?? 3) - (order[b.urgency_level] ?? 3);
  });

  const filtered = filter === "ALL" ? sorted : sorted.filter((c) => c.urgency_level === filter);

  const counts = {
    ALL: cases.length,
    HIGH: cases.filter((c) => c.urgency_level === "HIGH").length,
    MEDIUM: cases.filter((c) => c.urgency_level === "MEDIUM").length,
    LOW: cases.filter((c) => c.urgency_level === "LOW").length,
  };

  const filterColors = {
    ALL: "from-cyan-500 to-sky-500",
    HIGH: "from-red-500 to-rose-500",
    MEDIUM: "from-amber-500 to-orange-500",
    LOW: "from-emerald-500 to-teal-500",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Doctor Dashboard</h1>
          <p className="text-slate-400 font-body mt-1">
            {cases.length} total case{cases.length !== 1 ? "s" : ""} · sorted by urgency
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-ghost text-sm self-start sm:self-auto"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {FILTERS.map((f) => (
          <GlassCard
            key={f}
            glow={filter === f}
            className={`p-4 cursor-pointer transition-all duration-200 hover:border-white/20 ${filter === f ? "border-white/20" : ""}`}
            onClick={() => setFilter(f)}
          >
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider mb-1">{f}</p>
            <p className={`text-2xl font-display font-bold bg-gradient-to-r ${filterColors[f]} bg-clip-text text-transparent`}>
              {counts[f]}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl border text-xs font-display font-semibold transition-all duration-200 ${
              filter === f
                ? `bg-gradient-to-r ${filterColors[f]} text-white border-transparent shadow-lg`
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            {f} {counts[f] > 0 && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-slate-400 font-body text-sm">Loading cases...</p>
          </div>
        </div>
      ) : error ? (
        <GlassCard className="p-6 text-center">
          <p className="text-red-400 font-body">⚠️ {error}</p>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-display font-semibold text-slate-300 text-lg">No cases found</p>
          <p className="text-slate-500 font-body text-sm mt-1">
            {filter === "ALL" ? "No patient cases submitted yet." : `No ${filter} priority cases.`}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="animate-slide-up">
              <PatientCard c={c} onStatusChange={handleStatusChange} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}