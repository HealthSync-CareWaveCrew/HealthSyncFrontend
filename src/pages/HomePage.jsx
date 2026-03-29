// HomePage.jsx
import { useSelector } from 'react-redux';
import ModeNavigation from '../components/ModeNavigation';
import ImageAnalysis from '../components/ImageAnalysis';
import ClinicalDataAnalysis from '../components/ClinicalDataAnalysis';
import ResultsPanel from '../components/ResultsPanel';
import ChatPanel from '../components/ChatPanel';
import AboutDiseasePanel from '../components/AboutDiseasePanel';

function HomePage() {
  const { mode, results, selectedDisease } = useSelector((state) => state.analysis);
  const { isChatEnabled } = useSelector((state) => state.chat);

  const showAboutPanel = !results && !isChatEnabled;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ModeNavigation />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column */}
          <div>
            {mode === 'image' ? <ImageAnalysis /> : <ClinicalDataAnalysis />}
          </div>

          {/* Right Column */}
          <div>
            {showAboutPanel && <AboutDiseasePanel selectedDisease={selectedDisease} />}
            {results && <ResultsPanel />}
            {isChatEnabled && <ChatPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;