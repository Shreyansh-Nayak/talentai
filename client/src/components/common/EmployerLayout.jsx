import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard',    icon: '◉', path: '/employer/dashboard' },
  { label: 'Post a Job',   icon: '✚', path: '/employer/post-job'  },
  { label: 'My Job Posts', icon: '📋', path: '/employer/jobs'     },
  { label: 'Applicants',   icon: '👥', path: '/employer/applicants'},
];

const aiItems = [
  { label: 'JD Generator', icon: '✨', path: '/employer/jd-generator' },
];

const accountItems = [
  { label: 'Company Profile', icon: '🏢', path: '/employer/company' },
];

export default function EmployerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2 ${
        isActive(item.path)
          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
          : 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <span className="text-base w-5 text-center">{item.icon}</span>
      {item.label}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* User Info */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-yellow-500/70">Employer Account</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="text-xs text-gray-600 px-4 py-2 uppercase tracking-widest font-semibold">
          Hiring
        </div>
        {navItems.map((item) => <NavLink key={item.path} item={item} />)}

        <div className="text-xs text-gray-600 px-4 py-2 mt-4 uppercase tracking-widest font-semibold">
          AI Tools
        </div>
        {aiItems.map((item) => <NavLink key={item.path} item={item} />)}

        <div className="text-xs text-gray-600 px-4 py-2 mt-4 uppercase tracking-widest font-semibold">
          Account
        </div>
        {accountItems.map((item) => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-800">
          <Link to="/" className="text-lg font-extrabold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            ⚡ TalentAI
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-between">
              <span className="text-lg font-extrabold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                ⚡ TalentAI
              </span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white text-xl">☰</button>
          <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            ⚡ TalentAI
          </span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}