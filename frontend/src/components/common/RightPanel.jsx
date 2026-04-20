// Right sidebar with suggestions and pinned notices
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "./Avatar";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

// ─────────────────────────────────────────────────────────────
// RightPanel.jsx — Right Side Panel
//
// Appears on every protected page via MainLayout.
// Only visible on xl screens (1280px+).
// Contains:
//   - Suggested people to connect with
//   - Latest notices preview
// Width: 288px (w-72)
// ─────────────────────────────────────────────────────────────

const RightPanel = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  // ── State ──────────────────────────────────────────────────
  const [suggestedUsers,  setSuggestedUsers]  = useState([]);
  const [notices,         setNotices]         = useState([]);
  const [loadingUsers,    setLoadingUsers]    = useState(true);
  const [loadingNotices,  setLoadingNotices]  = useState(true);
  const [favouriting,     setFavouriting]     = useState(null); // ID of user being favourited

  // ── Fetch suggested users ──────────────────────────────────
  // Search for common letters to get a mix of users
  // Exclude the current user from results
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        // Fetch users with a broad search
        const res = await api.get("/api/users/search?q=a");
        const all = res.data.users || [];
        // Filter out the current user
        const filtered = all.filter((u) => u._id !== user?._id).slice(0, 5);
        setSuggestedUsers(filtered);
      } catch {
        // silently fail
      } finally {
        setLoadingUsers(false);
      }
    };
    if (user) fetchSuggested();
  }, [user]);

  // ── Fetch latest notices ───────────────────────────────────
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get("/api/notices");
        setNotices((res.data.notices || []).slice(0, 3));
      } catch {
        // silently fail
      } finally {
        setLoadingNotices(false);
      }
    };
    fetchNotices();
  }, []);

  // ── Toggle favourite a user ────────────────────────────────
  const handleFavourite = async (targetId) => {
    setFavouriting(targetId);
    try {
      await api.post(`/api/users/favourites/user/${targetId}`);
      // Remove from suggestions after favouriting
      setSuggestedUsers((prev) => prev.filter((u) => u._id !== targetId));
    } catch {
      // silently fail
    } finally {
      setFavouriting(null);
    }
  };

  // ── Skeleton loader ────────────────────────────────────────
  const SkeletonRow = () => (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="w-8 h-8 rounded-full skeleton shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 rounded skeleton w-3/4" />
        <div className="h-2.5 rounded skeleton w-1/2" />
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-72 h-full overflow-y-auto no-scrollbar px-3 pt-4 pb-6 space-y-4">

      {/* ── Suggested People ─────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            People you may know
          </h3>
          <Link
            to="/pages"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            See all
          </Link>
        </div>

        {/* User list */}
        <div className="py-1.5">
          {loadingUsers ? (
            // Skeleton loading state
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : suggestedUsers.length === 0 ? (
            <p className="px-4 py-4 text-xs text-gray-400 text-center">
              No suggestions right now
            </p>
          ) : (
            suggestedUsers.map((suggestedUser) => (
              <div
                key={suggestedUser._id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors group"
              >
                {/* Avatar — click to go to profile */}
                <button
                  onClick={() => navigate(`/profile/${suggestedUser._id}`)}
                  className="shrink-0"
                >
                  <Avatar user={suggestedUser} size="sm" />
                </button>

                {/* Name + role */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${suggestedUser._id}`)}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                    {suggestedUser.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize truncate">
                    {suggestedUser.role}
                    {suggestedUser.department ? ` · ${suggestedUser.department}` : ""}
                  </p>
                </div>

                {/* Favourite button */}
                <button
                  onClick={() => handleFavourite(suggestedUser._id)}
                  disabled={favouriting === suggestedUser._id}
                  className="
                    shrink-0 p-1.5 rounded-lg
                    text-gray-400 hover:text-brand-500
                    hover:bg-brand-50 dark:hover:bg-brand-900/20
                    transition-all duration-200
                    disabled:opacity-50
                  "
                  title="Add to favourites"
                >
                  {favouriting === suggestedUser._id ? (
                    // Mini spinner
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    // Add/star icon
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Latest Notices ────────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Latest Notices
          </h3>
          <Link
            to="/notices"
            className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Notice list */}
        <div className="py-1.5">
          {loadingNotices ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : notices.length === 0 ? (
            <p className="px-4 py-4 text-xs text-gray-400 text-center">
              No notices yet
            </p>
          ) : (
            notices.map((notice) => (
              <Link
                key={notice._id}
                to="/notices"
                className="block px-4 py-3 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors border-b border-light-border dark:border-dark-border last:border-0"
              >
                {/* Notice dot + title */}
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
                    {notice.title}
                  </p>
                </div>
                {/* Date */}
                <p className="text-xs text-gray-400 mt-1 ml-3.5">
                  {formatDate(notice.createdAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-400 px-4">
        © {new Date().getFullYear()} CampusConnect
      </p>

    </div>
  );
};

export default RightPanel;