// Reusable loading spinner component
// ─────────────────────────────────────────────────────────────
// Spinner.jsx — Loading Spinner Component
//
// Used anywhere the app is waiting for data or processing.
//
// Props:
//   size       → "sm" | "md" | "lg" (default: "md")
//   fullScreen → true = centered on full page (default: false)
//   text       → optional loading message below spinner
//   className  → extra Tailwind classes (optional)
//
// Usage examples:
//   <Spinner />
//   <Spinner size="sm" />
//   <Spinner fullScreen />
//   <Spinner fullScreen text="Loading your feed..." />
// ─────────────────────────────────────────────────────────────

// ── Size map ──────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-[3px]",
};

const Spinner = ({
  size = "md",
  fullScreen = false,
  text = "",
  className = "",
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // ── The actual spinner circle ─────────────────────────────
  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Spinning ring — brand color top, transparent rest */}
      <div
        className={`
          ${sizeClass}
          rounded-full
          border-brand-500/20
          border-t-brand-500
          animate-spin
        `}
      />
      {/* Optional loading text */}
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  // ── Full screen centered variant ──────────────────────────
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
        {spinner}
      </div>
    );
  }

  // ── Inline variant ────────────────────────────────────────
  return spinner;
};

export default Spinner;