import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout';
import {
  LoginPage,
  DashboardPage,
  ExperimentsPage,
  ConnectorsPage,
  MappingsPage,
  BuilderPage,
  SettingsPage
} from '../pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'experiments',
        element: <ExperimentsPage />
      },
      {
        path: 'connectors',
        element: <ConnectorsPage />
      },
      {
        path: 'mappings',
        element: <MappingsPage />
      },
      {
        path: 'builder',
        element: <BuilderPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/app/dashboard" replace />
  }
]);
