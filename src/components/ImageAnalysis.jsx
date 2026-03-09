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

  // Fetch image-based diseases on component mount
  useEffect(() => {
    dispatch(fetchDiseasesByType('image'));
  }, [dispatch]);

  // Handle disease selection
  const handleDiseaseSelect = (disease) => {
    setSelectedDisease(disease);
    dispatch(setSelectedDiseaseAction(disease));
    if (disease) {
      dispatch(setDiseaseType(disease.name));
    } else {
      dispatch(setDiseaseType(''));
    }
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
    
    if (!fileInputRef.current?.files[0] || !diseaseType) {
      return;
    }

    dispatch(clearError());

    const resultAction = await dispatch(
      analyzeImageData({
        file: fileInputRef.current.files[0],
        diseaseType,
        diseaseId: selectedDisease._id,
      })
    );

    if (analyzeImageData.fulfilled.match(resultAction)) {
      const result = resultAction.payload;
      
      // Enable chat after successful analysis
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="bg-primary-4 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-primary-2/30">
      <h2 className="text-2xl font-bold text-black mb-6">Medical Image Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disease Type Selector */}
        <div>
          <label className="block text-black font-medium mb-2">
            Select Disease Context
          </label>
          <div className="bg-primary-3/50 border border-primary-2/30 rounded-xl p-4">
            <DiseaseSelector
              predictionType="image"
              onDiseaseSelect={handleDiseaseSelect}
              selectedDiseaseId={selectedDisease?.diseaseId}
            />
          </div>
        </div>

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary-1 bg-primary-2/20'
              : 'border-primary-2/50 hover:border-primary-2'
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
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearImage();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="text-black">
              <svg
                className="mx-auto mb-4"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p className="mb-2">Drag & Drop medical image here</p>
              <span className="text-primary-1 font-semibold">or Browse Files</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!diseaseType || !previewUrl || loading}
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
            'Analyze Image'
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

export default ImageAnalysis;
