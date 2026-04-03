// ResultsPanel.jsx
import { useSelector } from 'react-redux';

function ResultsPanel() {
  const { results } = useSelector((state) => state.analysis);

  if (!results) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>

      <div className="space-y-3">
        {results.match !== undefined && (
          <div className={`p-3 rounded ${results.match ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="font-medium">{results.match ? '✓ Test Passed' : '✗ Test Failed'}</p>
            {results.reason && <p className="text-sm text-gray-600 mt-1">{results.reason}</p>}
          </div>
        )}

        {results.disease && (
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
            <p className="font-semibold text-primary-1">{results.disease}</p>
          </div>
        )}

        {results.confidence && (
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <p className="text-sm text-gray-600 mb-1">Confidence</p>
            <p className="font-semibold text-primary-1">{results.confidence}</p>
          </div>
        )}

        {results.description && (
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <p className="text-sm text-gray-600 mb-1">Analysis</p>
            <p className="text-gray-700">{results.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;