import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Avatar from "./Avatar";
import Logo from "./Logo";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import { useTheme } from "../../App";

// ─────────────────────────────────────────────────────────────
// Navbar.jsx — Top Navigation Bar (Metrovia branding)
// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  {
    path: "/",
    label: "Home",
    exact: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/messages",
    label: "Messages",
    exact: false,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    path: "/pages",
    label: "Pages",
    exact: false,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    path: "/academic",
    label: "Academic",
    exact: false,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
];

const UNREAD_POLL = 10000;

const Navbar = () => {
  const { user, logout }       = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate               = useNavigate();
  const location               = useLocation();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState({ users: [], pages: [] });
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [showSearch,     setShowSearch]     = useState(false);
  const searchRef   = useRef(null);
  const searchTimer = useRef(null);

  const [notices,     setNotices]     = useState([]);
  const [showNotices, setShowNotices] = useState(false);
  const noticeRef = useRef(null);

  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const userMenuRef = useRef(null);

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const unreadPollRef = useRef(null);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const res   = await api.get("/api/messages/conversations");
      const convs = res.data.conversations || [];
      const count = convs.filter((c) => {
        const lastMsg = c.lastMessage;
        return lastMsg && !lastMsg.isRead && lastMsg.sender?._id !== user?._id;
      }).length;
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  };

  // Fetch notices
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get("/api/notices");
        setNotices(res.data.notices || []);
      } catch { /* silently fail */ }
    };
    fetchNotices();
  }, []);

  // Poll unread count
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    unreadPollRef.current = setInterval(fetchUnreadCount, UNREAD_POLL);
    return () => { if (unreadPollRef.current) clearInterval(unreadPollRef.current); };
  }, [user?._id]);

  // Reset unread when on messages page
  useEffect(() => {
    if (location.pathname === "/messages") setUnreadCount(0);
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (searchRef.current   && !searchRef.current.contains(e.target))   setShowSearch(false);
      if (noticeRef.current   && !noticeRef.current.contains(e.target))   setShowNotices(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Search with debounce
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults({ users: [], pages: [] }); setShowSearch(false); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      setShowSearch(true);
      try {
        const [usersRes, pagesRes] = await Promise.all([
          api.get(`/api/users/search?q=${q}`),
          api.get(`/api/pages/search?q=${q}`),
        ]);
        setSearchResults({ users: usersRes.data.users || [], pages: pagesRes.data.pages || [] });
      } catch { /* silently fail */ } finally { setSearchLoading(false); }
    }, 400);
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleSearchResultClick = (path) => {
    setShowSearch(false);
    setSearchQuery("");
    navigate(path);
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-panel border-b border-light-border dark:border-dark-border flex items-center px-4 gap-3">

      {/* ── Metrovia Logo ─────────────────────────────────────── */}
      <Link to="/" className="shrink-0 hover:opacity-80 transition-opacity">
        <Logo size="sm" variant="full" />
      </Link>

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="flex-1 max-w-md mx-auto relative" ref={searchRef}>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search people or pages..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-light-panel dark:bg-dark-card border border-light-border dark:border-dark-border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all duration-200"
          />
        </div>

        {/* Search dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-card-hover overflow-hidden animate-fade-in">
            {searchLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
            ) : (
              <>
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">People</p>
                    {searchResults.users.slice(0, 4).map((u) => (
                      <button key={u._id} onClick={() => handleSearchResultClick(`/profile/${u._id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                        <Avatar user={u} size="sm" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{u.role}{u.department ? ` · ${u.department}` : ""}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.pages.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</p>
                    {searchResults.pages.slice(0, 3).map((p) => (
                      <button key={p._id} onClick={() => handleSearchResultClick(`/pages/${p._id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                        <Avatar user={{ name: p.name, avatar: p.avatar }} size="sm" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.members?.length || 0} members</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.users.length === 0 && searchResults.pages.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-400">No results for "{searchQuery}"</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right side ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link
                key={link.path}
                to={link.path}
                title={link.label}
                className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${active ? "text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover"}`}
              >
                {link.icon(active)}
                {link.path === "/messages" && unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* ── Dark mode toggle ──────────────────────────────────
            Sun icon = currently light → click to go dark
            Moon icon = currently dark → click to go light
        ──────────────────────────────────────────────────── */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200"
        >
          {isDark ? (
            // Sun icon — shown in dark mode to switch to light
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Moon icon — shown in light mode to switch to dark
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notice bell */}
        <div className="relative" ref={noticeRef}>
          <button
            onClick={() => { setShowNotices((p) => !p); setShowUserMenu(false); }}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${showNotices ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover"}`}
            title="Notices"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notices.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
          </button>

          {showNotices && (
            <div className="absolute top-full right-0 mt-2 w-80 z-50 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-card-hover overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notices</h3>
                <Link to="/notices" onClick={() => setShowNotices(false)} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</Link>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No notices yet</div>
                ) : (
                  notices.slice(0, 5).map((notice) => (
                    <div key={notice._id} className="px-4 py-3 border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{notice.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notice.body}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(notice.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative ml-1" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu((p) => !p); setShowNotices(false); }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200"
          >
            <Avatar user={user} size="sm" />
            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 z-50 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-card-hover overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user?.role}{user?.department ? ` · ${user.department}` : ""}</p>
              </div>
              <div className="py-1.5">
                <Link to={`/profile/${user?._id}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Profile
                </Link>
                <Link to="/messages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/notices" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Notices
                </Link>
                <div className="my-1.5 border-t border-light-border dark:border-dark-border" />
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setShowMobileMenu((p) => !p)} className="md:hidden p-2.5 rounded-xl text-gray-500 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ml-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showMobileMenu
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {showMobileMenu && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-dark-panel border-b border-light-border dark:border-dark-border shadow-card-hover animate-fade-in md:hidden">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link key={link.path} to={link.path} onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors border-b border-light-border dark:border-dark-border last:border-0 ${active ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover"}`}
              >
                {link.icon(active)}
                {link.label}
                {link.path === "/messages" && unreadCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;