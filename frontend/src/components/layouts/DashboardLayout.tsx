import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Users, Building2, FileQuestion, FileText, ClipboardList, 
  BarChart3, LogOut, Menu, X 
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    toast.success('Çıkış yapıldı');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: Home, label: 'Ana Sayfa', roles: ['ADMIN', 'ISG_UZMANI', 'DENETCI'] },
    { path: '/users', icon: Users, label: 'Kullanıcılar', roles: ['ADMIN'] },
    { path: '/groups', icon: Building2, label: 'Gruplar', roles: ['ADMIN'] },
    { path: '/questions', icon: FileQuestion, label: 'Soru Havuzu', roles: ['ADMIN'] },
    { path: '/templates', icon: FileText, label: 'Şablonlar', roles: ['ADMIN'] },
    { path: '/audits', icon: ClipboardList, label: 'Denetimler', roles: ['ADMIN', 'ISG_UZMANI', 'DENETCI'] },
    { path: '/statistics', icon: BarChart3, label: 'İstatistikler', roles: ['ADMIN', 'ISG_UZMANI'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold">İSG Denetim</h2>
        </div>
        <nav className="mt-6">
          {filteredMenuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-6 py-3 hover:bg-blue-700 ${isActive(item.path) ? 'bg-blue-700 border-r-4 border-white' : ''}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t border-blue-700">
          <p className="font-semibold">{user?.fullName}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 mt-2">
            <LogOut className="w-4 h-4" />
            Çıkış
          </button>
        </div>
      </aside>
      <div className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow-sm px-6 py-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
