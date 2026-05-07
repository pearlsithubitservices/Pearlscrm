import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IndustryProvider } from './context/IndustryContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadManagement from './pages/LeadManagement';
import Tasks from './pages/Tasks';
import FollowUps from './pages/FollowUps';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Login from './pages/Login';

// Placeholder components for Phase 3
function PlaceholderPage({ title }) {
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-500 italic">This module is coming soon in Phase 3 of the MVP.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <IndustryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<LeadManagement />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<PlaceholderPage title="Business Intelligence Reports" />} />
              <Route path="/settings" element={<PlaceholderPage title="System Settings" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </IndustryProvider>
    </AuthProvider>
  );
}
