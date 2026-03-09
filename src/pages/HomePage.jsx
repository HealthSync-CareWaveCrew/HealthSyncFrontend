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

    // Show About Disease panel only when results and chat are not showing
  const showAboutPanel = !results && !isChatEnabled;
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
          {showAboutPanel && <AboutDiseasePanel selectedDisease={selectedDisease} />}
          {results && <ResultsPanel />}
          {isChatEnabled && <ChatPanel />}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
