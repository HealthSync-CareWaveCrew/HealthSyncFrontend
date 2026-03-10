// src/components/common/CommonDropdowns.jsx
import React, { useState, useRef, useEffect } from "react";

/* -------------------------------------------------- */
/* helpers                                            */
/* -------------------------------------------------- */
const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
};

const getLabel = (o) => (typeof o === "string" ? o : o.label ?? o.value);
const getValue = (o) => (typeof o === "string" ? o : o.value ?? o.label);

const useDropdownDirection = (btnRef, open, menuHeight = 260) => {
  const [placement, setPlacement] = useState("bottom");
  useEffect(() => {
    if (!open || !btnRef?.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    setPlacement(spaceBelow < menuHeight && spaceAbove > menuHeight / 2 ? "top" : "bottom");
  }, [open, btnRef, menuHeight]);
  return placement;
};

const normalizeSize = (val) => {
  if (val == null) return undefined;
  if (typeof val === "number") return `${val}px`;
  if (val === "full" || val === "100%") return "100%";
  return val;
};
const BaseTrigger = React.forwardRef(
  (
    {
      children,
      size = "md",
      className = "",
      onClick = () => { },
      showChevron = true,
      selected,
      fullWidth = false,
      width,
      maxWidth,
      height = 34, // default height for ALL dropdown triggers
    },
    ref
  ) => {
    // horizontal padding + font-size per size, no vertical padding (we lock height)
    const sizeMap = {
      sm: "px-3 text-sm",
      md: "px-2 text-sm",
      lg: "px-5 text-sm",
      xl: "px-6 text-base",
      "2xl": "px-7 text-base",
    };
    const defaultSize = sizeMap[size] ?? "px-4 text-sm";

    const style = {};
    const w = normalizeSize(width);
    const mw = normalizeSize(maxWidth);
    const hasCustomH = /\b!h-|\bh-\[|\bh-\d/.test(className); // allow overriding height via class
    if (fullWidth) style.width = "100%";
    if (w) style.width = w;
    if (mw) style.maxWidth = mw;
    if (!hasCustomH && height != null) style.height = `${height}px`; // ensure total trigger height = 34px

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={style}
        className={`
          inline-flex items-center justify-between gap-2
          rounded border border-optional-2 shadow-sm
          bg-[#F8F6F5] text-gray-800 font-medium
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-1/40
          transition whitespace-nowrap
          ${fullWidth ? "w-full" : ""}
          ${defaultSize}                     /* horizontal padding + font-size */
          ${className}
        `.trim()}
      >
        <span className="flex-1 text-left truncate">{children}</span>
       {selected?.code ? (
  <img
    src={`https://flagcdn.com/w40/${selected.code.toLowerCase()}.png`}
    className="w-5 h-4 ml-2"
  />
) : (
  <svg
    className="w-4 h-4 text-gray-500 shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
)}

      
      </button>
    );
  }
);

export const SearchableDropdown = ({
  value,
  onSelect,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  size = "md",
  buttonClassName = "",
  menuClassName = "",
  menuMinWidth = 180,
  menuMaxHeight = 380,
  fullWidth = false,
  width,
  maxWidth,
  placement: placementOverride = "auto",

  /** ⭐ SAFE DEFAULT FUNCTIONS */
  getLabel = (o) =>
    typeof o === "string" ? o : o?.name ? o.name : "",
  getValue = (o) =>
    typeof o === "string" ? o : o?.code ? o.code : "",
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  const btnRef = useRef(null);

  useClickOutside(wrapRef, () => setOpen(false));

  const autoPlacement = useDropdownDirection(btnRef, open, menuMaxHeight);
  const placement = placementOverride === "auto" ? autoPlacement : placementOverride;

  const w = normalizeSize(width);
  const mw = normalizeSize(maxWidth);

  /** ⭐ FIX: protect against undefined labels */
  const filtered = options.filter((o) => {
    const label = getLabel(o) || "";
    return label.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block text-left ${fullWidth ? "w-full" : "max-w-full"}`}
      style={mw ? { maxWidth: mw } : undefined}
    >
      {/* Trigger Button */}
      <BaseTrigger
        ref={btnRef}
        size={size}
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
        fullWidth={fullWidth}
        width={width}
        maxWidth={maxWidth}
      >
        {value ? getLabel(value) : placeholder}
      </BaseTrigger>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`
            absolute right-0 z-50
            ${placement === "bottom" ? "mt-2" : "mb-2 bottom-full"}
            rounded-md bg-white shadow-lg ring-1 ring-black/5
            overflow-y-auto overflow-x-auto
            ${menuClassName}
          `}
          style={{
            minWidth: `${menuMinWidth}px`,
            width: w ?? (fullWidth ? "100%" : undefined),
            maxHeight: `${menuMaxHeight}px`,
            maxWidth: mw ?? undefined,
          }}
        >
          {/* Search Input */}
          <div className="p-2 sticky top-0 bg-white z-10">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-md border border-primary-1 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-1/40"
              placeholder={searchPlaceholder}
            />
          </div>

          {/* Options List */}
          <div className="">
            {filtered.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-400">No results</div>
            )}

            {filtered.map((opt) => (
              <button
                key={getValue(opt)}
                onClick={() => {
                  onSelect?.(opt);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-4 py-1 text-sm hover:bg-gray-100 whitespace-nowrap"
              >
                {getLabel(opt)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MultiselectDropdown = ({
  selected = [],
  onChange,
  options = [],
  placeholder = "Select options",
  showCountLabel = true,
  selectAllLabel = "Select all",
  size = "md",
  buttonClassName = "",
  menuClassName = "",
  menuMinWidth = 180,
  menuMaxHeight = 256,
  fullWidth = false,
  width,
  maxWidth,
  placement: placementOverride = "auto",
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  useClickOutside(wrapRef, () => setOpen(false));

  const autoPlacement = useDropdownDirection(btnRef, open, menuMaxHeight + 40);
  const placement = placementOverride === "auto" ? autoPlacement : placementOverride;

  const w = normalizeSize(width);
  const mw = normalizeSize(maxWidth);

  const allValues = options.map(getValue);
  const allSelected = selected.length === allValues.length && allValues.length > 0;

  const toggleOption = (opt) => {
    const val = getValue(opt);
    const next = selected.includes(val) ? selected.filter((x) => x !== val) : [...selected, val];
    onChange?.(next);
  };

  const toggleAll = () => onChange?.(allSelected ? [] : allValues);

  const renderLabel = () => {
    if (!selected.length) return placeholder;
    const first = options.find((o) => getValue(o) === selected[0]);
    const firstLabel = first ? getLabel(first) : selected[0];
    if (selected.length === 1) return firstLabel;
    return showCountLabel ? `${firstLabel} +${selected.length - 1}` : selected.join(", ");
  };

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block text-left ${fullWidth ? "w-full" : "max-w-full"}`}
      style={mw ? { maxWidth: mw } : undefined}
    >
      <BaseTrigger
        ref={btnRef}
        size={size}
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
        fullWidth={fullWidth}
        width={width}
        maxWidth={maxWidth}
      >
        {renderLabel()}
      </BaseTrigger>

      {open && (
        <div
          className={`
            absolute right-0 z-50
            ${placement === "bottom" ? "mt-2" : "mb-2 bottom-full"}
            rounded-md bg-white shadow-lg ring-1 ring-black/5
            overflow-y-auto overflow-x-auto
            ${menuClassName}
          `}
          style={{
            minWidth: `${menuMinWidth}px`,
            width: w ?? (fullWidth ? "100%" : undefined),
            maxHeight: `${menuMaxHeight}px`,
            maxWidth: mw ?? undefined,
          }}
        >
          <div className="py-1 border-b bg-white sticky top-0 z-10">
            <label className="flex items-center gap-2 px-4 py-1 text-sm hover:bg-gray-100 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-gray-300 accent-primary-1 focus:ring-primary-1/40"
              />
              <span>{selectAllLabel}</span>
            </label>
          </div>
          <div className="py-1">
            {options.map((opt) => {
              const val = getValue(opt);
              const label = getLabel(opt);
              const isSel = selected.includes(val);
              return (
                <label
                  key={val}
                  className="flex items-center gap-2 px-4 py-1 text-sm hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                >
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggleOption(opt)}
                    className="rounded border-gray-300 accent-primary-1 focus:ring-primary-1/40"
                  />
                  <span className="flex-1">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

