import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { ExpenseTablePage } from './pages/ExpenseTablePage';
import { ManagementPage } from './pages/ManagementPage';
import { NotFoundPage } from './pages/NotFoundPage';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <CompanyProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/forms/:category" 
                element={
                  <ProtectedRoute>
                    <ExpenseFormPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/tables/:category" 
                element={
                  <ProtectedRoute>
                    <ExpenseTablePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/management/:type" 
                element={
                  <ProtectedRoute>
                    <ManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </CompanyProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
