// Left sidebar with shortcuts and page suggestions
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "./Avatar";
import api from "../../services/api";
import { getRole, getRoleColor } from "../../utils/roleHelpers";

// ─────────────────────────────────────────────────────────────
// Sidebar.jsx — Left Navigation Panel
//
// Appears on every protected page via MainLayout.
// Contains:
//   - Main navigation links
//   - Favourite users (quick access)
//   - Favourite pages (quick access)
//   - Current user info at the bottom
//
// Fixed on left side, hidden on mobile/tablet (lg:block)
// Width: 256px (w-64)
// ─────────────────────────────────────────────────────────────

// ── Nav links config ──────────────────────────────────────────
const NAV_LINKS = [
  {
    path: "/",
    label: "Home",
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/messages",
    label: "Messages",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    path: "/pages",
    label: "Pages",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    path: "/academic",
    label: "Academic",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    path: "/notices",
    label: "Notices",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const { user }   = useAuth();
  const location   = useLocation();

  // ── Favourites state ───────────────────────────────────────
  const [favouriteUsers, setFavouriteUsers] = useState([]);
  const [favouritePages, setFavouritePages] = useState([]);

  // ── Fetch current user's favourites ───────────────────────
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await api.get("/api/users/me");
        const favs = res.data.user?.favourites || {};
        setFavouriteUsers(favs.users || []);
        setFavouritePages(favs.pages || []);
      } catch {
        // silently fail
      }
    };
    if (user) fetchFavourites();
  }, [user]);

  // ── Active link check ──────────────────────────────────────
  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-64 h-full sidebar flex flex-col overflow-y-auto no-scrollbar">

      {/* ── Main Navigation ──────────────────────────────────── */}
      <nav className="px-3 pt-4 pb-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  {/* Icon */}
                  <span className={active ? "text-brand-500" : "text-gray-400 dark:text-gray-500"}>
                    {link.icon}
                  </span>
                  {link.label}

                  {/* Active indicator bar */}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="mx-4 my-2 divider" />

      {/* ── Favourite Users ───────────────────────────────────── */}
      {favouriteUsers.length > 0 && (
        <div className="px-3 py-2">
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Favourite People
          </p>
          <ul className="space-y-0.5">
            {favouriteUsers.slice(0, 5).map((favUser) => (
              <li key={favUser._id}>
                <Link
                  to={`/profile/${favUser._id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  <Avatar user={favUser} size="xs" />
                  <span className="truncate font-medium">{favUser.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Favourite Pages ───────────────────────────────────── */}
      {favouritePages.length > 0 && (
        <div className="px-3 py-2">
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Favourite Pages
          </p>
          <ul className="space-y-0.5">
            {favouritePages.slice(0, 5).map((page) => (
              <li key={page._id}>
                <Link
                  to={`/pages/${page._id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  {/* Page icon */}
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-200 dark:border-brand-900/50 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <span className="truncate font-medium">{page.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Spacer ────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="mx-4 mb-2 divider" />

      {/* ── Current User Info ─────────────────────────────────── */}
      <div className="px-3 pb-4">
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200 group"
        >
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
              {user?.name}
            </p>
            <p className={`text-xs capitalize truncate ${getRoleColor(user)}`}>
              {getRole(user)}
              {user?.department ? ` · ${user.department}` : ""}
            </p>
          </div>
          {/* Arrow icon */}
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

    </div>
  );
};

export default Sidebar;