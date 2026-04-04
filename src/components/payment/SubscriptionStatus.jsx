import { useEffect, useState } from "react";
import {
  cancelSubscription,
  getSubscriptionStatus,
} from "../../Redux/Api/api";
import { toast } from "react-toastify";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const statusStyles = {
  active: "bg-green-100 text-green-700",
  canceled: "bg-gray-200 text-gray-700",
  past_due: "bg-yellow-100 text-yellow-700",
};

const SubscriptionStatus = ({ onSubscriptionChange }) => {
  const [subscriptions, setSubscriptions] = useState({
    text: null,
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await getSubscriptionStatus();
      const data = response?.data || {};
      setSubscriptions(data?.subscriptions || { text: null, image: null });
    } catch (error) {
      setSubscriptions({ text: null, image: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCancel = async () => {
    if (!selectedSubscription?.subscription_id) return;
    setProcessing(true);
    try {
      await cancelSubscription(selectedSubscription.subscription_id);
      toast.success("Subscription canceled.");
      await loadStatus();
      // Notify parent component to refresh payment history
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      toast.error("Unable to cancel subscription. Please try again.");
    } finally {
      setProcessing(false);
      setShowConfirm(false);
      setSelectedSubscription(null);
    }
  };

  const items = Object.values(subscriptions).filter(Boolean);

  const getPlanName = (subscription) => {
    if (!subscription?.plan) return "-";
    const name = subscription.plan.name || "Plan";
    const cycle = subscription.plan.billing_cycle;
    if (!cycle) return name;
    const lowerCycle = cycle.toLowerCase();
    const interval =
      lowerCycle === "month" || lowerCycle === "monthly"
        ? "Monthly"
        : lowerCycle === "year" || lowerCycle === "yearly"
          ? "Yearly"
          : cycle;
    return `${name} - ${interval}`;
  };

  return (
    <section className="rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-black">
            Subscription Status
          </h3>
          <p className="text-sm text-black/60">Manage your active plan.</p>
        </div>
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
        ) : (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
              items.length > 0
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {items.length > 0 ? `${items.length} plan${items.length > 1 ? "s" : ""}` : "inactive"}
          </span>
        )}
      </div>

      {!loading && items.length === 0 ? (
        <p className="mt-4 text-sm text-black/60">
          You have no active plan. Choose a plan above to get started.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((subscription) => {
            const status = subscription?.status || "inactive";
            const isCanceled =
              status === "canceled" || subscription?.cancel_at_period_end;
            const badgeStyle =
              statusStyles[status] || "bg-gray-100 text-gray-700";
            const typeLabel =
              subscription?.plan?.type === "image" ? "Image" : "Text";

            return (
              <div
                key={subscription.subscription_id || typeLabel}
                className="rounded-xl border border-primary-2/20 bg-primary-4/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-1">
                      {typeLabel} Plan
                    </p>
                    <p className="mt-1 font-semibold text-black">
                      {getPlanName(subscription)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyle}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-black/70">
                  <div className="flex items-center justify-between">
                    <span className="text-black/60">Renewal</span>
                    <span className="font-semibold">
                      {formatDate(subscription?.current_period_end)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    setShowConfirm(true);
                  }}
                  disabled={processing || isCanceled || loading}
                  className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isCanceled || loading
                      ? "cursor-not-allowed bg-primary-2/30 text-black/60"
                      : "border border-red-200 text-red-600 hover:bg-red-50"
                  }`}
                >
                  {isCanceled ? "Subscription Canceled" : "Cancel Subscription"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl backdrop-blur-md">
            <h4 className="text-lg font-bold text-black">
              Cancel Subscription?
            </h4>
            <p className="mt-2 text-sm text-black/60">
              You will keep access until the end of your billing period.
            </p>
            {selectedSubscription?.plan?.name && (
              <p className="mt-2 text-sm font-semibold text-black">
                {selectedSubscription.plan.name}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedSubscription(null);
                }}
                className="flex-1 rounded-xl border border-primary-2/40 px-4 py-2 text-sm font-semibold text-black/60"
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={processing}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  processing ? "bg-red-200" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {processing ? "Canceling..." : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SubscriptionStatus;
