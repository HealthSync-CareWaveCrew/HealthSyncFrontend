import React, { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";
import { FaAngleDown } from "react-icons/fa";

/* ------------------------------------------------------------
   Helper
------------------------------------------------------------ */
const cx = (...cls) => cls.filter(Boolean).join(" ");


/* ============================================================
   1) Advanced Pagination (with Entries Per Page)
============================================================ */
export const AdvancedPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => { },
  onEntriesPerPageChange = () => { },
  defaultEntries = 10,
  height = 36,
  width = 36,
  color = "#E36A6A",
  bgColor = "#FFFBF1",
  borderColor = "#FFB2B2",
  entriesOptions = [10, 25, 50, 75],
  showInput = true,
  totalEntries = 100,
  className = "",
}) => {
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntries);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  const handleEntriesChange = (val) => {
    setEntriesPerPage(val);
    onEntriesPerPageChange(val);
  };

  // ✅ Generate pages array with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // Show all pages if 5 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const range = 2; // Pages before/after current
    // const start = currentPage > 8 ? 6 : Math.max(1, currentPage - range);
    // const end = currentPage < 4 ? 6 : Math.min(totalPages, currentPage + range);
    const start = currentPage > totalPages - 3 ? totalPages - 5 : Math.max(1, currentPage - range);
    const end = currentPage < 4 ? 6 : Math.min(totalPages, currentPage + range);

    // Add first page
    pages.push(1);

    // Add ellipsis if needed
    if (start > 2) {
      pages.push("...");
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Add last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cx(
        "flex flex-col sm:flex-row justify-center items-center gap-4 mt-4 text-black/80",
        className
      )}
    >
      {/* Entries selector */}
      <div className="flex items-center gap-2 text-sm">
        <span>Show</span>
        {/* <select
          value={entriesPerPage}
          onChange={(e) => handleEntriesChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
          style={{
            backgroundColor: bgColor,
            borderColor,
            height,
            width: width + 30,
          }}
        >
          {entriesOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select> */}
        <div className="relative inline-block">
          <select
            value={entriesPerPage}
            onChange={(e) => handleEntriesChange(Number(e.target.value))}
            className="appearance-none border rounded px-2 py-1 pr-8 bg-primary-4 text-black border-primary-2/70 focus:outline-none focus:ring-2 focus:ring-primary-1/30"
            style={{
              backgroundColor: bgColor,
              borderColor,
              height,
              width: width + 30,
            }}
          >
            {entriesOptions.map((opt) => (
              <option key={opt} value={opt==='All' ? totalEntries : opt}>
                {opt}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/60">
            <FaAngleDown />
          </span>
        </div>

        <span>Entries</span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center gap-1 pl-1 pr-2 py-1 border rounded text-sm bg-primary-4 text-black border-primary-2/70 hover:bg-primary-3/70 disabled:opacity-40"
          style={{
            backgroundColor: bgColor,
            borderColor,
            height,
          }}
          disabled={currentPage === 1}
        >
          <IoIosArrowBack /> Back
        </button>

        {/* ✅ Updated: Show only 5 pages with ellipsis */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 flex items-center justify-center text-black/50"
              style={{ height }}
            >
              <FiMoreHorizontal size={18} />
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={cx(
                "border-2 rounded hidden sm:inline-flex justify-center items-center font-medium transition-all",
                currentPage === p
                  ? "bg-primary-1 text-white border-primary-1"
                  : "bg-primary-3 text-black/80 border-primary-2 hover:bg-primary-2/60"
              )}
              style={{ height, width }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center gap-1 pl-2 pr-1 py-1 border rounded text-sm bg-primary-4 text-black border-primary-2/70 hover:bg-primary-3/70 disabled:opacity-40"
          style={{
            backgroundColor: bgColor,
            borderColor,
            height,
          }}
          disabled={currentPage === totalPages}
        >
          Next <IoIosArrowForward />
        </button>
      </div>

      {/* Input for direct page jump */}
      {showInput && (
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span>Page</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 w-16 bg-primary-4 text-black border-primary-2/70 focus:outline-none focus:ring-2 focus:ring-primary-1/30"
            style={{
              backgroundColor: bgColor,
              borderColor,
              height,
            }}
          />
          <span>Go</span>
        </div>
      )}
    </div>
  );
};
