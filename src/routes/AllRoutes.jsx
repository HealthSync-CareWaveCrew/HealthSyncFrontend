import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage"; // import your auth page
import AppShell from "../components/AppShell";
import AdminDiseaseManagementPage from "../pages/AdminDiseaseManagementPage";
import AdminLayoutPage from "../pages/AdminLayoutPage";
import ProtectedRoute from "./ProtectedRoute";
import UserDashboard from "../components/UserDashboard";
import AdminReviewsPage from "../pages/review/AdminReviewsPage";
import ReviewsPage from "../pages/review/ReviewsPage";
import AdminAnalysisHistoryPage from "../pages/AdminAnalysisHistoryPage";
import CustomerAnalysisHistoryPage from "../pages/CustomerAnalysisHistoryPage";
import CustomerAnalysisDetailsPage from "../pages/CustomerAnalysisDetailsPage";
import AdminAnalysisDetailsPage from "../pages/AdminAnalysisDetailsPage";
import PaymentLayout from "../pages/payment/PaymentLayout";
import PaymentPage from "../pages/payment/PaymentPage";
import CheckoutPage from "../pages/payment/CheckoutPage";
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
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayoutPage />
              </ProtectedRoute>
            }
          >
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
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PaymentPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <PaymentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PaymentPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AllRoutes;
