import { useEffect, useState } from "react";
import { getAdminSubscriptions } from "../../Redux/Api/api";
import { toast } from "react-toastify";

const statusStyles = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-yellow-100 text-yellow-700",
  canceled: "bg-gray-200 text-gray-700",
  unpaid: "bg-red-100 text-red-700",
  incomplete: "bg-orange-100 text-orange-700",
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

const AdminDashboardPage = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    trialing: 0,
    canceled: 0,
    text: 0,
    image: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await getAdminSubscriptions({ page: 1, limit: 8 });
        const data = response?.data?.data || {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setSummary(data.summary || {});
      } catch (error) {
        toast.error("Failed to load admin dashboard.");
        setItems([]);
        setSummary({
          total: 0,
          active: 0,
          trialing: 0,
          canceled: 0,
          text: 0,
          image: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cards = [
    { label: "Total Subscriptions", value: summary.total ?? 0 },
    { label: "Active", value: summary.active ?? 0 },
    { label: "Text Plans", value: summary.text ?? 0 },
    { label: "Image Plans", value: summary.image ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-primary-2/30 bg-primary-4 p-5 shadow-2xl"
          >
            <p className="text-sm font-semibold text-black/60">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-black">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-black">
              Recent Subscriptions
            </h3>
            <p className="text-sm text-black/60">
              Latest customer subscriptions across text and image plans.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-primary-2/20">
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
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-sm text-black/60"
                  >
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const status = item.status || "inactive";
                  const badgeClass =
                    statusStyles[status] || "bg-gray-100 text-gray-700";

                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-black">
                          {item.user?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-black/60">
                          {item.user?.email || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black/80">
                        {item.plan?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-black/70 capitalize">
                        {item.plan?.type || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-black/70">
                        {formatDate(item.current_period_end)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
