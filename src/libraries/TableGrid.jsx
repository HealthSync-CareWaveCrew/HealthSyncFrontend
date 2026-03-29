// src/components/common/TableGrid.jsx
import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { FaFilter } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";
import { BsTable } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import { TbArrowsSort } from "react-icons/tb";
import { Link } from "react-router-dom";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";

import { DownloadPopup } from "./DownloadFilePopup";
import DateRangePicker from "./DateRange/DateRangePicker";
import { GhostButton, Button as CommonButton } from "./Buttons.jsx";
import { MultiselectDropdown, SearchableDropdown } from "./DropDowns.jsx";
import { AdvancedPagination } from "./Pagination.jsx";
import { TableGridCard } from "./Cards.jsx";
import { TableExport } from "./TableExport.jsx";

const ACTIONS_COL_W = 160;
const MENU_COL_W = 48;
const DEFAULT_MIN_ROWS = 10;

// Header Filter Sizing
const HF_POPOVER_W = 230;
const HF_CONTROL_W = 210;
const HF_DATE_POPOVER_W = 480;
const HF_ZINDEX = 10000;
const HF_DATE_ZINDEX = 10020;

/* Popover Components */
const Popover = ({ children, placement = "bottom" }) => {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current && 
        !wrapperRef.current.contains(event.target) &&
        contentRef.current &&
        !contentRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (child.type === PopoverHandler) {
          return (
            <div ref={triggerRef}>
              {React.cloneElement(child, { onClick: toggleOpen })}
            </div>
          );
        } else if (child.type === PopoverContent) {
          return open ? React.cloneElement(child, { triggerRef, contentRef, open }) : null;
        }
        return null;
      })}
    </div>
  );
};

const PopoverHandler = ({ children, onClick }) => {
  return (
    <div onClick={onClick} className="inline-block cursor-pointer">
      {children}
    </div>
  );
};

const PopoverContent = ({ children, className = "", triggerRef, contentRef, open }) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const localRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (triggerRef?.current && localRef.current && open) {
      const buttonElement = triggerRef.current.querySelector('button') || triggerRef.current;
      const rect = buttonElement.getBoundingClientRect();
      const contentWidth = localRef.current.offsetWidth;
      const contentHeight = localRef.current.offsetHeight;
      
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.bottom + 2;
      let left = rect.right - contentWidth;
      
      if (rect.bottom + contentHeight + 2 > viewportHeight) {
        top = rect.top - contentHeight - 2;
      }
      
      if (left < 0) {
        left = rect.left;
      }
      
      if (left + contentWidth > viewportWidth) {
        left = viewportWidth - contentWidth - 8;
      }
      
      setPosition({ top, left });
    }
  }, [triggerRef, open]);

  React.useEffect(() => {
    if (contentRef) {
      contentRef.current = localRef.current;
    }
  }, [contentRef]);

  return createPortal(
    <div
      ref={localRef}
      className={`fixed bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}
      style={{ 
        top: position.top,
        left: position.left,
        zIndex: 9999,
        minWidth: '160px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* Portal Popover (prevents clipping) */
function PortalPopover({
  open,
  anchorEl,
  onClose,
  children,
  zIndex = 10000,
  preferredWidth = 280,
  align = "left",
  offset = 8,
}) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: preferredWidth });

  const computePos = useCallback(() => {
    if (!open || !anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const margin = 8;

    let width = preferredWidth;
    const vw = window.innerWidth;

    if (width > vw - margin * 2) width = vw - margin * 2;

    let left = align === "right" ? rect.right - width : rect.left;
    left = Math.max(margin, Math.min(left, vw - width - margin));

    let top = rect.bottom + offset;

    const estHeight = popRef.current?.offsetHeight || 260;
    const vh = window.innerHeight;
    if (top + estHeight > vh - margin) {
      top = Math.max(margin, rect.top - estHeight - offset);
    }

    setPos({ top, left, width });
  }, [open, anchorEl, preferredWidth, align, offset]);

  useLayoutEffect(() => {
    computePos();
  }, [computePos, children]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => computePos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, computePos]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: zIndex - 1 }}
        onMouseDown={onClose}
      />
      <div
        ref={popRef}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg"
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          zIndex,
          maxWidth: "calc(100vw - 16px)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

/* Filter Topbar Item */
function TopBarItem({ label, children, widthClass = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${widthClass}`}>
      <span className="text-xs font-medium text-gray-500 h-4">
        {label || "\u00A0"}
      </span>
      {children}
    </div>
  );
}

/* Helpers */
function normalizeOptValue(v) {
  if (v == null) return "";
  if (typeof v === "object") {
    return String(
      v.value ?? v._id ?? v.id ?? v.code ?? v.iso2 ?? v.label ?? v.name ?? ""
    );
  }
  return String(v);
}

function normalizeRowValue(v) {
  if (v == null) return "";
  if (typeof v === "object") {
    return String(
      v._id ?? v.value ?? v.id ?? v.code ?? v.iso2 ?? v.label ?? v.name ?? ""
    );
  }
  return String(v);
}

function fmtDate(d) {
  try {
    if (!d) return "";
    const dd = new Date(d);
    if (Number.isNaN(dd.getTime())) return "";
    return dd.toLocaleDateString();
  } catch {
    return "";
  }
}

