import api from "../Redux/Api/api";

export const getPaymentPlans = async () => {
  const response = await api.get("/api/payment/plans");
  return response;
};

export const getSubscriptionStatus = async () => {
  const response = await api.get("/api/payment/subscription-status");
  return response;
};

export const getPaymentMethods = async () => {
  const response = await api.get("/api/payment/payment-methods");
  return response;
};

export const createSetupIntent = async () => {
  const response = await api.post("/api/payment/setup-intent");
  return response;
};

export const savePaymentMethod = async (stripePmId) => {
  const response = await api.post("/api/payment/save-payment-method", {
    stripe_pm_id: stripePmId,
  });
  return response;
};

export const subscribeToPlan = async ({ planId, paymentMethodId }) => {
  const response = await api.post("/api/payment/subscribe", {
    plan_id: planId,
    payment_method_id: paymentMethodId,
  });
  return response;
};

export const cancelSubscription = async (subscription_id) => {
  const response = await api.post("/api/payment/cancel-subscription", {
    subscription_id,
  });
  return response;
};

export const deletePaymentMethod = async (paymentMethodId) => {
  const response = await api.delete(
    `/api/payment/payment-method/${paymentMethodId}`,
  );
  return response;
};

export const setDefaultPaymentMethod = async (paymentMethodId) => {
  const response = await api.put(
    `/api/payment/payment-method/${paymentMethodId}/default`,
  );
  return response;
};

export const getPaymentHistory = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get("/api/payment/history", {
    params: { page, limit },
  });
  return response;
};
