import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { SpinnerLoading } from "../libraries/CommonLoading";
import CustomerLayoutPage from "../pages/CustomerLayoutPage";

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
const AdminPaymentsManagementPage = lazy(
  () => import("../pages/AdminPaymentsManagementPage"),
);

function AllRoutes() {
  return (
    <Router>
      <Suspense
        fallback={<SpinnerLoading fullscreen={true} message="Loading page..." />}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<AppShell />}>
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <CustomerLayoutPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="prediction" element={<HomePage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route
                path="analysis-history"
                element={<CustomerAnalysisHistoryPage />}
              />
              <Route
                path="analysis/:id"
                element={<CustomerAnalysisDetailsPage />}
              />
              <Route path="payment" element={<PaymentLayout />}>
                <Route index element={<PaymentPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>
              <Route path="pricing" element={<PaymentLayout />}>
                <Route index element={<PaymentPage />} />
              </Route>
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayoutPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
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
              <Route
                path="payments-management"
                element={<AdminPaymentsManagementPage />}
              />
            </Route>

            <Route
              path="/payments-management"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Navigate to="/admin/payments-management" replace />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default AllRoutes;
