import { useEffect, useMemo, useState } from "react";
import { FaBan } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import {
  createPaymentPlan,
  deactivatePaymentPlan,
  getAdminPaymentPlans,
  getAdminSubscriptions,
  updatePaymentPlan,
} from "../../Redux/Api/api";
import TableGrid from "../../libraries/TableGrid";
import { toast } from "react-toastify";

const defaultForm = {
  plan_name: "",
  type: "text",
  billing_cycle: "monthly",
  cost: "",
  currency: "usd",
  description: "",
  isActive: true,
};

const normalizeBillingCycle = (value, fallback = "monthly") => {
  if (!value) return fallback;
  return value === "year" || value === "yearly" ? "yearly" : "monthly";
};

const normalizePlan = (plan) => ({
  id: plan._id,
  name: plan.plan_name,
  type: plan.type,
  cost: plan.cost,
  currency: plan.currency || "usd",
  billing_cycle: normalizeBillingCycle(
    plan.feature_limits?.billing_cycle,
    "monthly",
  ),
  isActive: plan.isActive,
  status: plan.isActive ? "active" : "inactive",
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
    try {
      const response = await getAdminPaymentPlans(true);
      const data = response?.data?.data || [];
      setPlans(Array.isArray(data) ? data.map(normalizePlan) : []);
    } catch (error) {
      toast.error("Failed to load payment plans.");
      setPlans([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await getAdminSubscriptions({ page: 1, limit: 100 });
      const data = response?.data?.data || {};
      setSubscriptions(Array.isArray(data.items) ? data.items : []);
      setSubscriptionSummary(data.summary || {
        total: 0,
        active: 0,
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
        canceled: 0,
        text: 0,
        image: 0,
      });
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadPlans(), loadSubscriptions()]);
      } finally {
        setLoading(false);
      }
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

  const planColumns = useMemo(
    () => [
      {
        field: "name",
        header: "Plan",
        type: "text",
        render: (row) => (
          <div>
            <div className="font-semibold text-black">{row.name}</div>
            <div className="text-xs text-black/60">
              {row.description || "No description"}
            </div>
          </div>
        ),
      },
      {
        field: "type",
        header: "Type",
        type: "text",
        options: ["text", "image"],
        render: (row) => (
          <span className="capitalize text-black/70">{row.type}</span>
        ),
      },
      {
        field: "billing_cycle",
        header: "Billing",
        type: "text",
        options: ["monthly", "yearly"],
        render: (row) => (
          <span className="capitalize text-black/70">{row.billing_cycle}</span>
        ),
      },
      {
        field: "cost",
        header: "Price",
        type: "amount",
        render: (row) => (
          <span className="text-black/70">
            {formatPrice(row.cost, row.currency)}
          </span>
        ),
      },
      {
        field: "status",
        header: "Status",
        type: "text",
        options: ["active", "inactive"],
        render: (row) => (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              row.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  const planFilterbars = useMemo(
    () => [
      {
        key: "type",
        label: "Type",
        type: "dropdown",
        options: [
          { label: "Text", value: "text" },
          { label: "Image", value: "image" },
        ],
      },
      {
        key: "billing_cycle",
        label: "Billing",
        type: "dropdown",
        options: [
          { label: "Monthly", value: "monthly" },
          { label: "Yearly", value: "yearly" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "dropdown",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    [],
  );

  const planQuickActions = [
    {
      name: "Edit",
      icon: MdEdit,
      onClick: (row) => openEdit(row),
      showName: true,
    },
    {
      name: "Deactivate",
      icon: FaBan,
      onClick: (row) => handleDeactivate(row.id),
      showName: true,
      color: "text-red-600",
      disabled: (row) => processing || !row.isActive,
    },
  ];

  const subscriptionRows = useMemo(
    () =>
      subscriptions.map((subscription) => ({
        ...subscription,
        customerName: subscription.user?.name || "Unknown User",
        customerEmail: subscription.user?.email || "-",
        planName: subscription.plan?.name || "-",
        planType: subscription.plan?.type || "-",
        billing_cycle: normalizeBillingCycle(
          subscription.plan?.billing_cycle,
          "-",
        ),
        status: subscription.status || "inactive",
      })),
    [subscriptions],
  );

  const subscriptionColumns = useMemo(
    () => [
      {
        field: "customerName",
        header: "Customer",
        type: "text",
        render: (row) => (
          <div>
            <div className="font-semibold text-black">{row.customerName}</div>
            <div className="text-xs text-black/60">{row.customerEmail}</div>
          </div>
        ),
      },
      {
        field: "planName",
        header: "Plan",
        type: "text",
        render: (row) => <span className="text-black/80">{row.planName}</span>,
      },
      {
        field: "planType",
        header: "Type",
        type: "text",
        options: ["text", "image"],
        render: (row) => (
          <span className="capitalize text-black/70">{row.planType}</span>
        ),
      },
      {
        field: "billing_cycle",
        header: "Billing",
        type: "text",
        options: ["monthly", "yearly"],
        render: (row) => (
          <span className="capitalize text-black/70">{row.billing_cycle}</span>
        ),
      },
      {
        field: "status",
        header: "Status",
        type: "text",
        options: ["active", "past_due", "canceled", "unpaid", "incomplete"],
        render: (row) => {
          const badgeClass =
            subscriptionStatusStyles[row.status] || "bg-gray-100 text-gray-700";

          return (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}
            >
              {row.status}
            </span>
          );
        },
      },
      {
        field: "current_period_end",
        header: "Renews",
        type: "date",
        render: (row) => (
          <span className="text-black/70">
            {formatDate(row.current_period_end)}
          </span>
        ),
      },
    ],
    [],
  );

  const subscriptionFilterbars = useMemo(
    () => [
      {
        key: "planType",
        label: "Type",
        type: "dropdown",
        options: [
          { label: "Text", value: "text" },
          { label: "Image", value: "image" },
        ],
      },
      {
        key: "billing_cycle",
        label: "Billing",
        type: "dropdown",
        options: [
          { label: "Monthly", value: "monthly" },
          { label: "Yearly", value: "yearly" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "dropdown",
        options: [
          { label: "Active", value: "active" },
          { label: "Past Due", value: "past_due" },
          { label: "Canceled", value: "canceled" },
          { label: "Unpaid", value: "unpaid" },
          { label: "Incomplete", value: "incomplete" },
        ],
      },
    ],
    [],
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
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-black/60">
              Active plans: {activePlans.length} / {plans.length}
            </div>
            <TableGrid
              columns={planColumns}
              data={plans}
              quickActions={planQuickActions}
              filterbars={planFilterbars}
              dateFilter={false}
              showAll={true}
              minRows={0}
              rowHeight={56}
              headerHeight={42}
            />
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-2 border-t-transparent" />
            </div>
          ) : (
            <TableGrid
              columns={subscriptionColumns}
              data={subscriptionRows}
              filterbars={subscriptionFilterbars}
              dateFilter={false}
              showAll={true}
              minRows={0}
              rowHeight={56}
              headerHeight={42}
            />
          )}
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
