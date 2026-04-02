import { useEffect, useMemo, useState } from "react";
import {
  createPaymentPlan,
  deactivatePaymentPlan,
  getAdminPaymentPlans,
  getAdminSubscriptions,
  updatePaymentPlan,
} from "../../Redux/Api/api";
import { toast } from "react-toastify";

const defaultForm = {
  plan_name: "",
  type: "text",
  billing_cycle: "monthly",
  cost: "",
  currency: "usd",
  description: "",
  free_trials: 3,
  isActive: true,
};

const normalizePlan = (plan) => ({
  id: plan._id,
  name: plan.plan_name,
  type: plan.type,
  cost: plan.cost,
  currency: plan.currency || "usd",
  billing_cycle: plan.feature_limits?.billing_cycle || "month",
  free_trials: plan.feature_limits?.free_trials ?? 0,
  isActive: plan.isActive,
  stripe_price_id: plan.stripe_price_id,
  stripe_product_id: plan.stripe_product_id,
  description: plan.description || "",
});

const formatPrice = (amount, currency = "usd") => {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
  }).format(numeric);
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const subscriptionStatusStyles = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-yellow-100 text-yellow-700",
  canceled: "bg-gray-200 text-gray-700",
  unpaid: "bg-red-100 text-red-700",
  incomplete: "bg-orange-100 text-orange-700",
};

const PaymentsManagementPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState({
    total: 0,
    active: 0,
    trialing: 0,
    canceled: 0,
    text: 0,
    image: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formState, setFormState] = useState(defaultForm);
  const [processing, setProcessing] = useState(false);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await getAdminPaymentPlans(true);
      const data = response?.data?.data || [];
      setPlans(Array.isArray(data) ? data.map(normalizePlan) : []);
    } catch (error) {
      toast.error("Failed to load payment plans.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await getAdminSubscriptions({ page: 1, limit: 8 });
      const data = response?.data?.data || {};
      setSubscriptions(Array.isArray(data.items) ? data.items : []);
      setSubscriptionSummary(data.summary || {
        total: 0,
        active: 0,
        trialing: 0,
        canceled: 0,
        text: 0,
        image: 0,
      });
    } catch (error) {
      toast.error("Failed to load subscriptions.");
      setSubscriptions([]);
      setSubscriptionSummary({
        total: 0,
        active: 0,
        trialing: 0,
        canceled: 0,
        text: 0,
        image: 0,
      });
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      await Promise.all([loadPlans(), loadSubscriptions()]);
    };

    loadPageData();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setFormState(defaultForm);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormState({
      plan_name: plan.name || "",
      type: plan.type || "text",
      billing_cycle:
        plan.billing_cycle === "year" || plan.billing_cycle === "yearly"
          ? "yearly"
          : "monthly",
      cost: plan.cost ?? "",
      currency: plan.currency || "usd",
      description: plan.description || "",
      free_trials: plan.free_trials ?? 0,
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    try {
      const payload = {
        plan_name: formState.plan_name.trim(),
        type: formState.type,
        billing_cycle: formState.billing_cycle,
        cost: Number(formState.cost),
        currency: formState.currency,
        description: formState.description,
        free_trials: Number(formState.free_trials),
        isActive: Boolean(formState.isActive),
      };

      if (editingPlan) {
        await updatePaymentPlan(editingPlan.id, payload);
        toast.success("Plan updated.");
      } else {
        await createPaymentPlan(payload);
        toast.success("Plan created.");
      }
      await Promise.all([loadPlans(), loadSubscriptions()]);
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Plan update failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivate = async (planId) => {
    setProcessing(true);
    try {
      await deactivatePaymentPlan(planId);
      toast.success("Plan deactivated.");
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Plan deactivation failed.");
    } finally {
      setProcessing(false);
    }
  };

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );
  const subscriptionCards = [
    { label: "Total Subscriptions", value: subscriptionSummary.total ?? 0 },
    { label: "Active", value: subscriptionSummary.active ?? 0 },
    { label: "Text Plans", value: subscriptionSummary.text ?? 0 },
    { label: "Image Plans", value: subscriptionSummary.image ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Payments Management
            </h2>
            <p className="text-sm text-black/60">
              Manage Stripe-synced payment plans and pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-full bg-primary-1 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-2"
          >
            Add Plan
          </button>
        </div>
      </div>

      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-2 border-t-transparent" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-black/60">No payment plans found.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-black/60">
              Active plans: {activePlans.length} / {plans.length}
            </div>
            <div className="overflow-hidden rounded-xl border border-primary-2/20">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-primary-4/80 text-xs uppercase tracking-wide text-black/60">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Billing</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-2/10 bg-primary-4/40">
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-black">
                          {plan.name}
                        </div>
                        <div className="text-xs text-black/60">
                          {plan.description || "No description"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black/70 capitalize">
                        {plan.type}
                      </td>
                      <td className="px-4 py-3 text-black/70 capitalize">
                        {plan.billing_cycle === "year" ? "Yearly" : "Monthly"}
                      </td>
                      <td className="px-4 py-3 text-black/70">
                        {formatPrice(plan.cost, plan.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            plan.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(plan)}
                            className="rounded-full border border-primary-2/40 px-3 py-1 text-xs font-semibold text-black/70 hover:border-primary-2"
                          >
                            Edit
                          </button>
                          {plan.isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(plan.id)}
                              disabled={processing}
                              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold text-black">Subscriptions</h3>
            <p className="text-sm text-black/60">
              Current customer subscriptions across text and image plans.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {subscriptionCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-primary-2/20 bg-primary-4/40 p-4"
              >
                <p className="text-sm font-semibold text-black/60">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-black">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-primary-2/20">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary-4/80 text-xs uppercase tracking-wide text-black/60">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-2/10 bg-primary-4/40">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-sm text-black/60"
                    >
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-sm text-black/60"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => {
                    const status = subscription.status || "inactive";
                    const badgeClass =
                      subscriptionStatusStyles[status] ||
                      "bg-gray-100 text-gray-700";

                    return (
                      <tr key={subscription.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-black">
                            {subscription.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-black/60">
                            {subscription.user?.email || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black/80">
                          {subscription.plan?.name || "-"}
                        </td>
                        <td className="px-4 py-3 text-black/70 capitalize">
                          {subscription.plan?.type || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-black/70">
                          {formatDate(subscription.current_period_end)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-xl font-bold text-black">
              {editingPlan ? "Edit Plan" : "Create Plan"}
            </h3>
            <p className="text-sm text-black/60">
              {editingPlan
                ? "Update plan details and pricing."
                : "Create a new Stripe-synced plan."}
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-black/70">
                  Plan name
                </label>
                <input
                  type="text"
                  value={formState.plan_name}
                  onChange={(event) =>
                    handleChange("plan_name", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Type
                  </label>
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      handleChange("type", event.target.value)
                    }
                    disabled={Boolean(editingPlan)}
                    className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1 disabled:cursor-not-allowed"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Billing
                  </label>
                  <select
                    value={formState.billing_cycle}
                    onChange={(event) =>
                      handleChange("billing_cycle", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formState.cost}
                    onChange={(event) =>
                      handleChange("cost", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formState.currency}
                    onChange={(event) =>
                      handleChange("currency", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-black/70">
                    Free trials
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.free_trials}
                    onChange={(event) =>
                      handleChange("free_trials", event.target.value)
                    }
                    disabled={formState.type !== "text"}
                    className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <input
                    id="plan-active"
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(event) =>
                      handleChange("isActive", event.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="plan-active"
                    className="text-sm font-semibold text-black/70"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-black/70">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formState.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-primary-2/30 bg-white/70 px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-primary-2/40 px-4 py-2 text-sm font-semibold text-black/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                    processing
                      ? "bg-primary-2/60"
                      : "bg-primary-1 hover:bg-primary-2"
                  }`}
                >
                  {processing ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagementPage;
