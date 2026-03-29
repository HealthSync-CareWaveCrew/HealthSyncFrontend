import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "../libraries/paymentApi";

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSubscription = (data) => {
  if (!data) return null;
  return data.subscription || data;
};

const extractTrialUsage = (data) => {
  const freeTrialsUsed = normalizeNumber(
    data?.freeTrialsUsed ?? data?.free_trials_used ?? data?.trialUsage?.used,
    0,
  );
  const freeTrialsTotal = normalizeNumber(
    data?.freeTrialsTotal ?? data?.free_trials_total ?? data?.trialUsage?.total,
    3,
  );
  const freeTrialsRemaining = normalizeNumber(
    data?.freeTrialsRemaining ??
      data?.free_trials_remaining ??
      freeTrialsTotal - freeTrialsUsed,
    Math.max(0, freeTrialsTotal - freeTrialsUsed),
  );
  return { freeTrialsUsed, freeTrialsRemaining };
};

const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freeTrialsUsed, setFreeTrialsUsed] = useState(0);
  const [freeTrialsRemaining, setFreeTrialsRemaining] = useState(3);

  useEffect(() => {
    let isMounted = true;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const response = await getSubscriptionStatus();
        const payload = response?.data || {};
        const normalized = normalizeSubscription(payload);
        const { freeTrialsUsed: used, freeTrialsRemaining: remaining } =
          extractTrialUsage(payload);

        if (isMounted) {
          setSubscription(normalized);
          setFreeTrialsUsed(used);
          setFreeTrialsRemaining(remaining);
        }
      } catch (error) {
        if (isMounted) {
          setSubscription(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubscription();

    return () => {
      isMounted = false;
    };
  }, []);

  const status = subscription?.status || subscription?.subscriptionStatus;
  const isActive = status === "active";
  const isTrial = status === "trialing";

  return {
    subscription,
    isActive,
    isTrial,
    freeTrialsUsed,
    freeTrialsRemaining,
    loading,
  };
};

export default useSubscription;
