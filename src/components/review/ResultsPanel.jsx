import { useSelector } from 'react-redux';

function ResultsPanel() {
  const { results } = useSelector((state) => state.analysis);

  if (!results) return null;

  return (
    <section className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <h2 className="text-2xl font-bold text-black mb-6">Analysis Results</h2>

      <div className="space-y-4">
        {/* Match Status */}
        {results.match !== undefined && (
          <div
            className={`p-4 rounded-xl border-2 ${
              results.match
                ? 'bg-green-500/20 border-green-500'
                : 'bg-red-500/20 border-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {results.match ? '✓' : '✗'}
              </span>
              <span className="text-black font-semibold">
                {results.match ? 'Verification Passed' : 'Verification Failed'}
              </span>
            </div>
            {results.reason && (
              <p className="text-black/70 mt-2 text-sm">{results.reason}</p>
            )}
          </div>
        )}

        {/* Disease Information */}
        {results.disease && (
          <div className="bg-primary-3/50 p-4 rounded-xl">
            <h3 className="text-black font-semibold mb-2">Diagnosis</h3>
            <p className="text-primary-1 text-lg">{results.disease}</p>
          </div>
        )}

        {/* Confidence Score */}
        {results.confidence && (
          <div className="bg-primary-3/50 p-4 rounded-xl">
            <h3 className="text-black font-semibold mb-2">Confidence</h3>
            <p className="text-primary-1 text-lg">{results.confidence}</p>
          </div>
        )}

        {/* Description */}
        {results.description && (
          <div className="bg-primary-3/50 p-4 rounded-xl">
            <h3 className="text-black font-semibold mb-2">Detailed Analysis</h3>
            <p className="text-black/80 leading-relaxed">{results.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ResultsPanel;
