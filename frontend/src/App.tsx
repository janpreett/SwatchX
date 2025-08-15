import { MantineProvider, createTheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
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

// High contrast color palette
const highContrastBlue: MantineColorsTuple = [
  '#e3f2ff',
  '#c7e2ff',
  '#8cc8ff',
  '#4dabff',
  '#1b93fe',
  '#007fff', // Primary blue for high contrast
  '#0066cc',
  '#004d99',
  '#003366',
  '#001a33'
];

function AppContent() {
  const { isDarkMode } = useTheme();
  
  // Create theme configuration
  const theme = createTheme({
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    colors: isDarkMode ? {
      blue: highContrastBlue,
    } : {},
    other: {
      isDarkMode,
    }
  });
  
  return (
    <MantineProvider theme={theme} forceColorScheme={isDarkMode ? 'dark' : 'light'}>
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
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
