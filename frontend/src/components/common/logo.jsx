// ─────────────────────────────────────────────────────────────
// Logo.jsx — Metrovia Brand Logo Component
//
// Reusable logo used across the entire app.
// Supports two sizes:
//   size="sm"  → navbar (icon 32px + small text)
//   size="lg"  → auth pages (icon 48px + large text)
//
// Two variants:
//   variant="full"  → icon + "Metrovia" wordmark (default)
//   variant="icon"  → icon only (for favicon / tight spaces)
//
// The icon is a custom abstract "M" built from two connected
// human-like node figures — representing connection and
// collaboration. Blue → purple gradient, subtle glow.
// ─────────────────────────────────────────────────────────────

const Logo = ({ size = "sm", variant = "full", className = "" }) => {

  // ── Size config ─────────────────────────────────────────────
  const config = {
    sm: {
      iconSize:    32,
      textSize:    "text-lg",
      textWeight:  "font-semibold",
      gap:         "gap-2.5",
      glowId:      "glow-sm",
    },
    lg: {
      iconSize:    48,
      textSize:    "text-2xl",
      textWeight:  "font-bold",
      gap:         "gap-3",
      glowId:      "glow-lg",
    },
  };

  const c = config[size] || config.sm;
  const s = c.iconSize;

  // ── SVG Icon ────────────────────────────────────────────────
  // Abstract M: two rounded human figures connected at the center
  // Left figure leans left, right figure leans right
  // A horizontal connector bridge links them at mid-height
  // Built entirely with SVG paths + circles for node heads

  const Icon = () => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))",
        flexShrink: 0,
      }}
    >
      <defs>
        {/* Main blue → purple gradient */}
        <linearGradient id={`grad-${size}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Lighter gradient for connector bridge */}
        <linearGradient id={`grad2-${size}`} x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#60A5FA" stopOpacity="0.9" />
          <stop offset="50%"  stopColor="#A78BFA" stopOpacity="1"   />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
        </linearGradient>

        {/* Soft glow filter */}
        <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background rounded square ─────────────────────────── */}
      <rect
        x="0" y="0" width="48" height="48"
        rx="12"
        fill="url(#grad-sm)"
        opacity="0.12"
      />
      <rect
        x="1" y="1" width="46" height="46"
        rx="11"
        fill="none"
        stroke="url(#grad-sm)"
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      {/* ── Left figure ──────────────────────────────────────────
          Head: circle at top-left area
          Body: rounded path leaning inward toward center-bottom
      ──────────────────────────────────────────────────────── */}

      {/* Left head node */}
      <circle
        cx="14" cy="11"
        r="3.5"
        fill={`url(#grad-${size})`}
        filter={`url(#glow-${size})`}
      />

      {/* Left body — curves from head down to center-bottom */}
      <path
        d="M 14 15 C 14 20, 20 22, 22 28 C 23 31, 23 34, 23 37"
        stroke={`url(#grad-${size})`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${size})`}
      />

      {/* Left foot node */}
      <circle
        cx="23" cy="37"
        r="2.5"
        fill={`url(#grad-${size})`}
        opacity="0.8"
      />

      {/* ── Right figure ─────────────────────────────────────────
          Mirror of left figure
      ──────────────────────────────────────────────────── */}

      {/* Right head node */}
      <circle
        cx="34" cy="11"
        r="3.5"
        fill={`url(#grad-${size})`}
        filter={`url(#glow-${size})`}
      />

      {/* Right body — curves from head down to center-bottom */}
      <path
        d="M 34 15 C 34 20, 28 22, 26 28 C 25 31, 25 34, 25 37"
        stroke={`url(#grad-${size})`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter={`url(#glow-${size})`}
      />

      {/* Right foot node */}
      <circle
        cx="25" cy="37"
        r="2.5"
        fill={`url(#grad-${size})`}
        opacity="0.8"
      />

      {/* ── Center connection bridge ──────────────────────────────
          Horizontal connector at mid-height linking both figures
          Represents the "connection" concept
      ──────────────────────────────────────────────────── */}
      <path
        d="M 17 23 Q 24 19 31 23"
        stroke={`url(#grad2-${size})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
        filter={`url(#glow-${size})`}
      />

      {/* Center node — the connection point */}
      <circle
        cx="24" cy="20"
        r="2"
        fill={`url(#grad-${size})`}
        opacity="0.9"
      />

    </svg>
  );

  // ── Icon only variant ────────────────────────────────────────
  if (variant === "icon") {
    return (
      <div className={className}>
        <Icon />
      </div>
    );
  }

  // ── Full logo variant (icon + wordmark) ──────────────────────
  return (
    <div className={`flex items-center ${c.gap} ${className}`}>
      <Icon />
      <span
        className={`${c.textSize} ${c.textWeight} tracking-tight font-display`}
        style={{
          // Gradient text for the wordmark
          background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Metrovia
      </span>
    </div>
  );
};

export default Logo;