const TableGrid = ({
  columns,
  data,
  quickActions,
  actions,
  fieldConfig,
  filterbars,
  dateFilter = true,
  limit = 5,
  showAll = false,
  minRows = DEFAULT_MIN_ROWS,
  rowHeight = 34,
  headerHeight = 34,
  sortOptions = [],
  sortMap = {},
  theme = {},
  candidates = [],
  calculateTotals = () => {},
  buildOverView = () => {},
  showHeadSection = true,
  extraFeatures = [],
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [sortField, setSortField] = useState(columns[0]?.field || "");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openSort, setOpenSort] = useState(false);
  const [sortSelections, setSortSelections] = useState([]);
  const [filters, setFilters] = useState({});
  const [filterValues, setFilterValues] = useState({});
  const [filterErrors, setFilterErrors] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilters, setDateFilters] = useState({});
  const [rangeFilters, setRangeFilters] = useState({});
  const [statusFilters, setStatusFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDatePortal, setOpenDatePortal] = useState(false);

  const gridRef = useRef(null);
  const tableContainerRef = useRef(null);
  const columnsAnchorRef = useRef(null);
  const colFilterAnchorRef = useRef(null);
  const datePortalAnchorRef = useRef(null);

  const downloadOptions = ["Print", "PDF", "EXCEL", "CSV"];
  const safeData = Array.isArray(data) ? data : [];
  const showQuickActions = Array.isArray(quickActions) && quickActions.length > 0;

  const { onExportCsv, downloadPdfFromCsv, downloadExcelFromCsv, printTable } =
    TableExport(gridRef, sortedData, selectedRows, visibleColumns);

  // Initialize default filter values
  useEffect(() => {
    if (filterbars && filterbars.length > 0) {
      const defaults = {};
      filterbars.forEach((filter) => {
        if (filter.defaultSelected) {
          defaults[filter.key] = filter.defaultSelected;
        }
      });
      if (Object.keys(defaults).length > 0) {
        setFilterValues((prev) => ({ ...prev, ...defaults }));
      }
    }
  }, [filterbars]);

  useEffect(() => {
    setSortedData(safeData);
    setVisibleColumns(columns.map((col) => ({ ...col, visible: true })));
  }, [safeData, columns]);

  const cmpVal = (row, field, type) => {
    const v = row?.[field];
    if (v == null) return "";
    if (type === "date") return new Date(v).getTime() || 0;
    if (type === "number" || type === "amount" || type === "id") {
      if (typeof v === "number") return v;
      const num = parseFloat(String(v).replace(/[^\d.-]/g, ""));
      return Number.isNaN(num) ? 0 : num;
    }
    return String(v).toLowerCase();
  };

  const handleSort = useCallback(
    (field) => {
      const nextOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
      setSortField(field);
      setSortOrder(nextOrder);
      setSortSelections([]);
    },
    [sortField, sortOrder]
  );

  const hasField = useCallback(
    (field) => {
      if (!field) return false;
      if (columns.some((c) => c.field === field)) return true;
      if (safeData.length && Object.prototype.hasOwnProperty.call(safeData[0], field))
        return true;
      return false;
    },
    [columns, safeData]
  );

  const applySortPreset = useCallback(
    (presetKey) => {
      const preset = sortMap[presetKey];
      if (!preset) return;

      let { field, order } = preset;

      if (!field && candidates?.length) {
        field = candidates.find((f) => hasField(f)) || "";
      }
      if (!field) return;

      setSortField(field);
      setSortOrder(order);
    },
    [sortMap, candidates, hasField]
  );

  const handleColumnToggle = useCallback((field) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.field === field ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleToggleAll = useCallback(() => {
    setVisibleColumns((prev) => {
      const allSelected = prev.every((c) => c.visible);
      return prev.map((c) => ({ ...c, visible: !allSelected }));
    });
  }, []);

  const isFilterApplied = useCallback(
    (columnField) => {
      if (filters[columnField]) return true;
      const df = dateFilters[columnField];
      if (df?.start || df?.end) return true;
      const rf = rangeFilters[columnField];
      if (rf && (rf.start != null || rf.end != null)) return true;
      const sf = statusFilters[columnField];
      if (Array.isArray(sf) && sf.length > 0) return true;

      const topMulti = filterbars?.find((f) => f.key === columnField);
      if (topMulti && Array.isArray(filterValues[columnField]) && filterValues[columnField].length)
        return true;

      return false;
    },
    [filters, dateFilters, rangeFilters, statusFilters, filterbars, filterValues]
  );

  // Apply filters + search + sort
  useEffect(() => {
    let filtered = [...safeData];

    if (searchTerm) {
      const searchFields = (columns || []).map((c) => c.field);
      filtered = filtered.filter((row) =>
        searchFields.some((f) =>
          String(row?.[f] ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Top bar filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const selectedArr = Array.isArray(value) ? value : [value];
      const selectedNorm = selectedArr
        .map((x) => normalizeOptValue(x))
        .map((x) => String(x || "").trim())
        .filter(Boolean);

      if (selectedNorm.length === 0) return;
      if (selectedNorm.some((x) => x.toUpperCase() === "ALL")) return;

      const isRangeFilter = selectedNorm.some(
        (v) => typeof v === "string" && v.includes("-")
      );

      if (isRangeFilter) {
        filtered = filtered.filter((row) => {
          const raw = row?.[key];
          const rowVal = typeof raw === "number"
            ? raw
            : parseFloat(String(raw ?? "").replace(/[^\d.-]/g, ""));
          if (Number.isNaN(rowVal)) return false;

          return selectedNorm.some((rangeStr) => {
            const [min, max] = String(rangeStr)
              .split("-")
              .map((v) => parseFloat(v.trim()));
            if (Number.isNaN(min) || Number.isNaN(max)) return false;
            return rowVal >= min && rowVal <= max;
          });
        });
      } else {
        const selectedSet = new Set(selectedNorm.map((x) => String(x).toUpperCase()));
        filtered = filtered.filter((row) => {
          const rv = normalizeRowValue(row?.[key]);
          if (!rv) return false;
          return selectedSet.has(String(rv).toUpperCase());
        });
      }
    });

    // Global date filter
    if (startDate && endDate) {
      filtered = filtered.filter((row) => {
        const createdDate = row.createdAt ? new Date(row.createdAt) : null;
        return createdDate && createdDate >= startDate && createdDate <= endDate;
      });
    }

    // Per-column date ranges
    Object.entries(dateFilters).forEach(([key, { start, end }]) => {
      if (start && end) {
        filtered = filtered.filter(
          (row) => row[key] && new Date(row[key]) >= start && new Date(row[key]) <= end
        );
      } else if (start && !end) {
        filtered = filtered.filter(
          (row) => row[key] && isSameDay(new Date(row[key]), start)
        );
      }
    });

    // Number/id ranges
    Object.entries(rangeFilters).forEach(([key, { start, end }]) => {
      const startNum = start ?? null;
      const endNum = end ?? null;

      filtered = filtered.filter((row) => {
        const raw = row[key];
        const rowValue = typeof raw === "number"
          ? raw
          : parseFloat(String(raw ?? "").replace(/[^\d.-]/g, ""));
        const v = Number.isNaN(rowValue) ? null : rowValue;

        if (startNum !== null && endNum !== null) return v !== null && v >= startNum && v <= endNum;
        if (startNum !== null && endNum === null) return v !== null && v === startNum;
        if (endNum !== null && startNum === null) return v !== null && v <= endNum;
        return true;
      });
    });

    // Dropdown option filters
    Object.entries(statusFilters).forEach(([key, selected]) => {
      if (!Array.isArray(selected) || selected.length === 0) return;

      const selectedSet = new Set(
        selected
          .map((x) => normalizeOptValue(x))
          .filter(Boolean)
          .map((x) => x.toUpperCase())
      );

      filtered = filtered.filter((row) => {
        const rvKey = normalizeRowValue(row?.[key]);
        if (!rvKey) return false;
        return selectedSet.has(rvKey.toUpperCase());
      });
    });

    // Free-text per-column filter
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) =>
          String(row?.[key] ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase())
        );
      }
    });

    // Sort
    if (sortField) {
      const def = columns.find((c) => c?.field === sortField);
      const type = def?.type || "text";
      filtered.sort((a, b) => {
        const av = cmpVal(a, sortField, type);
        const bv = cmpVal(b, sortField, type);
        if (av < bv) return sortOrder === "asc" ? -1 : 1;
        if (av > bv) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setSortedData(filtered);
    setCurrentPage(1);
    setSelectedRows([]);
  }, [
    safeData,
    columns,
    searchTerm,
    filterValues,
    startDate,
    endDate,
    dateFilters,
    rangeFilters,
    statusFilters,
    filters,
    sortField,
    sortOrder,
  ]);

  const baseRows = useMemo(() => {
    return showAll ? sortedData : sortedData.slice(0, limit);
  }, [sortedData, showAll, limit]);

  const totalPages = useMemo(() => {
    if (!showAll) return 1;
    return Math.max(1, Math.ceil(baseRows.length / rowsPerPage));
  }, [showAll, baseRows.length, rowsPerPage]);

  const paginatedData = useMemo(() => {
    if (!showAll) return baseRows;
    return baseRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [baseRows, currentPage, rowsPerPage, showAll]);

  const paddedRows = useMemo(() => {
    const realCount = paginatedData.length;
    const need = Math.max(0, minRows - realCount);
    const empties = Array.from({ length: need }, () => ({ __empty: true }));
    return [...paginatedData, ...empties];
  }, [paginatedData, minRows]);

  const handleClearAll = useCallback(() => {
    setFilterValues({});
    setStartDate(null);
    setEndDate(null);
    setFilters({});
    setDateFilters({});
    setRangeFilters({});
    setStatusFilters({});
    setFilterErrors({});
    setSearchTerm("");
    setSortSelections([]);
    setOpenSort(false);
    setOpenFilter(null);
    setSelectedRows([]);
    setCurrentPage(1);
    setOpenDatePortal(false);
  }, []);

  const applyQuickFilter = useCallback((field, type) => {
    let start, end;
    const today = new Date();

    if (type === "today") {
      start = startOfDay(today);
      end = endOfDay(today);
    } else if (type === "thisWeek") {
      start = startOfWeek(today);
      end = endOfWeek(today);
    } else if (type === "thisMonth") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else if (type === "previousMonth") {
      const prev = subMonths(today, 1);
      start = startOfMonth(prev);
      end = endOfMonth(prev);
    } else if (type === "thisYear") {
      start = startOfYear(today);
      end = endOfYear(today);
    } else if (type === "nextMonth") {
      const next = addMonths(today, 1);
      start = startOfMonth(next);
      end = endOfMonth(next);
    }

    if (field) setDateFilters((prev) => ({ ...prev, [field]: { start, end } }));
    else {
      setStartDate(start);
      setEndDate(end);
    }
  }, []);

  const handleSelectAll = useCallback(
    (isChecked) => setSelectedRows(isChecked ? paginatedData.map((_, idx) => idx) : []),
    [paginatedData]
  );

  const handleRowSelection = useCallback(
    (rowIndex) => {
      if (rowIndex >= paginatedData.length) return;
      setSelectedRows((prev) =>
        prev.includes(rowIndex) ? prev.filter((i) => i !== rowIndex) : [...prev, rowIndex]
      );
    },
    [paginatedData.length]
  );

  const handleActionClick = useCallback((action, rowData) => {
    const isDisabled =
      action.disabled === true ||
      (typeof action.disabled === "function" && action.disabled(rowData));
    if (isDisabled) return;

    if (action.onClick) action.onClick(rowData);
    if (action.path) window.open(action.path, "_blank");
    if (action.function && action.param) action.function(rowData[action.param]);
  }, []);

  const totalStats = useMemo(() => calculateTotals(sortedData), [sortedData, calculateTotals]);
  const OverView = useMemo(() => buildOverView(totalStats), [totalStats, buildOverView]);

  const [searchableVal, setSearchableVal] = useState(null);
  const activeColumn = useMemo(() => {
    if (!openFilter || openFilter === "columns") return null;
    return visibleColumns.find((c) => c.field === openFilter) || null;
  }, [openFilter, visibleColumns]);

  useEffect(() => {
    if (!activeColumn) setOpenDatePortal(false);
    const isDate = activeColumn?.type === "date" || activeColumn?.filterType === "dateRange";
    if (!isDate) setOpenDatePortal(false);
  }, [activeColumn]);

  const dateLabel = useMemo(() => {
    if (!activeColumn) return "Select Date Range";
    const df = dateFilters?.[activeColumn.field];
    const s = df?.start ? fmtDate(df.start) : "";
    const e = df?.end ? fmtDate(df.end) : "";
    if (!s && !e) return "Select Date Range";
    if (s && !e) return s;
    return `${s} - ${e}`;
  }, [activeColumn, dateFilters]);

  const setTopFilterValue = useCallback((key, vals) => {
    setFilterValues((p) => {
      const next = { ...p };
      if (!vals || (Array.isArray(vals) && vals.length === 0) || vals === "") {
        delete next[key];
        return next;
      }
      next[key] = vals;
      return next;
    });
  }, []);

  return (
    <>
      <div>
        <TableGridCard OverView={OverView} />
      </div>

      <div className="p-2">
        {showHeadSection && (
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
            {/* Left: top filters */}
            <div className="flex flex-wrap items-end gap-2">
              {filterbars?.map((filter) => (
                <div key={filter.key}>
                  {filter.render ? (
                    filter.render({
                      selected: filterValues[filter.key] || [],
                      onChange: (selected) => setTopFilterValue(filter.key, selected),
                    })
                  ) : filter.type === "multiselect" ? (
                    <TopBarItem label={filter?.label}>
                      <MultiselectDropdown
                        selected={filterValues[filter.key] || []}
                        onChange={(vals) => setTopFilterValue(filter.key, vals)}
                        options={filter.options || []}
                        placeholder={filter.placeholder || filter.label || "Select..."}
                        size="md"
                        menuMinWidth={filter.menuMinWidth ?? 220}
                        menuMaxHeight={filter.menuMaxHeight ?? 420}
                        width={filter.width ?? 260}
                        fullWidth={false}
                      />
                    </TopBarItem>
                  ) : filter.type === "range" ? (
                    <TopBarItem label={filter?.label}>
                      <MultiselectDropdown
                        selected={filterValues[filter.key] || []}
                        onChange={(vals) => setTopFilterValue(filter.key, vals)}
                        options={(filter.options || []).map((opt) => {
                          if (typeof opt === "string") return { label: opt, value: opt };
                          return opt;
                        })}
                        placeholder={filter.placeholder || filter.label || "Select range..."}
                        size="md"
                        menuMinWidth={filter.menuMinWidth ?? 220}
                        menuMaxHeight={filter.menuMaxHeight ?? 420}
                        width={filter.width ?? 260}
                        fullWidth={false}
                        menuClassName={filter.menuClassName}
                      />
                    </TopBarItem>
                  ) : filter.type === "withSearch" ? (
                    <TopBarItem label={filter?.label} widthClass="min-w-[220px]">
                      <SearchableDropdown
                        value={searchableVal}
                        onSelect={setSearchableVal}
                        options={filter.options || []}
                        placeholder={filter.placeholder || filter.label || "Select..."}
                        fullWidth={true}
                      />
                    </TopBarItem>
                  ) : (
                    <TopBarItem label={filter?.label}>
                      <select
                        className="border border-gray-200 bg-white text-gray-700 rounded-md p-2 text-sm h-[34px] focus:outline-none focus:ring-2 focus:ring-primary-1/40"
                        value={filterValues[filter.key] ?? ""}
                        onChange={(e) => setTopFilterValue(filter.key, e.target.value)}
                      >
                        <option value="">All</option>
                        {(filter.options || []).map((opt) => {
                          const val = typeof opt === "string" ? opt : opt.value ?? opt.label;
                          const lbl = typeof opt === "string" ? opt : opt.label ?? opt.value;
                          return (
                            <option key={val} value={val}>
                              {lbl}
                            </option>
                          );
                        })}
                      </select>
                    </TopBarItem>
                  )}
                </div>
              ))}

              {dateFilter && (
                <TopBarItem label=" ">
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(s, e) => {
                      setStartDate(s);
                      setEndDate(e);
                    }}
                    placeholder="Select Date Range"
                    popperPlacement="bottom-start"
                    isClearable
                  />
                </TopBarItem>
              )}

              <TopBarItem label=" ">
                <GhostButton
                  color="gray"
                  onClick={handleClearAll}
                  className="!h-[34px] !px-3 !text-sm"
                >
                  Clear
                </GhostButton>
              </TopBarItem>
            </div>

            {/* Right: search/sort/download/columns */}
            <div className="flex flex-wrap items-end gap-4">
              <TopBarItem label=" ">
                <div className="relative w-full sm:w-[320px]">
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 pl-8 rounded-md w-full h-[34px] text-sm border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-1/40"
                  />
                  <IoSearchOutline className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </TopBarItem>

              <TopBarItem label=" ">
                <div className="flex items-center gap-2 h-[34px]">
                  <DownloadPopup
                    isDownloadPopupOpen={isDownloadPopupOpen}
                    downloadOptions={downloadOptions}
                    setIsDownloadPopupOpen={setIsDownloadPopupOpen}
                    onExportCsv={onExportCsv}
                    printTable={printTable}
                    downloadExcelFromCsv={downloadExcelFromCsv}
                    downloadPdfFromCsv={downloadPdfFromCsv}
                  />

                  {/* Show/Hide */}
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none text-gray-600 hover:text-primary-1"
                    onClick={(e) => {
                      columnsAnchorRef.current = e.currentTarget;
                      setOpenFilter((prev) => prev === "columns" ? null : "columns");
                    }}
                  >
                    <BsTable size={20} />
                    <span className="text-sm sm:text-base">Show/Hide</span>
                  </div>

                  {extraFeatures?.map((f, index) => (
                    <div key={index} className="my-auto" onClick={f?.onClick}>
                      <span className="cursor-pointer hover:text-primary-1">{f?.label}</span>
                    </div>
                  ))}
                </div>
              </TopBarItem>
            </div>
          </div>
        )}

        {/* Columns portal */}
        <PortalPopover
          open={openFilter === "columns"}
          anchorEl={columnsAnchorRef.current}
          onClose={() => setOpenFilter(null)}
          preferredWidth={280}
          align="right"
          zIndex={HF_ZINDEX}
        >
          <div className="max-h-96 overflow-y-auto">
            <ul className="py-1 text-gray-700">
              <li className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns.every((col) => col.visible)}
                  onChange={handleToggleAll}
                  className="mr-2"
                />
                Select/Deselect All
              </li>

              {visibleColumns.map((option) => (
                <li
                  key={option.field}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={option.visible}
                    onChange={() => handleColumnToggle(option.field)}
                    className="mr-2"
                  />
                  {option.header}
                </li>
              ))}
            </ul>
          </div>
        </PortalPopover>

        {/* Table */}
        <div
          ref={tableContainerRef}
          className="overflow-x-auto border border-gray-200 rounded-md bg-white"
          style={{
            minHeight: headerHeight + minRows * rowHeight,
          }}
        >
          <table ref={gridRef} className="min-w-full text-sm bg-white table-fixed">
            <thead className="bg-primary-1 text-white border-b border-gray-200">
              <tr style={{ height: headerHeight }}>
                <th className="px-4 py-2 text-left font-medium cursor-pointer text-nowrap relative w-[100px]">
                  <input
                    type="checkbox"
                    className="my-auto mr-2"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                  />
                  <span>No</span>
                </th>

                {visibleColumns
                  .filter((col) => col.visible)
                  .map((column) => (
                    <th
                      key={column.field}
                      onClick={() => handleSort(column.field)}
                      className="px-2 py-2 text-left font-medium cursor-pointer text-nowrap relative"
                    >
                      {column.header}{" "}
                      {sortField === column.field && (sortOrder === "asc" ? "↑" : "↓")}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          colFilterAnchorRef.current = e.currentTarget;
                          setOpenFilter(openFilter === column.field ? null : column.field);
                        }}
                        className="ml-2"
                      >
                        <FaFilter
                          size={12}
                          className={`my-auto cursor-pointer ${
                            isFilterApplied(column.field) ? "text-white" : "text-white/60"
                          }`}
                        />
                      </button>
                    </th>
                  ))}

                {showQuickActions && (
                  <th
                    className="px-4 py-2 text-left font-medium text-nowrap sticky z-20 bg-primary-1 text-white"
                    style={{ right: MENU_COL_W, width: ACTIONS_COL_W }}
                  >
                    Quick Actions
                  </th>
                )}

                <th
                  className="px-4 py-2 sticky z-20 bg-primary-1 text-white"
                  style={{ right: 0, width: MENU_COL_W }}
                />
              </tr>
            </thead>

            <tbody>
              {paddedRows.length > 0 ? (
                paddedRows.map((row, rowIndex) => {
                  const isEmpty = row?.__empty === true;

                  return (
                    <tr key={rowIndex} style={{ height: rowHeight, minHeight: rowHeight }}>
                      <td className="px-4 py-2 border-b border-gray-100">
                        {!isEmpty ? (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="my-auto"
                              checked={selectedRows.includes(rowIndex)}
                              onChange={() => handleRowSelection(rowIndex)}
                            />
                            <span className="px-4 py-1 text-gray-600">
                              {String((currentPage - 1) * rowsPerPage + rowIndex + 1).padStart(2, "0")}
                            </span>
                          </div>
                        ) : (
                          <div className="h-[20px]" />
                        )}
                       </td>

                      {visibleColumns
                        .filter((col) => col.visible)
                        .map((column) => (
                          <td key={column.field} className="px-2 py-2 border-b border-gray-100 text-nowrap">
                            {isEmpty ? (
                              <span className="opacity-0">—</span>
                            ) : fieldConfig?.[column.field] ? (
                              fieldConfig[column.field].map((item, idx) => {
                                const cellValue = row[column.field];

                                if (typeof item.render === "function") {
                                  const out = item.render(cellValue, row);
                                  if (item.link) {
                                    const dynamicLink = item.link.replace(
                                      ":linkId",
                                      row[item.linkId] || item.linkId
                                    );
                                    return (
                                      <Link to={dynamicLink} key={idx} className="hover:text-primary-1">
                                        {out}
                                      </Link>
                                    );
                                  }
                                  return <React.Fragment key={idx}>{out}</React.Fragment>;
                                }

                                const dynamicByCondition =
                                  typeof item.condition === "function" ? item.condition(cellValue) : "";
                                const badgeClass = [
                                  "rounded",
                                  "font-semibold",
                                  "px-2",
                                  "py-1",
                                  item.color || "",
                                  dynamicByCondition || "",
                                ]
                                  .filter(Boolean)
                                  .join(" ");

                                const content = (
                                  <>
                                    {item.icon && (
                                      <div className="flex items-center text-gray-500 relative">
                                        {item.icon}
                                        <span>{cellValue}</span>
                                      </div>
                                    )}
                                    {(item.condition || item.color) && (
                                      <span className={badgeClass}>{cellValue}</span>
                                    )}
                                    {item.image && item.image(cellValue) && (
                                      <img src={item.image(cellValue)} alt="cell" />
                                    )}
                                    {item.img && typeof item.img === "string" && (
                                      <div className="flex space-x-2 mr-8">
                                        <img
                                          src={item.img}
                                          alt="User"
                                          className="w-[40px] h-[40px] rounded-full"
                                        />
                                        <span className="mr-2">{cellValue}</span>
                                      </div>
                                    )}
                                  </>
                                );

                                if (item.link) {
                                  const dynamicLink = item.link.replace(
                                    ":linkId",
                                    row[item.linkId] || item.linkId
                                  );
                                  return (
                                    <Link to={dynamicLink} key={idx} className="hover:text-primary-1">
                                      {content}
                                    </Link>
                                  );
                                }

                                return <React.Fragment key={idx}>{content}</React.Fragment>;
                              })
                            ) : column.render ? (
                              column.render(row)
                            ) : (
                              row[column.field] ?? "N/A"
                            )}
                           </td>
                        ))}

                      {showQuickActions && (
                        <td
                          className="px-6 py-2 border-b border-gray-100 sticky z-10 bg-white"
                          style={{ right: MENU_COL_W, width: ACTIONS_COL_W }}
                        >
                          {!isEmpty && (
                            <div className="flex items-center justify-end space-x-4">
                              {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                const disabled = action.disabled ? action.disabled(row) : false;
                                return (
                                  <div
                                    key={index}
                                    className={`relative group flex items-center ${
                                      action.showName ? "space-x-2" : ""
                                    }`}
                                  >
                                    <button
                                      onClick={() => action.onClick && action.onClick(row)}
                                      disabled={disabled}
                                      className={`p-1 rounded hover:bg-gray-100 ${
                                        action.color || ""
                                      } ${
                                        action.showName ? "flex items-center space-x-2" : ""
                                      } ${
                                        disabled ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                    >
                                      <Icon size={20} className="hover:text-primary-1" />
                                      {action.showName && (
                                        <span className="text-sm text-gray-600">{action.name}</span>
                                      )}
                                    </button>

                                    {!action.showName && (
                                      <div className="absolute text-nowrap left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-1 py-1 text-xs text-white bg-primary-1 rounded opacity-0 group-hover:opacity-100">
                                        {action.name}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      )}

                      <td
                        className="pl-3 pr-4 py-2 border-b border-gray-100 sticky right-0 z-10 bg-white"
                        style={{ width: MENU_COL_W }}
                      >
                        {!isEmpty && (
                          <Popover placement="bottom-end">
                            <PopoverHandler>
                              <Button className="p-1 bg-transparent shadow-none hover:shadow-none min-w-0">
                                <MdMoreHoriz size={20} className="text-gray-500 hover:text-primary-1" />
                              </Button>
                            </PopoverHandler>
                            <PopoverContent className="p-1 w-fit z-[9999] bg-white border border-gray-200">
                              {(
                                typeof actions === "function" ? actions(row) : actions || []
                              ).map((action, idx) => {
                                const disabled =
                                  action.disabled === true ||
                                  (typeof action.disabled === "function" && action.disabled(row));
                                return (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!disabled) {
                                        handleActionClick(action, row);
                                      }
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors text-nowrap ${
                                      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    }`}
                                  >
                                    {action.icon}
                                    <span>{action.label}</span>
                                  </div>
                                );
                              })}
                            </PopoverContent>
                          </Popover>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr style={{ height: rowHeight, minHeight: rowHeight }}>
                  <td
                    colSpan={
                      1 +
                      visibleColumns.filter((c) => c.visible).length +
                      (showQuickActions ? 1 : 0) +
                      1
                    }
                    className="text-center py-4 text-lg text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Column filter portal */}
        <PortalPopover
          open={!!activeColumn}
          anchorEl={colFilterAnchorRef.current}
          onClose={() => {
            setOpenFilter(null);
            setOpenDatePortal(false);
          }}
          preferredWidth={HF_POPOVER_W}
          align="right"
          zIndex={HF_ZINDEX}
        >
          <div className="p-2 space-y-2 overflow-visible" style={{ width: HF_CONTROL_W }}>
            <div className="text-[11px] font-semibold text-gray-700 truncate">
              {activeColumn?.header}
            </div>

            {(activeColumn?.type === "date" || activeColumn?.filterType === "dateRange") && (
              <div className="space-y-2 w-full">
                <div className="grid grid-cols-2 gap-1.5 w-full">
                  <CommonButton
                    onClick={() => applyQuickFilter(activeColumn.field, "today")}
                    className="!h-[24px] !px-2 !text-[11px] !w-full !rounded-md"
                  >
                    Today
                  </CommonButton>
                  <CommonButton
                    onClick={() => applyQuickFilter(activeColumn.field, "thisWeek")}
                    className="!h-[24px] !px-2 !text-[11px] !w-full !rounded-md"
                  >
                    This Week
                  </CommonButton>
                  <CommonButton
                    onClick={() => applyQuickFilter(activeColumn.field, "thisMonth")}
                    className="!h-[24px] !px-2 !text-[11px] !w-full !rounded-md"
                  >
                    This Month
                  </CommonButton>
                  <CommonButton
                    onClick={() => applyQuickFilter(activeColumn.field, "nextMonth")}
                    className="!h-[24px] !px-2 !text-[11px] !w-full !rounded-md"
                  >
                    Next Month
                  </CommonButton>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    datePortalAnchorRef.current = e.currentTarget;
                    setOpenDatePortal(true);
                  }}
                  className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 bg-white text-left truncate"
                  title={dateLabel}
                >
                  {dateLabel}
                </button>

                <div className="flex items-center gap-2 pt-1 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: { start: null, end: null },
                      }));
                      setOpenDatePortal(false);
                    }}
                    className="w-1/2 text-left text-red-500 text-[11px]"
                  >
                    Reset
                  </button>

                  <CommonButton
                    onClick={() => {
                      setOpenDatePortal(false);
                      setOpenFilter(null);
                    }}
                    className="!h-[24px] !px-2 !text-[11px] !w-1/2 !rounded-md"
                  >
                    Apply
                  </CommonButton>
                </div>
              </div>
            )}

            {(activeColumn?.type === "id" || activeColumn?.type === "amount") && (
              <div className="space-y-2">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={rangeFilters[activeColumn.field]?.start ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;

                      if (v === "" || v === "-") {
                        setRangeFilters((prev) => ({
                          ...prev,
                          [activeColumn.field]: { ...prev[activeColumn.field], start: null },
                        }));
                        setFilterErrors((prev) => ({ ...prev, [`${activeColumn.field}-start`]: null }));
                        return;
                      }

                      const num = parseFloat(v);
                      if (Number.isNaN(num))
                        return setFilterErrors((p) => ({
                          ...p,
                          [`${activeColumn.field}-start`]: "Please enter a valid number",
                        }));
                      if (num < 0)
                        return setFilterErrors((p) => ({
                          ...p,
                          [`${activeColumn.field}-start`]: "Value cannot be negative",
                        }));

                      setRangeFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: { ...prev[activeColumn.field], start: num },
                      }));
                      setFilterErrors((prev) => ({ ...prev, [`${activeColumn.field}-start`]: null }));
                    }}
                    placeholder={activeColumn.type === "id" ? "Start ID" : "Min"}
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-1/40"
                  />
                  {filterErrors[`${activeColumn.field}-start`] && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {filterErrors[`${activeColumn.field}-start`]}
                    </p>
                  )}
                </div>

                <div className="text-gray-500 text-[11px] font-medium text-center">to</div>

                <div className="flex flex-col">
                  <input
                    type="text"
                    value={rangeFilters[activeColumn.field]?.end ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;

                      if (v === "" || v === "-") {
                        setRangeFilters((prev) => ({
                          ...prev,
                          [activeColumn.field]: { ...prev[activeColumn.field], end: null },
                        }));
                        setFilterErrors((prev) => ({ ...prev, [`${activeColumn.field}-end`]: null }));
                        return;
                      }

                      const num = parseFloat(v);
                      if (Number.isNaN(num))
                        return setFilterErrors((p) => ({
                          ...p,
                          [`${activeColumn.field}-end`]: "Please enter a valid number",
                        }));
                      if (num < 0)
                        return setFilterErrors((p) => ({
                          ...p,
                          [`${activeColumn.field}-end`]: "Value cannot be negative",
                        }));

                      setRangeFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: { ...prev[activeColumn.field], end: num },
                      }));
                      setFilterErrors((prev) => ({ ...prev, [`${activeColumn.field}-end`]: null }));
                    }}
                    placeholder={activeColumn.type === "id" ? "End ID" : "Max"}
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-1/40"
                  />
                  {filterErrors[`${activeColumn.field}-end`] && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {filterErrors[`${activeColumn.field}-end`]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 w-full">
                  <button
                    onClick={() => {
                      setRangeFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: { start: null, end: null },
                      }));
                      setFilterErrors((prev) => ({
                        ...prev,
                        [`${activeColumn.field}-start`]: null,
                        [`${activeColumn.field}-end`]: null,
                      }));
                    }}
                    className="w-1/2 text-left text-red-500 text-[11px]"
                  >
                    Reset
                  </button>
                  <CommonButton
                    onClick={() => setOpenFilter(null)}
                    className="!h-[24px] !px-2 !text-[11px] !w-1/2 !rounded-md"
                  >
                    Apply
                  </CommonButton>
                </div>
              </div>
            )}

            {activeColumn &&
              !["date", "id", "amount"].includes(activeColumn.type) &&
              activeColumn.filterType !== "dateRange" &&
              Array.isArray(activeColumn.options) &&
              activeColumn.options.length > 0 && (
                <div className="space-y-2 overflow-visible">
                  <MultiselectDropdown
                    selected={statusFilters[activeColumn.field] || []}
                    onChange={(vals) =>
                      setStatusFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: vals,
                      }))
                    }
                    options={activeColumn.options || []}
                    placeholder={`Select ${activeColumn.header}`}
                    size="sm"
                    menuMinWidth={HF_CONTROL_W}
                    menuMaxHeight={240}
                    width={HF_CONTROL_W}
                    fullWidth={true}
                    menuClassName="z-[10050]"
                  />

                  <div className="flex items-center gap-2 pt-1 w-full">
                    <button
                      onClick={() =>
                        setStatusFilters((prev) => ({
                          ...prev,
                          [activeColumn.field]: [],
                        }))
                      }
                      className="w-1/2 text-left text-red-500 text-[11px]"
                    >
                      Reset
                    </button>
                    <CommonButton
                      onClick={() => setOpenFilter(null)}
                      className="!h-[24px] !px-2 !text-[11px] !w-1/2 !rounded-md"
                    >
                      Apply
                    </CommonButton>
                  </div>
                </div>
              )}

            {activeColumn &&
              !["date", "id", "amount", "status"].includes(activeColumn.type) &&
              activeColumn.filterType !== "dateRange" &&
              !(Array.isArray(activeColumn.options) && activeColumn.options.length > 0) && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={filters[activeColumn.field] || ""}
                    placeholder={`Filter ${activeColumn.header}`}
                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-1/40"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [activeColumn.field]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex items-center gap-2 pt-1 w-full">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          [activeColumn.field]: "",
                        }))
                      }
                      className="w-1/2 text-left text-red-500 text-[11px]"
                    >
                      Reset
                    </button>
                    <CommonButton
                      onClick={() => setOpenFilter(null)}
                      className="!h-[24px] !px-2 !text-[11px] !w-1/2 !rounded-md"
                    >
                      Apply
                    </CommonButton>
                  </div>
                </div>
              )}
          </div>
        </PortalPopover>

        {/* Date Range Picker Portal */}
        <PortalPopover
          open={openDatePortal}
          anchorEl={datePortalAnchorRef.current}
          onClose={() => setOpenDatePortal(false)}
          preferredWidth={HF_DATE_POPOVER_W}
          align="right"
          zIndex={HF_DATE_ZINDEX}
        >
          <div className="p-3 space-y-2 bg-white">
            <div className="text-sm font-semibold text-gray-800">
              {activeColumn?.header || "Date Range"}
            </div>

            <div className="w-full [&_input]:w-full">
              <DateRangePicker
                startDate={activeColumn ? dateFilters?.[activeColumn.field]?.start || null : null}
                endDate={activeColumn ? dateFilters?.[activeColumn.field]?.end || null : null}
                onChange={(s, e) => {
                  if (!activeColumn) return;
                  setDateFilters((prev) => ({
                    ...prev,
                    [activeColumn.field]: { start: s, end: e },
                  }));
                }}
                placeholder="Select Date Range"
                popperPlacement="bottom-start"
                isClearable
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!activeColumn) return;
                  setDateFilters((prev) => ({
                    ...prev,
                    [activeColumn.field]: { start: null, end: null },
                  }));
                  setOpenDatePortal(false);
                }}
                className="text-red-500 text-xs"
              >
                Reset
              </button>

              <CommonButton
                onClick={() => setOpenDatePortal(false)}
                className="!h-[28px] !px-3 !text-xs !rounded-md"
              >
                Done
              </CommonButton>
            </div>
          </div>
        </PortalPopover>

        {/* Pagination */}
        {showAll && baseRows.length >= 10 && (
          <AdvancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            defaultEntries={rowsPerPage}
            onPageChange={setCurrentPage}
            onEntriesPerPageChange={setRowsPerPage}
            entriesOptions={[5, 10, 25, 50, 100, "All"]}
            height={36}
            width={36}
            bgColor="#FFFFFF"
            borderColor="#E5E7EB"
            totalEntries={baseRows.length}
          />
        )}
      </div>
    </>
  );
};

export default TableGrid;