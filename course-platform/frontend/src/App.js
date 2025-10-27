import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/admin/*"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/professor/*"
              element={
                <PrivateRoute allowedRoles={['professor']}>
                  <ProfessorDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/student/*"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            
            <Route path="/unauthorized" element={<div className="error-page">Unauthorized Access</div>} />
            <Route path="*" element={<div className="error-page">Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
