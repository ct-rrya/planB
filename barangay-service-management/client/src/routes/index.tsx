import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Residents from '@/pages/Residents';
import Requests from '@/pages/Requests';
import Documents from '@/pages/Documents';
import Announcements from '@/pages/Announcements';
import Reports from '@/pages/Reports';
import AuditLogs from '@/pages/AuditLogs';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'residents',
            element: <Residents />,
          },
          {
            path: 'requests',
            element: <Requests />,
          },
          {
            path: 'documents',
            element: <Documents />,
          },
          {
            path: 'announcements',
            element: <Announcements />,
          },
          {
            path: 'reports',
            element: <Reports />,
          },
          {
            path: 'audit-logs',
            element: <AuditLogs />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
