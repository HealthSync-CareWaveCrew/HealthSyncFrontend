import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import {
  createSetupIntent,
  getPaymentMethods,
  getPaymentPlans,
  savePaymentMethod,
  subscribeToPlan,
} from "../../libraries/paymentApi";
import { getStripeErrorMessage } from "../../libraries/stripeErrors";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": { color: "#9CA3AF" },
    },
  },
};

const formatPrice = (amount, currency = "usd") => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

const normalizePlan = (plan) => {
  const rawAmount =
    plan?.amount_cents ??
    plan?.unit_amount ??
    plan?.amount ??
    plan?.price ??
    plan?.cost ??
    plan?.unitAmount ??
    0;
  const amount =
    plan?.amount_cents || plan?.unit_amount
      ? rawAmount / 100
      : Number(rawAmount);
  return {
    id: plan?._id || plan?.id || plan?.plan_id || plan?.planId || plan?.price_id,
    name: plan?.name || plan?.plan_name || plan?.nickname,
    interval:
      plan?.interval ||
      plan?.billingCycle ||
      plan?.billing_cycle ||
      plan?.recurring_interval ||
      plan?.feature_limits?.billing_cycle ||
      plan?.feature_limits?.billingCycle ||
      (plan?.isOneTime ? "one_time" : undefined),
    amount,
    currency: plan?.currency || "usd",
  };
};

const CheckoutPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const planId = query.get("plan_id");

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await getPaymentPlans();
      const data = response?.data?.data || [];
      setPlans(Array.isArray(data) ? data.map(normalizePlan) : []);
    } catch (error) {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadMethods = async () => {
    setLoadingMethods(true);
    try {
      const response = await getPaymentMethods();
      const data = response?.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setMethods(list);
      const defaultMethod = list.find((method) => method.is_default);
      setSelectedMethod(defaultMethod?.id || list[0]?.id || "");
    } catch (error) {
      setMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadMethods();
  }, []);

  const selectedPlan = plans.find(
    (plan) => String(plan.id) === String(planId),
  );

  const handleAddCard = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const setupIntentResponse = await createSetupIntent();
      const clientSecret =
        setupIntentResponse?.data?.data?.client_secret ||
        setupIntentResponse?.data?.data?.clientSecret;

      const cardElement = elements.getElement(CardElement);
      const confirmation = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (confirmation?.error) {
        toast.error(getStripeErrorMessage(confirmation.error));
        return;
      }

      const stripePmId = confirmation?.setupIntent?.payment_method;
      await savePaymentMethod(stripePmId);
      toast.success("Card saved.");
      await loadMethods();
      setShowNewCard(false);
    } catch (error) {
      toast.error("Unable to save card. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedMethod || !planId) {
      toast.error("Select a payment method to continue.");
      return;
    }
    setProcessing(true);
    try {
      const response = await subscribeToPlan({
        planId,
        paymentMethodId: selectedMethod,
      });
      const payload = response?.data?.data || response?.data || {};
      const status = payload?.status || payload?.subscription?.status;

      if (status === "requires_action" && payload?.client_secret) {
        const { error } = await stripe.confirmCardPayment(
          payload.client_secret,
        );
        if (error) {
          toast.error(getStripeErrorMessage(error));
          return;
        }
        toast.success("Subscription confirmed.");
        navigate("/dashboard");
        return;
      }

      if (status === "trialing" || status === "active") {
        toast.success("Subscription activated.");
        navigate("/dashboard");
        return;
      }

      if (status === "requires_action") {
        const clientSecret =
          payload?.client_secret || payload?.payment_intent_client_secret;
        const confirmation = await stripe.confirmCardPayment(clientSecret);
        if (confirmation?.error) {
          toast.error(getStripeErrorMessage(confirmation.error));
          return;
        }
        toast.success("Subscription confirmed.");
        navigate("/dashboard");
        return;
      }

      toast.error("Subscription failed. Please try again.");
    } catch (error) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!planId) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
        Select a plan to continue.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-2/40 bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
        <p className="text-sm text-gray-600">
          Confirm your plan and payment method.
        </p>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          {loadingPlans ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
          ) : selectedPlan ? (
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedPlan.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Billing</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(selectedPlan.amount, selectedPlan.currency)}
                  {selectedPlan.interval && (
                    <span className="text-xs text-gray-500">
                      {selectedPlan.interval === "one_time"
                        ? " one-time"
                        : ` / ${selectedPlan.interval}`}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Plan details unavailable.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-primary-2/40 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">Payment Method</h3>

        {loadingMethods ? (
          <div className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
        ) : methods.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No saved payment methods.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {methods.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                  selectedMethod === method.id
                    ? "border-primary-2 bg-primary-4"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {method.brand?.toUpperCase() || "Card"} •••• {method.last4}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
              </label>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowNewCard((prev) => !prev)}
            className="text-sm font-semibold text-primary-1 underline"
          >
            {showNewCard ? "Cancel new card" : "Add new card"}
          </button>
          {showNewCard && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200 p-3">
                <CardElement options={cardElementOptions} />
              </div>
              <button
                type="button"
                onClick={handleAddCard}
                disabled={processing || !stripe}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  processing || !stripe
                    ? "bg-primary-2/60"
                    : "bg-primary-1 hover:bg-primary-2"
                }`}
              >
                {processing ? "Saving..." : "Save payment method"}
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={processing || loadingMethods || loadingPlans}
        className={`w-full rounded-2xl px-6 py-4 text-sm font-semibold text-white transition ${
          processing || loadingMethods || loadingPlans
            ? "bg-primary-2/60"
            : "bg-primary-1 hover:bg-primary-2"
        }`}
      >
        {processing ? "Processing..." : "Confirm Subscription"}
      </button>
    </div>
  );
};

export default CheckoutPage;
