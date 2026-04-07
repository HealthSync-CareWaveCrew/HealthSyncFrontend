import { useEffect, useState } from "react";
import { getSubscriptionStatus } from "../Redux/Api/api";

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSubscription = (data) => {
  if (!data) return null;
  return data.subscription || data.data || data;
};

const normalizeSubscriptions = (data) => {
  const source = data?.subscriptions || data?.data?.subscriptions || {};
  return {
    text: source?.text || null,
    image: source?.image || null,
  };
};

const extractTrialUsage = (data) => {
  const source = data?.data || data;
  const freeTrialsUsed = normalizeNumber(
    source?.freeTrialsUsed ??
      source?.free_trials_used ??
      source?.trialUsage?.used ??
      data?.freeTrialsUsed ??
      data?.free_trials_used ??
      data?.trialUsage?.used,
    0,
  );
  const freeTrialsTotal = normalizeNumber(
    source?.freeTrialsTotal ??
      source?.free_trials_total ??
      source?.trialUsage?.total ??
      data?.freeTrialsTotal ??
      data?.free_trials_total ??
      data?.trialUsage?.total,
    3,
  );
  const freeTrialsRemaining = normalizeNumber(
    source?.freeTrialsRemaining ??
      source?.free_trials_remaining ??
      data?.freeTrialsRemaining ??
      data?.free_trials_remaining ??
      freeTrialsTotal - freeTrialsUsed,
    Math.max(0, freeTrialsTotal - freeTrialsUsed),
  );
  return { freeTrialsUsed, freeTrialsRemaining };
};

const useSubscription = (feature) => {
  const [subscription, setSubscription] = useState(null);
  const [subscriptions, setSubscriptions] = useState({
    text: null,
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [freeTrialsUsed, setFreeTrialsUsed] = useState(0);
  const [freeTrialsRemaining, setFreeTrialsRemaining] = useState(3);

  useEffect(() => {
    let isMounted = true;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const response = await getSubscriptionStatus(feature);
        const payload = response?.data || {};
        const normalizedByType = normalizeSubscriptions(payload);
        const normalized =
          feature && normalizedByType[feature] !== undefined
            ? normalizedByType[feature]
            : normalizeSubscription(payload);
        const { freeTrialsUsed: used, freeTrialsRemaining: remaining } =
          extractTrialUsage(payload);

        if (isMounted) {
          setSubscriptions(normalizedByType);
          setSubscription(normalized);
          setFreeTrialsUsed(used);
          setFreeTrialsRemaining(remaining);
        }
      } catch (error) {
        if (isMounted) {
          setSubscriptions({ text: null, image: null });
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
  }, [feature]);

  const status = subscription?.status || subscription?.subscriptionStatus;
  const isActive = status === "active";

  return {
    subscription,
    subscriptions,
    isActive,
    freeTrialsUsed,
    freeTrialsRemaining,
    loading,
  };
};

export default useSubscription;
