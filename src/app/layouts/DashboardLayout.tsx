import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, FolderTree, Truck, Smartphone, 
  ArrowDownToLine, ArrowUpFromLine, Scale, AlertTriangle, 
  BarChart3, Settings, Search, Bell, User, LogOut, Menu
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../store/AuthContext';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Categories', icon: FolderTree, path: '/categories' },
  { name: 'Suppliers', icon: Truck, path: '/suppliers' },
  { name: 'Products', icon: Smartphone, path: '/products' },
  { name: 'Stock In', icon: ArrowDownToLine, path: '/stock-in' },
  { name: 'Stock Out', icon: ArrowUpFromLine, path: '/stock-out' },
  { name: 'Stock Balance', icon: Scale, path: '/stock-balance' },
  { name: 'Low Stock', icon: AlertTriangle, path: '/low-stock' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-300
        lg:static lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Smartphone className="h-8 w-8 text-blue-600 mr-2" />
          <span className="text-lg font-bold text-slate-900 tracking-tight">V2 Phone Arcade</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Global Search..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              <User className="h-5 w-5" />
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Sign out"
              className="p-2 text-slate-400 hover:text-red-600 transition-colors hidden sm:block"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
