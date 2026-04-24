import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  ReceiptText, 
  History, 
  TrendingUp, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
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
      { name: 'Staff Management', path: '/users', icon: Users }
    );
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e1a]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col sidebar md:flex">
        <div className="flex h-16 items-center px-6 text-xl font-bold text-teal-500">
          PharmaCenter
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgba(148,163,184,0.12)]">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold uppercase">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link w-full text-red-400 hover:text-red-300">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={toggleMobileMenu}>
          <div className="h-full w-64 flex flex-col sidebar" onClick={e => e.stopPropagation()}>
            <div className="flex h-16 items-center justify-between px-6 text-xl font-bold text-teal-500">
              PharmaCenter
              <button onClick={toggleMobileMenu}><X size={20} className="text-slate-400" /></button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleMobileMenu}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-[rgba(148,163,184,0.12)]">
              <button onClick={logout} className="sidebar-link w-full text-red-400">
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-[rgba(148,163,184,0.12)] px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={toggleMobileMenu}>
              <Menu size={24} className="text-slate-400" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {menuItems.find(i => i.path === location.pathname)?.name || 'Page'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
             </div>
             <div className="h-9 w-9 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold uppercase border border-teal-500/30">
               {user?.name?.[0]}
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
