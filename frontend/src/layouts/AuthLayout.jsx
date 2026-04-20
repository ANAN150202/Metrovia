import Logo from "../components/common/Logo";

// ─────────────────────────────────────────────────────────────
// AuthLayout.jsx — Layout for Login & Signup Pages (Metrovia)
// ─────────────────────────────────────────────────────────────

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0A0A0F] relative overflow-hidden">

      {/* Top-left blue glow */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
      />

      {/* Bottom-right purple glow */}
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)" }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Top branding bar ─────────────────────────────────── */}
      <div className="relative z-10 px-8 py-6">
        {/* Metrovia logo — uses reusable Logo component */}
        <Logo size="sm" variant="full" />
      </div>

      {/* ── Centered form card ───────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div
            className="rounded-2xl p-8 border"
            style={{
              background:              "rgba(20, 20, 30, 0.85)",
              borderColor:             "rgba(59, 130, 246, 0.15)",
              backdropFilter:          "blur(20px)",
              WebkitBackdropFilter:    "blur(20px)",
              boxShadow:               "0 0 0 1px rgba(59,130,246,0.08), 0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Metrovia. All rights reserved.
        </p>
      </div>

    </div>
  );
};

export default AuthLayout;