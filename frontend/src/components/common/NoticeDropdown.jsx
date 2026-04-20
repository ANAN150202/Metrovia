// Dropdown in Navbar showing recent notices
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

// ─────────────────────────────────────────────────────────────
// NoticeDropdown.jsx — Notice Bell + Dropdown
// Can be used standalone or imported into Navbar
// ─────────────────────────────────────────────────────────────

const NoticeDropdown = () => {
  const [notices,     setNotices]     = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notices on mount
  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/notices");
        setNotices(res.data.notices || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setShowDropdown((p) => !p)}
        className={`
          relative p-2.5 rounded-xl transition-all duration-200
          ${showDropdown
            ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover"
          }
        `}
        title="Notices"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread dot */}
        {notices.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="
          absolute top-full right-0 mt-2 w-80 z-50
          bg-white dark:bg-dark-card
          border border-light-border dark:border-dark-border
          rounded-2xl shadow-card-hover overflow-hidden
          animate-fade-in
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              Notices
            </h3>
            <Link
              to="/notices"
              onClick={() => setShowDropdown(false)}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              View all
            </Link>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-sm text-gray-400">Loading...</p>
            ) : notices.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No notices yet</p>
            ) : (
              notices.slice(0, 5).map((notice) => (
                <div
                  key={notice._id}
                  className="px-4 py-3 border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                    {notice.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {notice.body}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notice.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeDropdown;