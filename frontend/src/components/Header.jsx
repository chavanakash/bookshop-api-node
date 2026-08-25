import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header({ theme, onToggleTheme, cartCount, onOpenCart }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg shadow-lg shadow-violet-500/30">
            📖
          </span>
          <p className="font-display text-lg font-semibold leading-none text-slate-900 dark:text-white">
            Book
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Nook
            </span>
          </p>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
          <Link to="/" className="transition hover:text-violet-600 dark:hover:text-violet-400">
            Shop
          </Link>
          <Link
            to="/warehouse"
            className="transition hover:text-violet-600 dark:hover:text-violet-400"
          >
            Warehouse
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="hidden text-sm font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 sm:block"
              title={user?.email}
            >
              Log out{user?.name ? ` (${user.name})` : ""}
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400 sm:block"
            >
              Log in
            </Link>
          )}

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
