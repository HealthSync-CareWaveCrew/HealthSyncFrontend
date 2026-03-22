import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LandingPage from "../pages/LandingPage";
import AuthPage from '../pages/AuthPage';
import AppShell from '../components/AppShell';
import AdminDiseaseManagementPage from '../pages/AdminDiseaseManagementPage';
import AdminLayoutPage from '../pages/AdminLayoutPage';
import ProtectedRoute from './ProtectedRoute';
import UserDashboard from '../components/UserDashboard';
import AdminReviewsPage from '../pages/review/AdminReviewsPage';
import ReviewsPage from '../pages/review/ReviewsPage';
import AdminAnalysisHistoryPage from '../pages/AdminAnalysisHistoryPage';
import CustomerAnalysisHistoryPage from '../pages/CustomerAnalysisHistoryPage';
import CustomerAnalysisDetailsPage from '../pages/CustomerAnalysisDetailsPage';
import AdminAnalysisDetailsPage from '../pages/AdminAnalysisDetailsPage';
import AdminUserManagementPage from '../pages/AdminUserManagementPage';

function AllRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/landingPage" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<AppShell />}>

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayoutPage />
              </ProtectedRoute>
            }
          >
            {/* Default redirect */}
            <Route
              index
              element={<Navigate to="disease-management" replace />}
            />

            {/* ✅ USER MANAGEMENT (FINAL CORRECT ONE) */}
            <Route
              path="user-management"
              element={<AdminUserManagementPage />}
            />

            <Route
              path="disease-management"
              element={<AdminDiseaseManagementPage />}
            />

            <Route
              path="analysis-history"
              element={<AdminAnalysisHistoryPage />}
            />

            <Route
              path="analysis/:id"
              element={<AdminAnalysisDetailsPage />}
            />

            <Route
              path="reviews-management"
              element={<AdminReviewsPage />}
            />
          </Route>

          {/* Customer Routes */}
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analysis-history"
            element={
              <ProtectedRoute>
                <CustomerAnalysisHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/analysis/:id"
            element={
              <ProtectedRoute>
                <CustomerAnalysisDetailsPage />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </Router>
  );
}

export default AllRoutes;