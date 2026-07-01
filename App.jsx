import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SubjectsPage from './pages/SubjectsPage';
import StudentsPage from './pages/StudentsPage';
import SettingsPage from './pages/SettingsPage';
import GuruDashboard from './pages/GuruDashboard';
import MuridDashboard from './pages/MuridDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
  
  return children;
};

const DashboardRouter = () => {
  const { role } = useAuth();
  
  if (role === 'ADMIN') return <AdminDashboard />;
  if (role === 'GURU') return <GuruDashboard />;
  if (role === 'MURID') return <MuridDashboard />;
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subjects" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SubjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GURU']}>
                <StudentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          {/* Specific routes if needed */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
