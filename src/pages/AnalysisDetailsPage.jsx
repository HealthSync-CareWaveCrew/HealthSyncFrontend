import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  clearSelectedAnalysis,
  fetchAnalysisByIdThunk,
} from '../Redux/Features/analysisSlice';

export default function AnalysisDetailsPage({ isAdmin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { selectedAnalysis, selectedAnalysisLoading, selectedAnalysisError } = useSelector(
    (state) => state.analysis
  );

  const backPath = useMemo(
    () => (isAdmin ? '/admin/analysis-history' : '/user/analysis-history'),
    [isAdmin]
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchAnalysisByIdThunk(id));
    }

    return () => {
      dispatch(clearSelectedAnalysis());
    };
  }, [dispatch, id]);

  if (selectedAnalysisLoading) {
    return (
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-1"></div>
        </div>
      </div>
    );
  }

  if (selectedAnalysisError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
          {selectedAnalysisError}
        </div>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="px-4 py-2 bg-primary-1 text-white rounded-lg"
        >
          Back to Analysis History
        </button>
      </div>
    );
  }

  if (!selectedAnalysis) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-100 border border-yellow-300 text-black px-4 py-3 rounded-xl">
          Analysis details not found.
        </div>
        <Link to={backPath} className="inline-block px-4 py-2 bg-primary-1 text-white rounded-lg">
          Back to Analysis History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Analysis Details</h2>
            <p className="text-black/70">Complete analysis information with result metadata.</p>
          </div>
          <Link to={backPath} className="px-4 py-2 bg-primary-1 text-white rounded-lg text-sm">
            Back
          </Link>
        </div>
      </div>

      <div className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-semibold text-black/70">Analysis Type</p>
            <p className="text-black capitalize mt-1">{selectedAnalysis.type || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black/70">Disease</p>
            <p className="text-black mt-1">
              {selectedAnalysis.diseaseType || selectedAnalysis.disease?.name || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black/70">Created At</p>
            <p className="text-black mt-1">
              {selectedAnalysis.createdAt ? new Date(selectedAnalysis.createdAt).toLocaleString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black/70">Match Status</p>
            <span
              className={`mt-1 inline-block px-3 py-1 rounded text-sm font-semibold ${
                selectedAnalysis.results?.match
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {selectedAnalysis.results?.match ? 'Match Found' : 'No Match'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-semibold text-black/70">Predicted Disease</p>
            <p className="text-black mt-1 font-medium">{selectedAnalysis.results?.disease || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-black/70">Confidence</p>
            <p className="text-black mt-1 font-medium">{selectedAnalysis.results?.confidence || '-'}</p>
          </div>
        </div>

        {selectedAnalysis.results?.description && (
          <div>
            <p className="text-sm font-semibold text-black/70">Description</p>
            <p className="text-black mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedAnalysis.results.description}
            </p>
          </div>
        )}

        {selectedAnalysis.results?.reason && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm font-semibold text-yellow-900/70">Reason</p>
            <p className="text-yellow-900 mt-2 text-sm">{selectedAnalysis.results.reason}</p>
          </div>
        )}

        {selectedAnalysis.type === 'image' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-black/70">Input Image</p>
            {selectedAnalysis.inputImageUrl ? (
              <div className="space-y-3">
                <img
                  src={selectedAnalysis.inputImageUrl}
                  alt="Uploaded analysis input"
                  className="w-full max-w-xl rounded-xl border border-primary-2/30 object-cover"
                />
                <a
                  href={selectedAnalysis.inputImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-1 underline text-sm"
                >
                  Open full image
                </a>
              </div>
            ) : (
              <p className="text-black/60 text-sm">Input image URL is not available.</p>
            )}
          </div>
        )}

        {selectedAnalysis.type === 'clinical' && (
          <div>
            <p className="text-sm font-semibold text-black/70">Clinical Data</p>
            {selectedAnalysis.formData && Object.keys(selectedAnalysis.formData).length > 0 ? (
              <div className="mt-2 space-y-2 bg-white rounded-lg p-4 border border-primary-2/30">
                {Object.entries(selectedAnalysis.formData).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm gap-6">
                    <span className="text-black/70 capitalize">{key}</span>
                    <span className="text-black font-medium break-all">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-black/60 text-sm mt-1">No clinical form data available.</p>
            )}
          </div>
        )}

        {isAdmin && selectedAnalysis.user && (
          <div className="bg-white rounded-lg p-4 border border-primary-2/30">
            <p className="text-sm font-semibold text-black/70">User Info</p>
            <p className="text-black mt-2 font-medium">{selectedAnalysis.user.name || '-'}</p>
            <p className="text-black/70 text-sm">{selectedAnalysis.user.email || '-'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
