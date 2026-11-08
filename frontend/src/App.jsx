import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Common/Toast';
import { Layout } from './components/Layout/Layout';

import { Overview } from './pages/Overview';
import { CreateCampaign } from './pages/CreateCampaign';
import { MyCampaigns } from './pages/MyCampaigns';
import { GeneratedPins } from './pages/GeneratedPins';
import { PublishingCalendar } from './pages/PublishingCalendar';
import { PinterestAccounts } from './pages/PinterestAccounts';
import { Analytics } from './pages/Analytics';
import { Instructions } from './pages/Instructions';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <span>Authenticating PinPilot AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Overview />} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
                <Route path="/campaigns" element={<MyCampaigns />} />
                <Route path="/pins" element={<GeneratedPins />} />
                <Route path="/calendar" element={<PublishingCalendar />} />
                <Route path="/pinterest-accounts" element={<PinterestAccounts />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/instructions" element={<Instructions />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
