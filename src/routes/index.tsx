import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout';
import {
  LoginPage,
  DashboardPage,
  ExperimentsPage,
  ExperimentNewPage,
  ExperimentDetailPage,
  ExperimentDashboardPage,
  TrafficPage,
  MappingPage,
  ConnectorsPage,
  ConnectorNewPage,
  ConnectorMappingPage,
  MetricsPage,
  MappingsPage,
  BuilderListPage,
  BuilderNewPage,
  BuilderEditorPage,
  DashboardViewPage,
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
        path: 'experiments/new',
        element: <ExperimentNewPage />
      },
      {
        path: 'experiments/:id',
        element: <ExperimentDetailPage />
      },
      {
        path: 'experiments/:id/dashboard',
        element: <ExperimentDashboardPage />
      },
      {
        path: 'experiments/:id/traffic',
        element: <TrafficPage />
      },
      {
        path: 'experiments/:id/mapping',
        element: <MappingPage />
      },
      {
        path: 'connectors',
        element: <ConnectorsPage />
      },
      {
        path: 'connectors/new',
        element: <ConnectorNewPage />
      },
      {
        path: 'connectors/:id/mapping',
        element: <ConnectorMappingPage />
      },
      {
        path: 'metrics',
        element: <MetricsPage />
      },
      {
        path: 'mappings',
        element: <MappingsPage />
      },
      {
        path: 'builder',
        element: <BuilderListPage />
      },
      {
        path: 'builder/new',
        element: <BuilderNewPage />
      },
      {
        path: 'builder/:id/edit',
        element: <BuilderEditorPage />
      },
      {
        path: 'dashboards/:id',
        element: <DashboardViewPage />
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
