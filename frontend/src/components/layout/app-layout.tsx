import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  History,
  ReceiptText,
  TrendingUp,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Medicines', path: '/medicines', icon: Pill },
    { name: 'POS', path: '/pos', icon: ShoppingCart },
    { name: 'Sales History', path: '/sales', icon: History },
  ];

  if (isAdmin) {
    menuItems.push(
      { name: 'Expenses', path: '/expenses', icon: ReceiptText },
      { name: 'Reports', path: '/reports', icon: TrendingUp },
      { name: 'Staff', path: '/users', icon: Users }
    );
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          navigate('/pos');
          break;
        case 'F3':
          e.preventDefault();
          navigate('/medicines');
          break;
        case 'F4':
          e.preventDefault();
          navigate('/expenses');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const currentPage = menuItems.find(i => i.path === location.pathname)?.name || 'Page';

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-body)]">
      {/* Sidebar — Desktop */}
      <aside
        className={`hidden md:flex flex-col sidebar ${sidebarExpanded ? 'w-56' : 'w-16'}`}
        style={{ transition: 'width 0.2s ease' }}
      >
        {/* Logo */}
        <div className="flex h-14 items-center px-4 border-b border-white/10 shrink-0">
          {sidebarExpanded ? (
            <span className="text-lg font-bold text-white tracking-tight">💊 PharmaCenter</span>
          ) : (
            <span className="text-lg mx-auto">💊</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              title={item.name}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarExpanded && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="flex items-center justify-center h-10 border-t border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          {sidebarExpanded && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 transition-colors"
            title="Logout"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="h-full w-64 flex flex-col sidebar shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between px-4 border-b border-white/10 shrink-0">
              <span className="text-lg font-bold text-white tracking-tight">💊 PharmaCenter</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <item.icon size={18} className="shrink-0" />
                  <span className="flex-1">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-white/10">
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="sidebar-link w-full text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={18} className="shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-[var(--border-light)] bg-[var(--bg-header)] px-4 md:px-6 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              className="md:hidden p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">{currentPage}</h2>
          </div>

          {/* Quick Action Toolbar - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => navigate('/pos')}
              className="btn btn-primary btn-sm"
              title="New Sale (F2)"
            >
              <Plus size={14} /> New Sale <span className="shortcut">F2</span>
            </button>
            <button
              onClick={() => navigate('/medicines')}
              className="btn btn-secondary btn-sm"
              title="Inventory (F3)"
            >
              <Pill size={14} /> Inventory <span className="shortcut">F3</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/expenses')}
                className="btn btn-secondary btn-sm"
                title="Expenses (F4)"
              >
                <ReceiptText size={14} /> Expense <span className="shortcut">F4</span>
              </button>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:block text-right min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize truncate">{user?.role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold uppercase flex-shrink-0">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Status Bar - Desktop Only */}
        <div className="status-bar shrink-0 hidden md:flex">
          <div className="status-item">
            <span className="opacity-60">Logged in as:</span>
            <span className="font-medium">{user?.name}</span>
            <span className="opacity-40">({user?.role})</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="status-item">
              <span className="opacity-60">Shortcuts:</span>
              <span>F2 Sale</span>
              <span className="opacity-30">|</span>
              <span>F3 Inventory</span>
              <span className="opacity-30">|</span>
              <span>F4 Expense</span>
            </div>
            <div className="status-item">
              <span className="opacity-60">
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
