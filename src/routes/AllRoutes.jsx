import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LandingPage from "../pages/LandingPage";
import AuthPage from '../pages/AuthPage'; // import your auth page
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

function AllRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/landingPage" element={<LandingPage />} />
        
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        {/* or if you want both on same page */}
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={ <ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/" element={ <ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayoutPage />
            </ProtectedRoute>
          }>
            <Route
              index
              element={<Navigate to="disease-management" replace />}
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
              path="reviews-management"
              element={<AdminReviewsPage />}
            />
          </Route>
          <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route
            path="/analysis-history"
            element={<ProtectedRoute><CustomerAnalysisHistoryPage /></ProtectedRoute>}
          />
           <Route
            path="/customer/analysis/:id"
            element={<ProtectedRoute><CustomerAnalysisDetailsPage /></ProtectedRoute>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default AllRoutes;