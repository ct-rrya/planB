import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileCheck, 
  Megaphone, 
  BarChart3, 
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/residents', label: 'Residents', icon: Users },
    { to: '/requests', label: 'Requests', icon: FileText },
    { to: '/documents', label: 'Documents', icon: FileCheck },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A2947' }}>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary bg-opacity-60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Widths: 260px expanded, 72px collapsed */}
      <aside 
        className={`
          ${isSidebarExpanded ? 'w-[260px]' : 'w-[72px]'} 
          bg-primary min-h-screen fixed left-0 top-0 flex flex-col shadow-elevated z-50 transition-all duration-300
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Brand - Compact */}
        <div className="h-[72px] px-4 border-b border-primary-700 flex items-center justify-between flex-shrink-0">
          {isSidebarExpanded ? (
            <>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-white truncate">Barangay Service</h1>
                <p className="text-xs text-primary-100 truncate">Management System</p>
              </div>
              <button
                onClick={() => setIsSidebarExpanded(false)}
                className="hidden lg:flex items-center justify-center w-8 h-8 text-white hover:bg-primary-700 rounded-lg transition-colors flex-shrink-0 ml-2"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsSidebarExpanded(true)}
              className="hidden lg:flex items-center justify-center w-10 h-10 text-white hover:bg-primary-700 rounded-lg transition-colors mx-auto"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 text-white hover:bg-primary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Vertically Centered with Proper Spacing */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center ${isSidebarExpanded ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-soft'
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                  }`
                }
                title={!isSidebarExpanded ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section - Fixed at Bottom, Compact */}
        <div className={`px-3 py-3 border-t border-primary-700 flex-shrink-0 ${!isSidebarExpanded ? 'px-2' : ''}`}>
          {isSidebarExpanded ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                  <p className="text-xs text-primary-200 truncate capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary-800 hover:bg-red-600 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-sm">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 text-white bg-primary-800 hover:bg-red-600 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarExpanded ? 'lg:ml-[260px]' : 'lg:ml-[72px]'} transition-all duration-300 min-h-screen`} style={{ backgroundColor: '#F5F5F5' }}>
        {/* Top Bar - Fixed Height: 72px */}
        <header className="bg-white shadow-soft sticky top-0 z-30 border-b border-secondary h-[72px] flex items-center">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 text-primary hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex-1 lg:flex-initial min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-primary truncate">
                  Administrator Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-secondary-700 truncate">
                  Manage barangay services and residents
                </p>
              </div>
              
              <div className="hidden sm:flex items-center">
                <div className="px-3 py-1.5 bg-accent-50 border border-accent-200 rounded-lg">
                  <p className="text-xs font-medium text-accent-800 whitespace-nowrap">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Centered with Max Width */}
        <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
