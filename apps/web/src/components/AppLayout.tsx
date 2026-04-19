import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold text-slate-900">stocktrace</span>
            <nav className="flex items-center gap-2 text-sm">
              <NavItem to="/stocks">Stocks</NavItem>
              <NavItem to="/profile">Profile</NavItem>
              {isAdmin && <NavItem to="/admin/users">Users</NavItem>}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{user?.email}</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium uppercase">
              {user?.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded transition-colors ${
          isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
