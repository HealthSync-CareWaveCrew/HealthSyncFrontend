// ModeNavigation.jsx
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setSelectedDisease } from '../Redux/Features/analysisSlice';
import { disableChat } from '../Redux/Features/chatSlice';

function ModeNavigation() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.analysis);

  const handleModeChange = (newMode) => {
    dispatch(setMode(newMode));
    dispatch(disableChat());
    dispatch(setSelectedDisease(null));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1">
      <button
        onClick={() => handleModeChange('image')}
        className={`flex-1 py-2 px-4 rounded font-medium transition ${
          mode === 'image'
            ? 'bg-primary-1 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        Image Analysis
      </button>
      <button
        onClick={() => handleModeChange('clinical')}
        className={`flex-1 py-2 px-4 rounded font-medium transition ${
          mode === 'clinical'
            ? 'bg-primary-1 text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        Clinical Data
      </button>
    </div>
  );
}

export default ModeNavigation;