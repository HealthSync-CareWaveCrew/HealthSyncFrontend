import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useSubscription from "../hooks/useSubscription";

const ProtectedFeatureRoute = ({ children, feature = "text" }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { freeTrialsRemaining, loading, subscription } = useSubscription(
    feature,
  );

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-2 border-t-transparent" />
      </div>
    );
  }

  const status = subscription?.status || subscription?.subscriptionStatus;
  const hasTextSubscription =
    status === "active" || status === "trialing" || status === "past_due";
  const hasImageSubscription =
    status === "active" && subscription?.plan?.type === "image";

  if (feature === "image") {
    if (!hasImageSubscription) {
      return (
        <Navigate
          to="/pricing"
          state={{ message: "Image analysis requires a paid plan" }}
          replace
        />
      );
    }
    return children;
  }

  const hasTextAccess = freeTrialsRemaining > 0 || hasTextSubscription;
  if (!hasTextAccess) {
    return (
      <Navigate
        to="/pricing"
        state={{ message: "Upgrade to continue." }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedFeatureRoute;
