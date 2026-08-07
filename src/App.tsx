import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Lazy load pages for performance
const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const AnamnesisForm = React.lazy(() => import('./pages/anamnesis/AnamnesisForm'));
const DraPatricia = React.lazy(() => import('./pages/dra-patricia/DraPatricia'));
const Login = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

function App() {
  return (
    <AuthProvider>
      <Router>
      <React.Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-clinic-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="agendar" element={<AnamnesisForm />} />
            <Route path="dra-patricia" element={<DraPatricia />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              {/* Other admin management routes would go here */}
            </Route>
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
    </AuthProvider>
  );
}

export default App;
