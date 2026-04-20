// Preview card for a club/society page
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const PageCard = ({ page }) => {
  const bannerUrl = page.banner
    ? `${BASE_URL}/uploads/images/${page.banner}`
    : null;

  return (
    <Link to={`/pages/${page._id}`} className="card-hover block overflow-hidden">
      {/* Banner */}
      <div
        className="h-24 w-full"
        style={{
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }}
      />

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm font-display truncate">
          {page.name}
        </h3>
        {page.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {page.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-gray-400">
            {page.members?.length || 0} members
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PageCard;