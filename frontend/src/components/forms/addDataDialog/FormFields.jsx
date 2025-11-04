import React, { memo } from "react";
import { AlertCircle } from "lucide-react";

export const InputField = memo(
  ({
    label,
    name,
    type = "text",
    icon: Icon,
    required = false,
    options = null,
    placeholder = "",
    disabled = false,
    value,
    onChange,
    error,
  }) => {
    const handleChange = React.useCallback(
      (e) => {
        const newValue = type === "file" ? e.target.files[0] : e.target.value;
        onChange(name, newValue);
      },
      [name, type, onChange]
    );

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {Icon && (
            <Icon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          )}
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          )}
        </label>

        {options ? (
          <select
            value={value || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            } ${
              disabled ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""
            } text-gray-900 dark:text-white`}
            disabled={disabled}
            required={required}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : type === "file" ? (
          <input
            type="file"
            onChange={handleChange}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            } text-gray-900 dark:text-white`}
            accept="image/*"
            required={required}
          />
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              error
                ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/10"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            } text-gray-900 dark:text-white`}
            disabled={disabled}
            required={required}
          />
        )}

        {error && (
          <p className="flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";
