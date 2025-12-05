import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';

const navItems = [
  { to: '/pf/dashboard', label: 'Dashboard' },
  { to: '/pf/vendors', label: 'Vendors' },
  { to: '/pf/tenders', label: 'Tenders' },
];

const ProcureFlixLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-white font-semibold text-lg">
              PF
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">ProcureFlix</div>
              <div className="text-xs text-slate-400">Next-gen procurement</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="mb-2">
            <div className="font-medium text-slate-200 text-sm">{user?.email || 'User'}</div>
            <div className="text-xs text-slate-400">ProcureFlix</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-slate-300 hover:text-white hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-900">ProcureFlix</h1>
            <p className="text-xs text-slate-500">Vendors & Tenders</p>
          </div>
          <div className="text-xs text-slate-500">
            Logged in as <span className="font-medium">{user?.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProcureFlixLayout;
