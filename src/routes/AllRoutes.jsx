import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { SpinnerLoading } from "../libraries/CommonLoading";

const HomePage = lazy(() => import("../pages/HomePage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const AppShell = lazy(() => import("../components/AppShell"));
const AdminDiseaseManagementPage = lazy(
  () => import("../pages/AdminDiseaseManagementPage")
);
const AdminLayoutPage = lazy(() => import("../pages/AdminLayoutPage"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"));
const UserDashboard = lazy(() => import("../components/UserDashboard"));
const AdminReviewsPage = lazy(() => import("../pages/review/AdminReviewsPage"));
const ReviewsPage = lazy(() => import("../pages/review/ReviewsPage"));
const AdminAnalysisHistoryPage = lazy(
  () => import("../pages/AdminAnalysisHistoryPage")
);
const CustomerAnalysisHistoryPage = lazy(
  () => import("../pages/CustomerAnalysisHistoryPage")
);
const CustomerAnalysisDetailsPage = lazy(
  () => import("../pages/CustomerAnalysisDetailsPage")
);
const AdminAnalysisDetailsPage = lazy(
  () => import("../pages/AdminAnalysisDetailsPage")
);
const PaymentLayout = lazy(() => import("../pages/payment/PaymentLayout"));
const PaymentPage = lazy(() => import("../pages/payment/PaymentPage"));
const CheckoutPage = lazy(() => import("../pages/payment/CheckoutPage"));
const AdminUserManagementPage = lazy(
  () => import("../pages/AdminUserManagementPage")
);

function AllRoutes() {
  return (
    <Router>
      <Suspense
        fallback={<SpinnerLoading fullscreen={true} message="Loading page..." />}
      >
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
              path="/prediction"
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
                element={<Navigate to="dashboard" replace />}
              />

              {/* ✅ USER MANAGEMENT (FINAL CORRECT ONE) */}
              <Route
                path="dashboard"
                element={<AdminDashboardPage />}
              />

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
      </Suspense>
    </Router>
  );
}

export default AllRoutes;
