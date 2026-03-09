import { useDispatch, useSelector } from 'react-redux';
import { setMode } from '../Redux/Features/analysisSlice';
import { disableChat } from '../Redux/Features/chatSlice';

function ModeNavigation() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.analysis);

  const handleModeChange = (newMode) => {
    dispatch(setMode(newMode));
    dispatch(disableChat());
  };

  return (
    <nav className="bg-primary-4 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-primary-2/30 flex gap-2">
      <button
        onClick={() => handleModeChange('image')}
        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
          mode === 'image'
            ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
            : 'text-black hover:bg-primary-3/50'
        }`}
      >
        Image Analysis
      </button>
      <button
        onClick={() => handleModeChange('clinical')}
        className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
          mode === 'clinical'
            ? 'bg-gradient-to-r from-primary-2 to-primary-1 text-white shadow-lg'
            : 'text-black hover:bg-primary-3/50'
        }`}
      >
        Clinical Data
      </button>
    </nav>
  );
}

export default ModeNavigation;
