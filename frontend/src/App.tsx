import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Agents from './pages/Agents';
import Permissions from './pages/Permissions';
import Approvals from './pages/Approvals';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Policies from './pages/Policies';
import Settings from './pages/Settings';
import QAChat from './pages/QAChat';
import Employees from './pages/Employees';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — redirect to dashboard if already logged in */}
        <Route path="/login" element={
          localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        {/* Protected routes — require JWT token */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="agents" element={<Agents />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="policies" element={<Policies />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="logs" element={<Logs />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="qa" element={<QAChat />} />
          <Route path="employees" element={<Employees />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
