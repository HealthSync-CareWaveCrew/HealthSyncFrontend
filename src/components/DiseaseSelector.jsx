import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllDiseases, fetchDiseasesByType } from '../Redux/Features/diseaseSlice';

const DiseaseSelector = ({ predictionType, onDiseaseSelect, selectedDiseaseId }) => {
  const dispatch = useDispatch();
  const { diseases, loading, error } = useSelector(
    (state) => state.disease
  );

  useEffect(() => {
    // Fetch diseases based on prediction type
    if (predictionType) {
      dispatch(fetchDiseasesByType(predictionType));
    } else {
      dispatch(fetchAllDiseases());
    }
  }, [dispatch, predictionType]);

  // Use diseases array directly - it already contains filtered results from the API
  const availableDiseases = diseases;

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-1 mx-auto"></div>
        <p className="text-black/70 mt-2">Loading diseases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-400 rounded-lg p-4">
        <p className="text-red-200">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <select
        value={selectedDiseaseId || ''}
        onChange={(e) => {
          const disease = availableDiseases.find(d => d.diseaseId === e.target.value);
          onDiseaseSelect(disease);
        }}
        className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
      >
        <option value="" className="text-gray-900">-- Select a disease --</option>
        {availableDiseases.map((disease) => (
          <option key={disease.diseaseId} value={disease.diseaseId} className="text-gray-900">
            {disease.name}
          </option>
        ))}
      </select>
      {selectedDiseaseId && (
        <p className="text-sm text-black/70 mt-2">
          {availableDiseases.find(d => d.diseaseId === selectedDiseaseId)?.description}
        </p>
      )}
    </div>
  );
};

export default DiseaseSelector;
