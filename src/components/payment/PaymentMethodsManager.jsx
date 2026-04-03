import { useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  FaCcAmex,
  FaCcMastercard,
  FaCcVisa,
  FaCreditCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  createSetupIntent,
  deletePaymentMethod,
  getPaymentMethods,
  savePaymentMethod,
  setDefaultPaymentMethod,
} from "../../Redux/Api/api";
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

const brandIcon = (brand) => {
  switch ((brand || "").toLowerCase()) {
    case "visa":
      return <FaCcVisa className="text-blue-600" />;
    case "mastercard":
      return <FaCcMastercard className="text-red-500" />;
    case "amex":
      return <FaCcAmex className="text-indigo-500" />;
    default:
      return <FaCreditCard className="text-gray-500" />;
  }
};

const PaymentMethodsManager = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const response = await getPaymentMethods();
      const data = response?.data?.data || [];
      setMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

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
      toast.success("Card added successfully.");
      setShowModal(false);
      await loadMethods();
    } catch (error) {
      toast.error("Unable to add card. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    setProcessing(true);
    try {
      await deletePaymentMethod(id);
      toast.success("Payment method removed.");
      await loadMethods();
    } catch (error) {
      toast.error("Failed to remove payment method.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSetDefault = async (id) => {
    setProcessing(true);
    try {
      await setDefaultPaymentMethod(id);
      toast.success("Default payment method updated.");
      await loadMethods();
    } catch (error) {
      toast.error("Unable to update default payment method.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-black">Payment Methods</h3>
          <p className="text-sm text-black/60">Manage saved cards.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-full bg-primary-1 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-2"
        >
          Add new card
        </button>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-2 border-t-transparent" />
        </div>
      ) : methods.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">
          No cards saved yet. Add a card to subscribe to a plan.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex flex-col gap-3 rounded-xl border border-primary-2/20 bg-primary-4/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{brandIcon(method.brand)}</div>
                <div className="text-sm text-black/70">
                  <p className="font-semibold">
                    {method.brand?.toUpperCase() || "Card"} **** {method.last4}
                  </p>
                  <p className="text-xs text-black/60">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
                {method.is_default && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Default
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {!method.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(method.id)}
                    disabled={processing}
                    className="rounded-full border border-primary-2/40 px-3 py-1 text-xs font-semibold text-black/60 hover:border-primary-2"
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(method.id)}
                  disabled={processing}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-primary-2/30 bg-primary-4 p-6 shadow-2xl backdrop-blur-md">
            <h4 className="text-lg font-bold text-black">Add new card</h4>
            <div className="mt-4 rounded-xl border border-primary-2/30 bg-white/70 p-3">
              <CardElement options={cardElementOptions} />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-primary-2/40 px-4 py-2 text-sm font-semibold text-black/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCard}
                disabled={processing || !stripe}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  processing || !stripe
                    ? "bg-primary-2/60"
                    : "bg-primary-1 hover:bg-primary-2"
                }`}
              >
                {processing ? "Saving..." : "Save card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PaymentMethodsManager;
