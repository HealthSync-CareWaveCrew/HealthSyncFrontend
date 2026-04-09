import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentPlans } from "../../Redux/Api/api";
import useSubscription from "../../hooks/useSubscription";

const defaultFeatures = {
  textBasic: [
    "3 free AI-powered text predictions",
    "Basic health analytics dashboard",
    "See how HealthSync works before committing",
  ],
  textPro: [
    "Unlimited AI text predictions",
    "Priority processing - faster results",
    "Full analytics & exportable health reports",
    "Cancel anytime",
  ],
  image: [
    "AI analysis of X-rays, MRIs, and scans",
    "Detailed visual insights & annotations",
    "Flexible billing: monthly or yearly",
    "Secure & private image processing",
  ],
};

const normalizePlan = (plan) => {
  const rawAmount =
    plan?.amount_cents ??
    plan?.unit_amount ??
    plan?.amount ??
    plan?.price ??
    plan?.unitAmount ??
    0;
  const amount =
    plan?.amount_cents || plan?.unit_amount
      ? rawAmount / 100
      : Number(rawAmount);

  const rawInterval =
    plan?.interval ||
    plan?.billingCycle ||
    plan?.billing_cycle ||
    plan?.recurring_interval ||
    plan?.feature_limits?.billing_cycle;

  const interval = (() => {
    if (!rawInterval) return undefined;
    const lower = String(rawInterval).toLowerCase();
    if (lower === "month" || lower === "monthly") return "monthly";
    if (lower === "year" || lower === "yearly") return "yearly";
    return lower;
  })();

  return {
    id:
      plan?._id || plan?.id || plan?.plan_id || plan?.planId || plan?.price_id,
    name: plan?.name || plan?.plan_name || plan?.nickname,
    amount: plan?.amount ?? plan?.cost ?? amount,
    currency: plan?.currency || "usd",
    interval,
    type: plan?.type || plan?.category || plan?.plan_type,
    features: plan?.features,
    raw: plan,
  };
};

const matchByName = (plan, keyword) =>
  plan?.name?.toLowerCase().includes(keyword);

const formatPrice = (amount, currency = "usd", options = {}) => {
  const { allowFree = false } = options;
  if (amount === 0) return allowFree ? "Free" : null;
  const hasDecimals = Number(amount) % 1 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount);
};

