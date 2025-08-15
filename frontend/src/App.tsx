import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { SecurityQuestionsHelpPage } from './pages/SecurityQuestionsHelpPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpenseFormPage } from './pages/ExpenseFormPage';
import { ExpenseTablePage } from './pages/ExpenseTablePage';
import { ManagementIndexPage } from './pages/ManagementIndexPage';
import { ManagementPage } from './pages/ManagementPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  return (
    <MantineProvider>
      <Notifications />
      <AuthProvider>
        <CompanyProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              
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
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/security-help" 
                element={
                  <ProtectedRoute>
                    <SecurityQuestionsHelpPage />
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
                path="/management" 
                element={
                  <ProtectedRoute>
                    <ManagementIndexPage />
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
