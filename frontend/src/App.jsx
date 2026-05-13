import { useState, useEffect } from "react";
import { supabase, getProfile } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    setLoading(true);
    const { data } = await getProfile(userId);
    setProfile(data);
    setLoading(false);
  };

  const handleAuth = (authUser) => {
    setUser(authUser);
    loadProfile(authUser.id);
  };

  const handleSignOut = () => {
    setUser(null);
    setProfile(null);
  };

  // ── Loading splash ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 animate-pulse-slow">
            <span className="text-white font-display font-bold text-xl">S</span>
          </div>
          <p className="text-slate-400 font-body text-sm tracking-wide">Loading sabhal...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  // ── Logged in ──
  return (
    <div className="min-h-screen mesh-bg">
      <Navbar user={user} profile={profile} onSignOut={handleSignOut} />
      <main className="relative z-10">
        {profile?.role === "doctor" ? (
          <DoctorDashboard user={user} profile={profile} />
        ) : (
          <PatientDashboard user={user} profile={profile} />
        )}
      </main>
    </div>
  );
}