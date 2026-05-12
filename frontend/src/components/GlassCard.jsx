export default function GlassCard({ children, className = "", glow = false }) {
  return (
    <div
      className={`
        relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl
        ${glow ? "shadow-lg shadow-cyan-500/10 border-cyan-500/20" : ""}
        ${className}
      `}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-sky-500/5 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}