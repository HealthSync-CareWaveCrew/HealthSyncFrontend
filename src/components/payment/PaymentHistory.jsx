import { useEffect, useState } from "react";
import { getPaymentHistory } from "../../libraries/paymentApi";

const statusStyles = {
  active: "bg-green-100 text-green-700",
  succeeded: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  canceled: "bg-gray-200 text-gray-700",
  cancelled: "bg-gray-200 text-gray-700",
  expired: "bg-yellow-100 text-yellow-700",
  pending: "bg-blue-100 text-blue-700",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const extractAmount = (entry) => {
  const rawAmount =
    entry?.amount ??
    entry?.amount_paid ??
    entry?.total_amount ??
    entry?.total ??
    entry?.unit_amount ??
    entry?.amount_cents ??
    entry?.amountCents ??
    entry?.price ??
    entry?.cost;
  if (rawAmount === null || rawAmount === undefined) {
    return { amount: null, currency: entry?.currency };
  }

  const numeric = Number(rawAmount);
  const shouldConvert =
    entry?.amount_cents !== undefined ||
    entry?.amountCents !== undefined ||
    entry?.unit_amount !== undefined;

  return {
    amount: shouldConvert ? numeric / 100 : numeric,
    currency: entry?.currency || entry?.currency_code || entry?.currencyCode,
  };
};

const formatAmount = (amount, currency = "usd") => {
  if (amount === null || amount === undefined) return "—";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(numeric);
};

const PaymentHistory = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadHistory = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await getPaymentHistory({ page: pageToLoad, limit: 8 });
      const data = response?.data?.data || response?.data || {};
      const newItems = data?.items || data?.history || data?.data || [];
      const normalizedItems = Array.isArray(newItems) ? newItems : [];
      const moreAvailable =
        data?.hasMore ?? data?.has_more ?? normalizedItems.length >= 8;

      setItems((prev) =>
        pageToLoad === 1 ? normalizedItems : [...prev, ...normalizedItems],
      );
      setHasMore(Boolean(moreAvailable));
      setPage(pageToLoad);
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  return (
    <section className="rounded-2xl border border-primary-2/40 bg-white p-6 shadow-lg">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
        <p className="text-sm text-gray-600">Recent billing activity.</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((entry) => {
              const status = (entry.status || "—").toLowerCase();
              const badge = statusStyles[status] || "bg-gray-100 text-gray-700";
              const { amount, currency } = extractAmount(entry);
              const planLabel =
                entry.plan_name ||
                entry.plan?.plan_name ||
                entry.plan?.name ||
                entry.plan ||
                "—";
              return (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(entry.date || entry.created_at)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {planLabel}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatAmount(amount, currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badge}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No payment history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-2 border-t-transparent" />
        ) : (
          hasMore && (
            <button
              type="button"
              onClick={() => loadHistory(page + 1)}
              className="rounded-full border border-primary-1 px-4 py-2 text-xs font-semibold text-primary-1 hover:bg-primary-4"
            >
              Load more
            </button>
          )
        )}
      </div>
    </section>
  );
};

export default PaymentHistory;
