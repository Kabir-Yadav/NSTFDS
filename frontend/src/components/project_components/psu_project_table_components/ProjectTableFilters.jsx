import React, { useEffect, useState } from "react";
import { X as XIcon, ChevronDown, Package } from "lucide-react";

const ProjectTableFilters = ({
  // State values
  selectedState,
  selectedDistrict,
  selectedSchool,
  selectedReady,
  selectedTraining,
  selectedHandover,
  selectedComponents,
  componentDropdownOpen,

  // Handlers
  onStateChange,
  onDistrictChange,
  onSchoolChange,
  onReadyChange,
  onTrainingChange,
  onHandoverChange,
  onComponentToggle,
  onComponentDropdownToggle,
  onSelectAllComponents,
  onDeselectAllComponents,
  onRemoveComponent,

  // Options
  stateOptions,
  districtOptions,
  schoolOptions,

  // Component data
  projectComponents,
  componentsLoading,
}) => {
  // Close component dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        componentDropdownOpen &&
        !event.target.closest(".component-filter-dropdown")
      ) {
        onComponentDropdownToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentDropdownOpen, onComponentDropdownToggle]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
      {/* State Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          State
        </label>
        <select
          value={selectedState}
          onChange={(e) => {
            onStateChange(e.target.value);
            onDistrictChange("");
            onSchoolChange("");
          }}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All States</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          District
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => {
            onDistrictChange(e.target.value);
            onSchoolChange("");
          }}
          disabled={!selectedState}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <option value="">All Districts</option>
          {districtOptions.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* School Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          School
        </label>
        <select
          value={selectedSchool}
          onChange={(e) => onSchoolChange(e.target.value)}
          disabled={!selectedDistrict}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <option value="">All Schools</option>
          {schoolOptions.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </div>

      {/* Ready Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ready Status
        </label>
        <select
          value={selectedReady}
          onChange={(e) => onReadyChange(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All</option>
          <option value="ready">Ready</option>
          <option value="not_ready">Not Ready</option>
        </select>
      </div>

      {/* Training Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Training Status
        </label>
        <select
          value={selectedTraining}
          onChange={(e) => onTrainingChange(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Handover Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Handover Status
        </label>
        <select
          value={selectedHandover}
          onChange={(e) => onHandoverChange(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Component Filter */}
      <div className="component-filter-dropdown">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Components
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => onComponentDropdownToggle(!componentDropdownOpen)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 flex items-center justify-between"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedComponents.length > 0
                ? `${selectedComponents.length} selected`
                : "Select components"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                componentDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {componentDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2">
                <button
                  type="button"
                  onClick={onSelectAllComponents}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={onDeselectAllComponents}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  Deselect All
                </button>
              </div>
              <div className="p-2 space-y-1">
                {componentsLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    Loading components...
                  </div>
                ) : projectComponents && projectComponents.length > 0 ? (
                  projectComponents.map((component) => (
                    <label
                      key={component}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(component)}
                        onChange={() => onComponentToggle(component)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {component}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No components available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Components Chips */}
        {selectedComponents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedComponents.slice(0, 2).map((component) => (
              <span
                key={component}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
              >
                <Package className="h-3 w-3" />
                {component}
                <button
                  type="button"
                  onClick={() => onRemoveComponent(component)}
                  className="ml-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                  title="Remove"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedComponents.length > 2 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                +{selectedComponents.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTableFilters;
