const CONFIG = {
  HIGH: {
    label: "HIGH",
    classes: "bg-red-500/20 text-red-300 border-red-500/40",
    dot: "bg-red-400",
    pulse: true,
  },
  MEDIUM: {
    label: "MEDIUM",
    classes: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dot: "bg-amber-400",
    pulse: false,
  },
  LOW: {
    label: "LOW",
    classes: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
    pulse: false,
  },
};

export default function UrgencyBadge({ level, size = "sm" }) {
  const cfg = CONFIG[level] || CONFIG.LOW;
  const textSize = size === "lg" ? "text-sm font-semibold" : "text-xs font-semibold";
  const padding = size === "lg" ? "px-4 py-2" : "px-3 py-1";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-display
        ${cfg.classes} ${textSize} ${padding}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}