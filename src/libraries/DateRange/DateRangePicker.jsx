import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateRangePicker.css";

/**
 * Reusable date-range picker (react-datepicker wrapper).
 * Styling lives in DateRangePicker.css to keep table styles clean.
 */
const DateRangePicker = ({
  startDate,
  endDate,
  onChange,                 // (start, end) => void
  placeholder = "Select Date Range",
  disabled = false,
  inputClassName = "drp-input",
  wrapperClassName = "date-range",
  popperPlacement = "bottom-start",
  minDate,
  maxDate,
  isClearable = true,
}) => {
  return (
    <div className={wrapperClassName}>
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(dates) => {
          const [start, end] = dates || [];
          onChange?.(start || null, end || null);
        }}
        isClearable={isClearable}
        placeholderText={placeholder}
        className={inputClassName}
        disabled={disabled}
        popperPlacement={popperPlacement}
        minDate={minDate}
        maxDate={maxDate}
        shouldCloseOnSelect={false}
        calendarStartDay={1}
        showPopperArrow={false}
      />
    </div>
  );
};

export default DateRangePicker;
