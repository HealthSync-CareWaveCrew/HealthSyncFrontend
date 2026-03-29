import { useLocation } from "react-router-dom";
import { useState } from "react";
import FreeTrialBanner from "../../components/payment/FreeTrialBanner";
import PricingPlans from "../../components/payment/PricingPlans";
import SubscriptionStatus from "../../components/payment/SubscriptionStatus";
import PaymentMethodsManager from "../../components/payment/PaymentMethodsManager";
import PaymentHistory from "../../components/payment/PaymentHistory";

const PaymentPage = () => {
  const location = useLocation();
  const message = location.state?.message;
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubscriptionChange = () => {
    // Trigger refresh of payment history
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="rounded-2xl border border-primary-2/40 bg-primary-4 p-4 text-sm font-semibold text-gray-700">
          {message}
        </div>
      )}
      <FreeTrialBanner />
      <PricingPlans />
      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionStatus onSubscriptionChange={handleSubscriptionChange} />
        <PaymentMethodsManager />
      </div>
      <PaymentHistory key={refreshKey} />
    </div>
  );
};

export default PaymentPage;
