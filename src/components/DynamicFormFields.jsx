import React from 'react';

const DynamicFormFields = ({ fields, formData, onFieldChange }) => {
  const renderField = (field) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-primary-1"
            required={field.required}
          >
            <option value="" className="text-gray-900">-- Select --</option>
            {field.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex gap-4">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  className="mr-2 accent-primary-1"
                  required={field.required}
                />
                <span className="text-black">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    onFieldChange(field.name, newValues);
                  }}
                  className="mr-2 accent-primary-1"
                />
                <span className="text-black">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-white border border-primary-2/30 rounded-xl text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-primary-1"
            required={field.required}
          />
        );
    }
  };

  if (!fields || fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-black mb-2"
          >
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderField(field)}
          {field.validation?.min !== undefined && field.validation?.max !== undefined && (
            <p className="text-xs text-black/60 mt-1">
              Range: {field.validation.min} - {field.validation.max}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicFormFields;
