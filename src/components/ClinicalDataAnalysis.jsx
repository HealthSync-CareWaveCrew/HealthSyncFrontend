import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDiseaseType,
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

  console.log('ClinicalDataAnalysis Rendered - diseaseType:', diseaseType, 'selectedDisease:', selectedDisease);
  // Fetch text-based diseases on component mount
  useEffect(() => {
    dispatch(fetchDiseasesByType('text'));
  }, [dispatch]);

  // Handle disease selection
  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    setFormData({}); // Reset form when disease changes
    if (disease) {
      dispatch(setDiseaseType(disease.name));
    } else {
      dispatch(setDiseaseType(''));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
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

      // Enable chat after successful analysis
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
          parts: [
            {
              text: `I've reviewed the analysis for ${result.disease}. What questions do you have about the diagnosis, symptoms, treatment options, or next steps? Please consult a doctor for confirmation.`,
            },
          ],
        })
      );
    }
  };


  return (
    <section className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <h2 className="text-2xl font-bold text-black mb-6">Clinical Data Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disease Type Selector */}
        <div>
          <label className="block text-black font-medium mb-2">
            Select Disease Context
          </label>
          <div className="bg-primary-3/50 border border-primary-2/30 rounded-xl p-4">
            <DiseaseSelector
              predictionType="text"
              onDiseaseSelect={handleDiseaseSelect}
              selectedDiseaseId={selectedDisease?.diseaseId}
            />
          </div>
        </div>

        {/* Dynamic Form Fields */}
        {selectedDisease && selectedDisease.fields.length > 0 ? (
          <div className="max-h-96 overflow-y-auto p-2">
            <div className="space-y-4">
              <DynamicFormFields
                fields={selectedDisease.fields}
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>
        ) : selectedDisease && selectedDisease.fields.length === 0 ? (
          <div className="bg-yellow-500/20 border border-yellow-500 text-black px-4 py-3 rounded-xl">
            This disease uses image-based prediction. Please use the Image Analysis section.
          </div>
        ) : (
          <div className="text-black/60 text-center py-8">
            Select a disease to view input fields...
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!diseaseType || loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary-2 to-primary-1 text-white font-bold rounded-xl hover:from-primary-2/90 hover:to-primary-1/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Clinical Data'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-black px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
      </form>
    </section>
  );
}

export default ClinicalDataAnalysis;
