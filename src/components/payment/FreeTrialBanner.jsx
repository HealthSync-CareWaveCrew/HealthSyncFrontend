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
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-black">
          {freeTrialsUsed} of 3 free predictions used. Upgrade for unlimited
          access.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate("/payment")}
            className="rounded-lg bg-primary-1 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-2"
          >
            Upgrade
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-primary-2 hover:text-gray-800"
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
