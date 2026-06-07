import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useDueNotifier } from '../hooks/useDueNotifier.js';

const linkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700',
  ].join(' ');

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  useDueNotifier(Boolean(user));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-brand-600">
            <span>PlanIt</span>
          </NavLink>
          <nav className="flex flex-1 items-center gap-1 px-4">
            <NavLink to="/" end className={linkClass}>대시보드</NavLink>
            <NavLink to="/calendar" className={linkClass}>캘린더</NavLink>
            <NavLink to="/tasks" className={linkClass}>할 일</NavLink>
            <NavLink to="/events" className={linkClass}>일정</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost" aria-label="테마 전환">
              {theme === 'dark' ? '☀︎ Light' : '☾ Dark'}
            </button>
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
