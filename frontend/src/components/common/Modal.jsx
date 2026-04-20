// Reusable modal/dialog wrapper
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// Modal.jsx — Reusable Modal / Dialog Wrapper
//
// Used throughout the app for:
//   - Create page modal
//   - New chat modal
//   - Confirm delete dialogs
//   - Any other overlay dialog
//
// Props:
//   isOpen    → boolean — controls visibility
//   onClose   → function — called when modal should close
//   title     → string — modal header title (optional)
//   children  → the modal body content
//   size      → "sm" | "md" | "lg" | "xl" (default: "md")
//   hideClose → boolean — hide the X button (default: false)
//
// Behavior:
//   - Click backdrop → close
//   - Press ESC key  → close
//   - Scroll lock on body while open
//   - Smooth fade + scale animation
// ─────────────────────────────────────────────────────────────

// ── Size map ──────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideClose = false,
}) => {

  // ── ESC key to close ───────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Lock body scroll while modal is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Don't render anything if not open
  if (!isOpen) return null;

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    // ── Backdrop ─────────────────────────────────────────────
    // Fixed overlay covering the entire screen
    // Click on it (not on the modal) to close
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Dark semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* ── Modal Box ──────────────────────────────────────── */}
      {/* stopPropagation prevents backdrop click from firing */}
      <div
        className={`
          relative w-full ${sizeClass}
          bg-white dark:bg-dark-card
          border border-light-border dark:border-dark-border
          rounded-2xl shadow-card-hover
          animate-fade-in
          flex flex-col
          max-h-[90vh]
        `}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Modal Header ───────────────────────────────────
            Only rendered if title or close button is needed
        ──────────────────────────────────────────────────── */}
        {(title || !hideClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border shrink-0">
            {/* Title */}
            {title && (
              <h2 className="text-base font-semibold text-gray-900 dark:text-white font-display">
                {title}
              </h2>
            )}

            {/* Close button */}
            {!hideClose && (
              <button
                onClick={onClose}
                className="
                  ml-auto p-2 rounded-xl
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-light-hover dark:hover:bg-dark-hover
                  transition-all duration-200
                "
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* ── Modal Body ─────────────────────────────────────
            Scrollable if content is taller than the modal
        ──────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;