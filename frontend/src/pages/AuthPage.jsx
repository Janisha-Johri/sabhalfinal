import { useState } from "react";
import { signIn, signUp } from "../lib/supabase";
import GlassCard from "../components/GlassCard";
import ThemeToggle from "../components/ThemeToggle";

const roles = [
  {
    id: "patient",
    label: "Patient",
    icon: "🧑‍⚕️",
    desc: "Submit symptoms & get AI analysis",
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: "👨‍⚕️",
    desc: "Review cases & manage patients",
  },
];

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "register" && !fullName) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { data, error } = await signUp(email, password, role, fullName);
        if (error) throw error;
        setSuccess("Account created! Please check your email to verify, then sign in.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">S</span>
          </div>
          <span className="font-display font-bold text-xl text-white">sabhal</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Hero text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-body mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI-Powered Healthcare
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-slate-400 font-body">
              {mode === "login"
                ? "Sign in to your Sabhal account"
                : "Create your account in seconds"}
            </p>
          </div>

          <GlassCard glow className="p-6">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-white/5 p-1 mb-6">
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-display font-medium transition-all duration-200 capitalize ${
                    mode === m
                      ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/25"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Role selection (register only) */}
            {mode === "register" && (
              <div className="mb-5">
                <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        role === r.id
                          ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <div className="font-display font-semibold text-white text-sm">{r.label}</div>
                      <div className="font-body text-slate-400 text-xs mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full name (register only) */}
            {mode === "register" && (
              <div className="mb-4">
                <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Ahmed Hassan"
                  className="input-field"
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Error / Success */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-body">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-body">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </button>
          </GlassCard>

          <p className="text-center text-slate-500 text-sm mt-6 font-body">
            Built for healthcare access ·{" "}
            <span className="text-cyan-500">Sabhal</span>
          </p>
        </div>
      </div>
    </div>
  );
}