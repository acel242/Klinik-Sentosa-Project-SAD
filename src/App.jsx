import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';

// Pages
import Registration from './pages/admin/Registration';
import QueueManagement from './pages/admin/QueueManagement';
import Payment from './pages/admin/Payment';
import Transactions from './pages/admin/Transactions';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Examination from './pages/doctor/Examination';
import PatientHistory from './pages/doctor/PatientHistory';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import Prescription from './pages/pharmacy/Prescription';
import Inventory from './pages/pharmacy/Inventory';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useClinic();
  const location = useLocation();

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home Page (Role Based Redirect)
const Home = () => {
  const { user } = useClinic();

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user?.role === 'doctor') return <Navigate to="/doctor/dashboard" />;
  if (user?.role === 'pharmacy') return <Navigate to="/pharmacy/dashboard" />;

  return <div>Welcome, {user?.name}</div>;
};

function App() {
  return (
    <ClinicProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />

              {/* Admin Routes */}
              <Route path="admin">
                <Route path="dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="registration" element={<ProtectedRoute roles={['admin']}><Registration /></ProtectedRoute>} />
                <Route path="queue" element={<ProtectedRoute roles={['admin']}><QueueManagement /></ProtectedRoute>} />
                <Route path="payment" element={<ProtectedRoute roles={['admin']}><Payment /></ProtectedRoute>} />
                <Route path="transactions" element={<ProtectedRoute roles={['admin']}><Transactions /></ProtectedRoute>} />
              </Route>

              {/* Doctor Routes */}
              <Route path="doctor">
                <Route path="dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="examination/:id" element={<ProtectedRoute roles={['doctor']}><Examination /></ProtectedRoute>} />
                <Route path="history" element={<ProtectedRoute roles={['doctor']}><PatientHistory /></ProtectedRoute>} />
              </Route>

              {/* Pharmacy Routes */}
              <Route path="pharmacy">
                <Route path="dashboard" element={<ProtectedRoute roles={['pharmacy']}><PharmacyDashboard /></ProtectedRoute>} />
                <Route path="prescription" element={<ProtectedRoute roles={['pharmacy']}><Prescription /></ProtectedRoute>} />
                <Route path="inventory" element={<ProtectedRoute roles={['pharmacy']}><Inventory /></ProtectedRoute>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </ClinicProvider>
  );
}

export default App;
