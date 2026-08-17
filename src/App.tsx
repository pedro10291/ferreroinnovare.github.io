import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/ScrollToTop';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Lazy load pages for performance
const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const AnamnesisForm = React.lazy(() => import('./pages/anamnesis/AnamnesisForm').then(module => ({ default: module.AnamnesisForm })));
const DraPatricia = React.lazy(() => import('./pages/dra-patricia/DraPatricia'));
const ProcedurePage = React.lazy(() => import('./pages/procedures/ProcedurePage').then(module => ({ default: module.ProcedurePage })));
const TreatmentsCatalog = React.lazy(() => import('./pages/procedures/TreatmentsCatalog').then(module => ({ default: module.TreatmentsCatalog })));
const Login = React.lazy(() => import('./pages/admin/Login'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminProcedures = React.lazy(() => import('./pages/admin/ProceduresAdmin').then(module => ({ default: module.ProceduresAdmin })));
const AdminContactRequests = React.lazy(() => import('./pages/admin/ContactRequests'));
const AdminAgenda = React.lazy(() => import('./pages/admin/Agenda').then(module => ({ default: module.Agenda })));
const AdminPatients = React.lazy(() => import('./pages/admin/Patients').then(module => ({ default: module.Patients })));
const AdminPatientForm = React.lazy(() => import('./pages/admin/PatientForm').then(module => ({ default: module.PatientForm })));
const AdminPatientDetails = React.lazy(() => import('./pages/admin/PatientDetails').then(module => ({ default: module.PatientDetails })));
const AdminGallery = React.lazy(() => import('./pages/admin/Gallery').then(module => ({ default: module.Gallery })));
const AdminTeam = React.lazy(() => import('./pages/admin/Team').then(module => ({ default: module.Team })));

function App() {
  return (
    <AuthProvider>
      <Router>
      <React.Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-clinic-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
        </div>
      }>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="agendar" element={<AnamnesisForm />} />
            <Route path="dra-patricia" element={<DraPatricia />} />
            <Route path="procedimentos/:slug" element={<ProcedurePage />} />
            <Route path="tratamentos" element={<TreatmentsCatalog />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="procedimentos" element={<AdminProcedures />} />
              <Route path="solicitacoes" element={<AdminContactRequests />} />
              <Route path="agenda" element={<AdminAgenda />} />
              <Route path="pacientes" element={<AdminPatients />} />
              <Route path="pacientes/new" element={<AdminPatientForm />} />
              <Route path="pacientes/:id" element={<AdminPatientDetails />} />
              <Route path="galeria" element={<AdminGallery />} />
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="equipe" element={<AdminTeam />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </React.Suspense>
    </Router>
    </AuthProvider>
  );
}

export default App;
