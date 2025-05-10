import React, { useState, useEffect } from "react";
import {
  fetchDeviceProcurements,
  fetchSanitaryProcurements,
  isDigitalProcurementActive,
  isSanitaryProcurementActive,
} from "../../../action/supabase_actions";
import DeviceProcurementTable from "./tables/Device-Procurement-Table";
import SanitaryPadTable from "./tables/sanitary-pad-table";

const SelectionForm = ({ selectedProject, data, categories }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  const [isProcurementAllowed, setIsProcurementAllowed] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState(false);

  const stateOptions = data ? data.map((item) => item.state_name) : [];
  const districtOptions =
    (selectedState &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.map((d) => d.district_name)) ||
    [];
  const schoolOptions =
    (selectedState &&
      selectedDistrict &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.find((d) => d.district_name === selectedDistrict)
        ?.schools) ||
    [];

  // Adjust isReadyToFetch condition
  const isReadyToFetch =
    selectedState &&
    selectedDistrict &&
    selectedSchool &&
    (selectedProject?.name === "Sanitary Pad Devices Procurement" ||
      selectedCategory) &&
    isProcurementAllowed;

  useEffect(() => {
    // Whenever state, district, school, or category changes, reset the fetch results.
    setFetchedData([]);
    setHasFetched(false);
  }, [selectedState, selectedDistrict, selectedSchool, selectedCategory]);

  // Check procurement status dynamically
  useEffect(() => {
    const checkStatus = async () => {
      setCheckedStatus(false);
      let result = false;

      if (selectedProject?.name === "Digital Device Procurement") {
        result = await isDigitalProcurementActive(selectedSchool);
      } else if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
        result = await isSanitaryProcurementActive(selectedSchool);
      }

      setIsProcurementAllowed(result);
      setCheckedStatus(true);
    };

    if (selectedState && selectedDistrict && selectedSchool) {
      checkStatus();
    }
  }, [selectedState, selectedDistrict, selectedSchool, selectedProject]);

  const handleFetchData = async () => {
    if (!isReadyToFetch) return;
    setLoading(true);
    try {
      const filters = {
        stateName: selectedState,
        districtName: selectedDistrict,
        schoolName: selectedSchool,
        category:
          selectedProject?.name === "Sanitary Pad Devices Procurement"
            ? null
            : selectedCategory,
      };

      let data;
      if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
        data = await fetchSanitaryProcurements(filters);
      } else if (selectedProject?.name === "Digital Device Procurement") {
        data = await fetchDeviceProcurements(filters);
      }

      setFetchedData(data || []);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    // Clear selected school when district changes
    setSelectedSchool(null);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    // Clear selected school when district changes
    setSelectedSchool(null);
    setSelectedDistrict(null);
  };

  const renderSelect = ({ label, value, options, onChange, placeholder }) => (
    <div
      className="
        mb-4
      "
    >
      <label
        className="
          block
          mb-1
          text-sm font-medium text-[var(--color-text)] font-outfit
        "
      >
        {label}
      </label>
      <select
        onChange={(e) => onChange(e.target.value)}
        value={value || ""}
        className="
          w-full
          px-3 py-2
          text-gray-900
          bg-white
          border border-gray-300 rounded-lg
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500
        "
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      {(selectedProject?.name === "Sanitary Pad Devices Procurement" ||
        selectedProject?.name === "Digital Device Procurement") && (
        <>
          <div
            className="
              p-6
              bg-[var(--color-surface)]
              rounded-xl
              shadow-sm
              theme-transition
            "
          >
            {renderSelect({
              label: "Select State",
              value: selectedState,
              options: stateOptions,
              onChange: handleStateChange,
              placeholder: "Choose a state",
            })}

            {selectedState &&
              renderSelect({
                label: "Select District",
                value: selectedDistrict,
                options: districtOptions,
                onChange: handleDistrictChange,
                placeholder: "Choose a district",
              })}

            {selectedDistrict &&
              renderSelect({
                label: "Select School",
                value: selectedSchool,
                options: schoolOptions,
                onChange: setSelectedSchool,
                placeholder: "Choose a school",
              })}

            {/* Skip "Select Category" for "Sanitary Pad Devices Procurement" */}
            {selectedSchool &&
              selectedProject?.name !== "Sanitary Pad Devices Procurement" &&
              renderSelect({
                label: "Select Category",
                value: selectedCategory,
                options: categories || [],
                onChange: setSelectedCategory,
                placeholder: "Choose a category",
              })}

            {selectedState && selectedDistrict && selectedSchool ? (
              checkedStatus ? (
                isProcurementAllowed ? (
                  <div>
                    <div
                      className="
                        mt-4 mb-4
                      "
                    >
                      <button
                        onClick={handleFetchData}
                        disabled={!isReadyToFetch || loading}
                        className={`
                          w-full
                          py-2 px-4
                          font-semibold text-white
                          rounded-lg
                          transition-colors
                          dark:text-[var(--color-primary-dark)]
                          ${
                            !isReadyToFetch || loading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)]"
                          }
                        `}
                      >
                        {loading ? "Fetching..." : "Fetch Data"}
                      </button>
                    </div>
                    {selectedSchool &&
                      selectedDistrict &&
                      selectedState &&
                      hasFetched && (
                        <h2
                          className="
                            mb-3
                            font-bold text-xl text-[var(--color-text)]
                          "
                        >
                          {selectedProject?.name} of {selectedSchool},{" "}
                          {selectedDistrict}, {selectedState}
                        </h2>
                      )}
                    {hasFetched &&
                      selectedProject?.name === "Digital Device Procurement" &&
                      fetchedData.length > 0 && (
                        <DeviceProcurementTable data={fetchedData} />
                      )}

                    {hasFetched &&
                      selectedProject?.name ===
                        "Sanitary Pad Devices Procurement" &&
                      fetchedData.length > 0 && (
                        <SanitaryPadTable data={fetchedData} />
                      )}

                    {hasFetched && fetchedData.length === 0 && !loading && (
                      <p
                        className="
                          mt-4
                          text-center text-gray-500
                          dark:text-gray-400
                        "
                      >
                        No records found for the selected criteria.
                      </p>
                    )}
                  </div>
                ) : (
                  <p
                    className="
                      mt-4
                      text-red-600 text-sm
                    "
                  >
                    Procurement is not active for this school. You cannot fetch
                    data.
                  </p>
                )
              ) : (
                <p
                  className="
                    mt-4
                    text-gray-500
                  "
                >
                  Checking permission...
                </p>
              )
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default SelectionForm;
