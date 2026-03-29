// ImageAnalysis.jsx
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDiseaseType,
  setSelectedDisease as setSelectedDiseaseAction,
  setUploadedFile,
  clearUploadedFile,
  clearError,
  analyzeImageData,
} from '../Redux/Features/analysisSlice';
import {
  addMessage,
  clearChat,
  enableChat,
  setSystemInstruction,
} from '../Redux/Features/chatSlice';
import { fetchDiseasesByType } from '../Redux/Features/diseaseSlice';
import DiseaseSelector from './DiseaseSelector';

function ImageAnalysis() {
  const dispatch = useDispatch();
  const { diseaseType, previewUrl, loading, error } = useSelector(
    (state) => state.analysis
  );
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);

  useEffect(() => {
    dispatch(fetchDiseasesByType('image'));
  }, [dispatch]);

  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    dispatch(setSelectedDiseaseAction(disease));
    dispatch(setDiseaseType(disease?.name || ''));
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      dispatch(setError('Please upload a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(setUploadedFile({ file, url: e.target.result }));
      dispatch(clearError());
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files[0] || !diseaseType) return;

    dispatch(clearError());

    const resultAction = await dispatch(
      analyzeImageData({
        file: fileInputRef.current.files[0],
        diseaseType,
        diseaseId: selectedDisease._id,
      })
    );
    

    if (analyzeImageData.fulfilled.match(resultAction)) {
      const result = resultAction.payload?.data;
      const contextType = `${diseaseType} image`;
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

  const handleClearImage = () => {
    dispatch(clearUploadedFile());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical Image Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Disease Context
          </label>
          <div className="bg-gray-50 rounded border border-gray-200 p-3">
            <DiseaseSelector
              predictionType="image"
              onDiseaseSelect={handleDiseaseSelect}
              selectedDiseaseId={selectedDisease?.diseaseId}
            />
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragging ? 'border-primary-1 bg-primary-3' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative inline-block">
              <img src={previewUrl} alt="Preview" className="max-h-48 rounded" />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Drop image here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, DICOM supported</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!diseaseType || !previewUrl || loading}
          className="w-full bg-primary-1 text-white py-2 rounded hover:bg-primary-2 transition disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
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

export default ImageAnalysis;