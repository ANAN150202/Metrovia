const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SIZE_CLASSES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const INITIAL_COLORS = [
  "bg-brand-500", "bg-violet-500", "bg-pink-500", "bg-amber-500",
  "bg-emerald-500", "bg-sky-500", "bg-rose-500", "bg-indigo-500",
];

const getColorFromName = (name) => {
  if (!name) return INITIAL_COLORS[0];
  return INITIAL_COLORS[name.charCodeAt(0) % INITIAL_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

// Handles both Cloudinary URLs (https://...) and legacy local filenames
const buildImageUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar; // Cloudinary or any full URL
  return `${BASE_URL}/uploads/images/${avatar}`; // legacy local file
};

const Avatar = ({ user, src, size = "md", className = "", onClick }) => {
  const imageSrc  = src ? buildImageUrl(src) : user?.avatar ? buildImageUrl(user.avatar) : null;
  const name      = user?.name || "";
  const initials  = getInitials(name);
  const bgColor   = getColorFromName(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const cursorClass = onClick ? "cursor-pointer" : "";

  const baseClass = `
    ${sizeClass} ${cursorClass} ${className}
    rounded-full flex items-center justify-center shrink-0
    overflow-hidden ring-2 ring-white dark:ring-dark-card
    transition-transform duration-200
    ${onClick ? "hover:scale-105" : ""}
  `;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name || "User avatar"}
        className={`${baseClass} object-cover`}
        onClick={onClick}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  if (initials) {
    return (
      <div className={`${baseClass} ${bgColor} font-semibold text-white font-display`} onClick={onClick} title={name}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${baseClass} bg-gray-200 dark:bg-dark-muted text-gray-400 dark:text-gray-600`} onClick={onClick}>
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-[60%] h-[60%]">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
};

export default Avatar;