const PricingPlans = () => {
  const navigate = useNavigate();
  const { subscriptions } = useSubscription();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [imageBilling, setImageBilling] = useState("monthly");

  useEffect(() => {
    let isMounted = true;
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const response = await getPaymentPlans();
        const data = response?.data?.data || [];
        const normalized = Array.isArray(data) ? data.map(normalizePlan) : [];
        if (isMounted) {
          setPlans(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setPlans([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const catalog = useMemo(() => {
    const textPlans = plans.filter(
      (plan) => plan.type === "text" || matchByName(plan, "text"),
    );

    const textMonthly =
      textPlans.find((plan) => plan.interval === "monthly") ||
      textPlans.find((plan) => plan.interval === "month");
    const textYearly =
      textPlans.find((plan) => plan.interval === "yearly") ||
      textPlans.find((plan) => plan.interval === "year");

    const textProMonthly = textMonthly || textPlans[0];
    const textProYearly = textYearly || textMonthly || textPlans[0];

    const imagePlans = plans.filter(
      (plan) => plan.type === "image" || matchByName(plan, "image"),
    );
    const imageMonthly =
      imagePlans.find((plan) => plan.interval === "monthly") ||
      imagePlans.find((plan) => plan.interval === "month") ||
      imagePlans[0];
    const imageYearly =
      imagePlans.find((plan) => plan.interval === "yearly") ||
      imagePlans.find((plan) => plan.interval === "year") ||
      imageMonthly;

    return {
      textBasic: null,
      textProMonthly,
      textProYearly,
      imageMonthly,
      imageYearly,
    };
  }, [plans]);

  const textSubscription = subscriptions?.text;
  const imageSubscription = subscriptions?.image;
  const hasTextSubscription =
    textSubscription &&
    textSubscription.status !== "canceled" &&
    textSubscription.status !== "inactive";
  const hasImageSubscription =
    imageSubscription &&
    imageSubscription.status !== "canceled" &&
    imageSubscription.status !== "inactive";
  const currentTextPlanId =
    textSubscription?.plan_id ||
    textSubscription?.planId ||
    textSubscription?.plan?._id ||
    textSubscription?.plan?.id ||
    textSubscription?.plan?.plan_id;
  const currentImagePlanId =
    imageSubscription?.plan_id ||
    imageSubscription?.planId ||
    imageSubscription?.plan?._id ||
    imageSubscription?.plan?.id ||
    imageSubscription?.plan?.plan_id;

  const isCurrentPlan = (planId, type) => {
    const currentPlanId = type === "image" ? currentImagePlanId : currentTextPlanId;
    return planId && currentPlanId && planId === currentPlanId;
  };

  const handleNavigate = (planId) => {
    if (!planId) return;
    navigate(`/user/payment/checkout?plan_id=${planId}`);
  };

  const handleTextBasicNavigate = () => {
    // Free text access (3 predictions) does not require a plan id.
    navigate("/user/prediction");
  };

  const textBasicCta = (planId) => {
    if (!hasTextSubscription) return "Start for Free";
    if (isCurrentPlan(planId, "text")) return "Current Plan";
    return "Switch Plan";
  };

  const textProCta = (planId) => {
    if (!hasTextSubscription) return "Subscribe Now";
    if (isCurrentPlan(planId, "text")) return "Current Plan";
    return "Switch to Pro";
  };

  const imageCta = (planId) => {
    if (!hasImageSubscription) return "Subscribe Now";
    if (isCurrentPlan(planId, "image")) return "Current Plan";
    return "Switch Plan";
  };

  const selectedTextProPlan =
    billingCycle === "yearly" ? catalog.textProYearly : catalog.textProMonthly;
  const selectedImagePlan =
    imageBilling === "yearly" ? catalog.imageYearly : catalog.imageMonthly;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black">Pricing Plans</h2>
          <p className="text-sm text-black/60">
            Choose the plan that fits you.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-1">
              TEXT BASIC
            </p>
            <h3 className="text-xl font-bold text-black">
              Get Started Free
            </h3>
            <p className="text-sm text-black/60">
              Perfect for trying out HealthSync. No credit card required.
            </p>
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/70">
            {(catalog.textBasic?.features || defaultFeatures.textBasic).map(
              (feature) => (
                <li key={feature}>{feature}</li>
              ),
            )}
          </ul>
          <button
            type="button"
            onClick={handleTextBasicNavigate}
            className="mt-6 w-full rounded-xl bg-primary-1 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-2"
          >
            Start for Free
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-1">
                  TEXT PRO
                </p>
                <span className="rounded-full bg-primary-1/15 px-2 py-1 text-[10px] font-semibold uppercase text-primary-1">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-black">
                Unlimited Predictions
              </h3>
              <p className="text-sm text-black/60">
                For users who want full access to AI health insights, every day.
              </p>
            </div>
            <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  billingCycle === "monthly"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  billingCycle === "yearly"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-black animate-pulse">
                Loading...
              </p>
            ) : !selectedTextProPlan ? (
              <p className="text-2xl font-bold text-black">
                -
                <span className="text-sm font-medium text-black/60">
                  {billingCycle === "yearly" ? " / year" : " / month"}
                </span>
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-bold text-black">
                  {formatPrice(
                    selectedTextProPlan?.amount ?? 0,
                    selectedTextProPlan?.currency,
                  ) || "-"}
                  <span className="text-sm font-medium text-black/60">
                    {billingCycle === "yearly" ? " / year" : " / month"}
                  </span>
                </p>
                {billingCycle === "yearly" && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    Save 20%
                  </span>
                )}
              </div>
            )}
            {selectedTextProPlan?.raw?.secondary_price && !loading && (
              <p className="text-xs text-black/60">
                Also available monthly or yearly.
              </p>
            )}
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/70">
            {(selectedTextProPlan?.features || defaultFeatures.textPro).map(
              (feature) => (
                <li key={feature}>{feature}</li>
              ),
            )}
          </ul>
          <button
            type="button"
            onClick={() => handleNavigate(selectedTextProPlan?.id)}
            disabled={
              !selectedTextProPlan?.id ||
              isCurrentPlan(selectedTextProPlan?.id, "text")
            }
            className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              !selectedTextProPlan?.id ||
              isCurrentPlan(selectedTextProPlan?.id, "text")
                ? "cursor-not-allowed bg-primary-2/30 text-black/60"
                : "bg-primary-1 text-white hover:bg-primary-2"
            }`}
          >
            {textProCta(selectedTextProPlan?.id)}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-1">
                IMAGE ANALYSIS
              </p>
              <h3 className="text-xl font-bold text-black">
                Advanced Imaging AI
              </h3>
              <p className="text-sm text-black/60">
                Upload medical images and get instant AI-powered analysis and
                insights.
              </p>
            </div>
            <div className="flex rounded-lg bg-gray-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setImageBilling("monthly")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  imageBilling === "monthly"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setImageBilling("yearly")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  imageBilling === "yearly"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-black animate-pulse">
                Loading...
              </p>
            ) : !selectedImagePlan ? (
              <p className="text-2xl font-bold text-black">
                -
                <span className="text-sm font-medium text-black/60">
                  {imageBilling === "monthly" ? " / month" : " / year"}
                </span>
              </p>
            ) : (
              <p className="text-2xl font-bold text-black">
                {formatPrice(
                  selectedImagePlan?.amount ?? 0,
                  selectedImagePlan?.currency,
                ) || "-"}
                <span className="text-sm font-medium text-black/60">
                  {imageBilling === "monthly" ? " / month" : " / year"}
                </span>
              </p>
            )}
          </div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/70">
            {(selectedImagePlan?.features || defaultFeatures.image).map(
              (feature) => (
                <li key={feature}>{feature}</li>
              ),
            )}
          </ul>
          <button
            type="button"
            onClick={() => handleNavigate(selectedImagePlan?.id)}
            disabled={
              !selectedImagePlan?.id ||
              isCurrentPlan(selectedImagePlan?.id, "image")
            }
            className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              !selectedImagePlan?.id ||
              isCurrentPlan(selectedImagePlan?.id, "image")
                ? "cursor-not-allowed bg-primary-2/30 text-black/60"
                : "bg-primary-1 text-white hover:bg-primary-2"
            }`}
          >
            {imageCta(selectedImagePlan?.id)}
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
