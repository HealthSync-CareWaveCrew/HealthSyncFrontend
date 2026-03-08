import { FiInfo, FiAlertCircle } from 'react-icons/fi';

function AboutDiseasePanel({ selectedDisease }) {
  console.log('AboutDiseasePanel - received selectedDisease:', selectedDisease);
  console.log('AboutDiseasePanel - typeof selectedDisease:', typeof selectedDisease);
  console.log('AboutDiseasePanel - !selectedDisease check:', !selectedDisease);
  
  // No disease selected
  if (!selectedDisease) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-200">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-blue-100 rounded-full p-4">
            <FiInfo className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            No Disease Selected
          </h3>
          <p className="text-gray-600 max-w-md">
            Please select a disease from the dropdown on the left to view detailed information about it.
          </p>
        </div>
      </div>
    );
  }

  // Disease selected but no about information
  if (!selectedDisease.aboutDiseaseItems || selectedDisease.aboutDiseaseItems.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-amber-200">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-amber-100 rounded-full p-4">
            <FiAlertCircle className="w-12 h-12 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            No Information Available
          </h3>
          <p className="text-gray-600 max-w-md">
            Information about <span className="font-semibold">{selectedDisease.name}</span> is not available at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Disease selected with about information
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-primary-2/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary-1/10 rounded-full p-3">
          <FiInfo className="w-6 h-6 text-primary-1" />
        </div>
        <h2 className="text-2xl font-bold text-primary-1">
          About {selectedDisease.name}
        </h2>
      </div>
      
      {selectedDisease.description && (
        <div className="mb-6 p-4 bg-primary-2/5 rounded-xl border border-primary-2/20">
          <p className="text-gray-700 leading-relaxed">
            {selectedDisease.description}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {selectedDisease.aboutDiseaseItems.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-primary-2/10 to-transparent rounded-xl p-5 border border-primary-2/30 hover:border-primary-1/50 transition-all duration-200"
          >
            <h3 className="text-lg font-semibold text-primary-1 mb-2 flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-1 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="pt-0.5">{item.heading}</span>
            </h3>
            <p className="text-gray-700 leading-relaxed pl-8">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 flex items-start gap-2">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>
            This information is provided for educational purposes only. 
            Please consult with a qualified healthcare professional for accurate diagnosis and treatment.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AboutDiseasePanel;
