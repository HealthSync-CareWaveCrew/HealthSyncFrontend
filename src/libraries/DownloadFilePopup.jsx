import React, { useEffect, useRef } from "react";
import { FaFileArrowDown } from "react-icons/fa6";

export const DownloadPopup = ({ downloadOptions,isDownloadPopupOpen, setIsDownloadPopupOpen, onExportCsv, printTable, downloadExcelFromCsv, downloadPdfFromCsv }) => {
     const downloadPopupRef = useRef(null);
      useEffect(() => {
         const handleClickOutside = (event) => {
           if (downloadPopupRef.current && !downloadPopupRef.current.contains(event.target)) {
            setIsDownloadPopupOpen(false)
          }
         };
     
         document.addEventListener('mousedown', handleClickOutside);
         return () => {
           document.removeEventListener('mousedown', handleClickOutside);
         };
       }, []);
    return (
        <div>
            <button
                className="relative rounded-lg h-fit"
                onClick={() => setIsDownloadPopupOpen(prev => !prev)}
            >
                <FaFileArrowDown className="justify-center" size={20} />
                {isDownloadPopupOpen && (
                    <div
                    ref={downloadPopupRef}
                        className="absolute right-0 mt-2 w-36 z-50 bg-white border border-gray-300 shadow-lg rounded-lg"
                    >
                        <ul>
                            {downloadOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-200"
                                    onClick={() => {
                                        if (option === "CSV") {
                                            console.log("Exporting CSV...");
                                            onExportCsv();
                                        } else if (option === "Print") {
                                            printTable();
                                        }
                                        else if (option === "EXCEL") {
                                            downloadExcelFromCsv();
                                        }
                                        else if (option === "PDF") {
                                            downloadPdfFromCsv();
                                        }
                                    }}
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </button>
        </div>
    );
};
