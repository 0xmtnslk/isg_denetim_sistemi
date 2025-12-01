import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import UsersPage from '@/pages/UsersPage';
import GroupsPage from '@/pages/GroupsPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import QuestionsPage from '@/pages/QuestionsPage';
import TemplatesPage from '@/pages/TemplatesPage';
import AuditsPage from '@/pages/AuditsPage';
import NewAuditPage from '@/pages/NewAuditPage';
import AuditDetailPage from '@/pages/AuditDetailPage';
import StatisticsPage from '@/pages/StatisticsPage';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Protected Route
  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="groups" element={<ProtectedRoute adminOnly><GroupsPage /></ProtectedRoute>} />
        <Route path="facilities" element={<ProtectedRoute adminOnly><FacilitiesPage /></ProtectedRoute>} />
        <Route path="questions" element={<ProtectedRoute adminOnly><QuestionsPage /></ProtectedRoute>} />
        <Route path="templates" element={<ProtectedRoute adminOnly><TemplatesPage /></ProtectedRoute>} />
        <Route path="audits" element={<AuditsPage />} />
        <Route path="audits/new" element={<NewAuditPage />} />
        <Route path="audits/:id" element={<AuditDetailPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
