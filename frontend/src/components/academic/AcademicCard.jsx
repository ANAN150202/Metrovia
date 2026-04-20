// Clickable card for Routine, Result, or Seat Plan
import { Link } from "react-router-dom";

const AcademicCard = ({ title, description, path, icon }) => {
  return (
    <Link
      to={path}
      className="card-hover p-6 flex items-start gap-4 cursor-pointer group"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10 border border-brand-200 dark:border-brand-900/30 flex items-center justify-center shrink-0 group-hover:shadow-glow-sm transition-all duration-200">
        <span className="text-brand-500">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white font-display group-hover:text-brand-500 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>

      {/* Arrow */}
      <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
};

export default AcademicCard;