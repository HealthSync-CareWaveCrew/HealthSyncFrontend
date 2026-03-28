import React, { useEffect, useRef } from "react";
import { 
  FaFileArrowDown, 
  FaFileCsv, 
  FaFileExcel, 
  FaFilePdf, 
  FaPrint 
} from "react-icons/fa6";

export const DownloadPopup = ({ downloadOptions, isDownloadPopupOpen, setIsDownloadPopupOpen, onExportCsv, printTable, downloadExcelFromCsv, downloadPdfFromCsv }) => {
  const downloadPopupRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadPopupRef.current && !downloadPopupRef.current.contains(event.target)) {
        setIsDownloadPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsDownloadPopupOpen]);

  const getIcon = (option) => {
    switch (option) {
      case "CSV":
        return <FaFileCsv size={14} />;
      case "EXCEL":
        return <FaFileExcel size={14} />;
      case "PDF":
        return <FaFilePdf size={14} />;
      case "Print":
        return <FaPrint size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <button
        className="relative rounded-lg flex items-center justify-center p-1  transition-colors"
        onClick={() => setIsDownloadPopupOpen(prev => !prev)}
      >
        <FaFileArrowDown size={20} className="text-gray-600 hover:text-primary-1 transition-colors" />
      </button>
      
      {isDownloadPopupOpen && (
        <div
          ref={downloadPopupRef}
          className="absolute right-0 mt-2 w-40 z-50 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden"
        >
          <ul className="py-1">
            {downloadOptions.map((option, index) => (
              <li
                key={index}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  if (option === "CSV") {
                    onExportCsv();
                  } else if (option === "Print") {
                    printTable();
                  } else if (option === "EXCEL") {
                    downloadExcelFromCsv();
                  } else if (option === "PDF") {
                    downloadPdfFromCsv();
                  }
                  setIsDownloadPopupOpen(false);
                }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-primary-1 hover:text-white">
                  {getIcon(option)}
                </span>
                <span>{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};