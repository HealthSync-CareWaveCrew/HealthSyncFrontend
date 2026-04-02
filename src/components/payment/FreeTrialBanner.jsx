import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSubscription from "../../hooks/useSubscription";

const FreeTrialBanner = () => {
  const navigate = useNavigate();
  const { freeTrialsUsed, freeTrialsRemaining, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (loading || dismissed) return null;
  if (freeTrialsUsed < 1 || freeTrialsUsed > 2) return null;

  return (
    <div className="rounded-2xl border border-primary-2/30 bg-primary-4 p-4 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-black">
          {freeTrialsUsed} of 3 free predictions used. Upgrade for unlimited
          access.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/payment")}
            className="rounded-full bg-primary-1 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-2"
          >
            Upgrade
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full border border-primary-2/40 px-4 py-2 text-xs font-semibold text-black/60 transition hover:border-primary-2"
          >
            Dismiss
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-black/60">
        {freeTrialsRemaining} free prediction
        {freeTrialsRemaining === 1 ? "" : "s"} remaining.
      </p>
    </div>
  );
};

export default FreeTrialBanner;
