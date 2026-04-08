// ClinicalDataAnalysis.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDiseaseType,
  setSelectedDisease as setSelectedDiseaseAction,
  clearError,
  analyzeClinicalDataThunk,
} from '../Redux/Features/analysisSlice';
import {
  addMessage,
  clearChat,
  enableChat,
  setSystemInstruction,
} from '../Redux/Features/chatSlice';
import { fetchDiseasesByType } from '../Redux/Features/diseaseSlice';
import DiseaseSelector from './DiseaseSelector';
import DynamicFormFields from './DynamicFormFields';

function ClinicalDataAnalysis() {
  const dispatch = useDispatch();
  const { diseaseType, loading, error } = useSelector((state) => state.analysis);
  const [formData, setFormData] = useState({});
  const [selectedDisease, setSelectedDisease] = useState(null);

  useEffect(() => {
    dispatch(fetchDiseasesByType('text'));
  }, [dispatch]);

  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    dispatch(setSelectedDiseaseAction(disease));
    setFormData({});
    dispatch(setDiseaseType(disease?.name || ''));
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const resultAction = await dispatch(
      analyzeClinicalDataThunk({
        diseaseType,
        formData,
        diseaseId: selectedDisease._id,
      })
    );

    if (analyzeClinicalDataThunk.fulfilled.match(resultAction)) {
      const result = resultAction.payload.data;

      const contextType = `${diseaseType} clinical data`;
      const instruction = `You are an advanced medical AI assistant.
Context: The user provided data/image for ${contextType}.
Analysis Result: ${result.disease}.
Confidence: ${result.confidence}.
Findings: ${result.description || 'No additional findings provided.'}.

Your goal is to answer the user's questions based on this diagnosis. Be professional, empathetic, and clear.

IMPORTANT RULES:
1. Only answer questions related to medical topics, health, care, diagnosis, or the specific analysis provided.
2. If the user asks about anything unrelated (e.g., coding, general knowledge, sports, entertainment), politely refuse.
   Response for unrelated topics: "I am designed to assist with medical and health-related inquiries only. Please ask a question related to medical care or diagnosis."
3. Always advise consulting a real doctor for final confirmation.`;

      dispatch(clearChat());
      dispatch(setSystemInstruction(instruction));
      dispatch(enableChat());
      dispatch(
        addMessage({
          role: 'model',
          parts: [{ text: `I've reviewed the analysis for ${result.disease}. What questions do you have?` }],
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Clinical Data Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Disease Context
          </label>
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <DiseaseSelector
              predictionType="text"
              onDiseaseSelect={handleDiseaseSelect}
              selectedDiseaseId={selectedDisease?.diseaseId}
            />
          </div>
        </div>

        {selectedDisease && selectedDisease.fields?.length > 0 && (
          <div className="max-h-96 p-2 overflow-y-auto">
            <DynamicFormFields
              fields={selectedDisease.fields}
              formData={formData}
              onFieldChange={handleFieldChange}
            />
          </div>
        )}

        {selectedDisease && selectedDisease.fields?.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
            This disease uses image-based prediction. Please use the Image Analysis section.
          </div>
        )}

        <button
          type="submit"
          disabled={!diseaseType || loading}
          className="w-full bg-primary-1 text-white py-2 rounded hover:bg-primary-2 transition disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Clinical Data'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default ClinicalDataAnalysis;