import ThemeToggle from "./ThemeToggle";
import { signOut } from "../lib/supabase";

export default function Navbar({ user, profile, onSignOut }) {
  const handleSignOut = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-white text-sm font-display font-bold">S</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            sabhal
          </span>
          <span className="hidden sm:block text-xs text-slate-500 font-body mt-0.5">
            AI Healthcare
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${profile.role === "doctor" ? "bg-cyan-400" : "bg-emerald-400"}`} />
              <span className="text-sm text-slate-300 font-body capitalize">{profile.role}</span>
            </div>
          )}
          <ThemeToggle />
          {user && (
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors font-body px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}