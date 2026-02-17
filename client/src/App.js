import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './config/theme';
import { AuthProvider } from './context/AuthContext';
import VerifyEmail from './pages/auth/VerifyEmail';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// --- UTILS ---
import ScrollToTop from './utils/ScrollToTop';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ContactPage from './pages/public/ContactPage';
import AboutPage from './pages/public/AboutPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';

// Private Dashboards (Patient)
import PatientLayout from './components/Layout/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import TreatmentHistory from './pages/patient/TreatmentHistory';
import Messages from './pages/patient/Messages';
import PaymentHistory from './pages/patient/PaymentHistory';
import Profile from './pages/patient/ProfileSettings';

// Private Dashboards (Dentist)
import DentistLayout from './components/Layout/DentistLayout';
import DentistDashboard from './pages/dentist/Dashboard';
import DentistAppointments from './pages/dentist/Appointments';
import DentistTreatments from './pages/dentist/Treatments';
import Patients from './pages/dentist/Patients';
import Inventory from './pages/dentist/Inventory';
import DentistMessages from './pages/patient/Messages';
import DentistProfile from './pages/dentist/Profile';

// Private Dashboards (Admin)
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminInventory from './pages/admin/Inventory';
import AdminFinancial from './pages/admin/Financial';
import AdminReports from './pages/admin/Reports';
import AddDentist from './pages/admin/AddDentist';

import DentistSetup from './pages/auth/DentistSetup';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes CSS */}
      <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dentist/setup-password" element={<DentistSetup />} />

          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient" element={<PatientLayout />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="appointments" element={<BookAppointment />} /> 
              <Route path="treatments" element={<TreatmentHistory />} />   
              <Route path="messages" element={<Messages />} />  
              <Route path="payments" element={<PaymentHistory />} />   
              <Route path="profile" element={<Profile />} />      
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['dentist']} />}>
            <Route path="/dentist" element={<DentistLayout />}>
              <Route path="dashboard" element={<DentistDashboard />} />
              <Route path="appointments" element={<DentistAppointments />} />
              <Route path="treatments" element={<DentistTreatments />} />
              <Route path="patients" element={<Patients />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="messages" element={<DentistMessages />} />
              <Route path="profile" element={<DentistProfile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} /> 
              <Route path="patients" element={<AdminPatients />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="financial" element={<AdminFinancial />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="add-dentist" element={<AddDentist />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
