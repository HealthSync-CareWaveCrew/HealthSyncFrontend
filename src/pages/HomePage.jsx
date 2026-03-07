import { useSelector } from 'react-redux';
import ModeNavigation from '../components/ModeNavigation';
import ImageAnalysis from '../components/ImageAnalysis';
import ClinicalDataAnalysis from '../components/ClinicalDataAnalysis';
import ResultsPanel from '../components/ResultsPanel';

function HomePage() {
  const { mode, results } = useSelector((state) => state.analysis);

  return (
    <div className="space-y-6">
      <ModeNavigation />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Forms */}
        <div>
          {mode === 'image' ? <ImageAnalysis /> : <ClinicalDataAnalysis />}
        </div>

        {/* Right Column: Results and Chat */}
         <div className="space-y-6">
          {results && <ResultsPanel />}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
