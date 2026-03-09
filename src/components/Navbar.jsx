import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [searchParams, location.pathname]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    if (userMenuOpen) document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (location.pathname === "/dashboard") {
      if (v.trim()) setSearchParams({ q: v.trim() }, { replace: true });
      else setSearchParams({}, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (location.pathname !== "/dashboard") navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        location.pathname === to
          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800/80"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 glass-card border-b border-zinc-200 dark:border-white/5 bg-white/90 dark:bg-zinc-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-3 h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              ♪
            </div>
            <span className="text-lg font-bold tracking-tight">
              Music<span className="text-emerald-500">Play</span>
            </span>
     </Link>

          {/* Search bar - logged in */}
          {user && (
            <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); }} className="hidden sm:flex flex-1 max-w-md mx-4 min-w-0">
              <div className="relative w-full group">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search songs, artists..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 text-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); if (location.pathname === "/dashboard") setSearchParams({}, { replace: true }); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {!user ? (
              <>
                <NavLink to="/">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/liked">Liked</NavLink>
                {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
                <NavLink to="/playlists">Playlists</NavLink>
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                    title="Menu"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 py-1.5 min-w-[160px] rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 transition rounded-lg mx-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800/80 transition"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-white/5 animate-fadeSlideUp space-y-4">
            {user && (
              <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(e); setMobileMenuOpen(false); }} className="px-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
                  />
                </div>
              </form>
            )}
            <div className="flex flex-col gap-1">
              {!user ? (
                <>
                  <NavLink to="/">Login</NavLink>
                  <NavLink to="/register">Register</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/liked">Liked</NavLink>
                  {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
                  <NavLink to="/playlists">Playlists</NavLink>
            <button
              onClick={handleLogout}
                    className="text-left px-4 py-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                  >
              Logout
         </button>
     </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
