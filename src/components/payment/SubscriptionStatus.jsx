import { useEffect, useState } from "react";
import {
  cancelSubscription,
  getSubscriptionStatus,
} from "../../libraries/paymentApi";
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
  trialing: "bg-blue-100 text-blue-700",
  canceled: "bg-gray-200 text-gray-700",
  past_due: "bg-yellow-100 text-yellow-700",
};

const SubscriptionStatus = ({ onSubscriptionChange }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const response = await getSubscriptionStatus();
      const data = response?.data?.data || null;
      setSubscription(data);
    } catch (error) {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCancel = async () => {
    setProcessing(true);
    try {
      await cancelSubscription(subscription?.subscription_id);
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
    }
  };

  const status = subscription?.status || "inactive";
  const isCanceled =
    status === "canceled" || subscription?.cancel_at_period_end;
  const badgeStyle = statusStyles[status] || "bg-gray-100 text-gray-700";
  const renewalDate = subscription?.current_period_end;

  const planName = (() => {
    if (!subscription?.plan) return "-";
    const name = subscription.plan.name || "Text Plan";
    const cycle = subscription.plan.billing_cycle;
    if (!cycle) return name;
    const interval =
      cycle.toLowerCase() === "month" || cycle.toLowerCase() === "monthly"
        ? "Monthly"
        : cycle.toLowerCase() === "year" || cycle.toLowerCase() === "yearly"
          ? "Yearly"
          : cycle;
    return `${name} - ${interval}`;
  })();

  return (
    <section className="rounded-2xl border border-primary-2/40 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Subscription Status
          </h3>
          <p className="text-sm text-gray-600">Manage your active plan.</p>
        </div>
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
        ) : (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyle}`}
          >
            {status}
          </span>
        )}
      </div>

      {status === "inactive" ? (
        <p className="mt-4 text-sm text-gray-600">
          You have no active plan. Choose a plan above to get started.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-semibold">{planName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold">{formatDate(new Date())}</span>
          </div>
          {/*<div className="flex items-center justify-between border-t border-gray-100 pt-2">*/}
          {/*  <span className="text-gray-500">*/}
          {/*    {status === "trialing"*/}
          {/*      ? "Trial ends"*/}
          {/*      : isCanceled*/}
          {/*        ? "Active until"*/}
          {/*        : "Renewal"}*/}
          {/*  </span>*/}
          {/*  <span className="font-semibold">*/}
          {/*    {status === "trialing"*/}
          {/*      ? formatDate(*/}
          {/*          subscription?.trial_end || subscription?.current_period_end,*/}
          {/*        )*/}
          {/*      : isCanceled*/}
          {/*        ? formatDate(subscription?.current_period_end)*/}
          {/*        : `Renews on ${formatDate(subscription?.current_period_end)}`}*/}
          {/*  </span>*/}
          {/*</div>*/}
        </div>
      )}

      {status !== "inactive" && (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={processing || isCanceled || loading}
          className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isCanceled || loading
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "border border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          {isCanceled ? "Subscription Canceled" : "Cancel Subscription"}
        </button>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-gray-900">
              Cancel Subscription?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              You will keep access until the end of your billing period.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
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
