// AboutDiseasePanel.jsx
function AboutDiseasePanel({ selectedDisease }) {
  if (!selectedDisease) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Select a disease to view information</p>
      </div>
    );
  }

  if (!selectedDisease.aboutDiseaseItems?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">No information available for {selectedDisease.name}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">About {selectedDisease.name}</h2>
      
      {selectedDisease.description && (
        <div className="bg-gray-50 rounded border border-gray-200 p-3 mb-4">
          <p className="text-gray-700">{selectedDisease.description}</p>
        </div>
      )}

      <div className="space-y-3">
        {selectedDisease.aboutDiseaseItems.map((item, index) => (
          <div key={index} className="border-l-2 border-primary-1 pl-3">
            <h3 className="font-semibold text-gray-800 mb-1">{item.heading}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-500 text-center">
        ⚠️ For educational purposes only. Please consult a healthcare professional.
      </div>
    </div>
  );
}

export default AboutDiseasePanel;