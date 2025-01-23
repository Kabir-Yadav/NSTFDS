import React, { useState } from "react";
import AddDataModal from "./AddDataModel";
import DeviceProcurementTable from "./Table";
import TrainingForm from "./forms/training-form";
import DeviceForm from "./forms/device-form";

const SelectionForm = ({
  selectedProject,
  selectedState,
  selectedDistrict,
  selectedSchool,
  selectedCategory,
  states,
  districts,
  schools,
  categories,
  onStateSelect,
  onDistrictSelect,
  onSchoolSelect,
  onCategorySelect,
}) => {
  const [showAddDataModal, setShowAddDataModal] = useState(false);

  const renderSelect = ({ label, value, options, onChange, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1 font-outfit">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-[var(--color-border)] bg-[var(--color-surface)] 
                 text-[var(--color-text)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] 
                 focus:border-transparent font-redhat theme-transition"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option
            key={index}
            value={typeof option === "string" ? option : option.id}
          >
            {typeof option === "string" ? option : option.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-[var(--color-surface)] rounded-xl shadow-sm p-6 theme-transition">
      {selectedProject?.name ==
        "Residential Training Project for EMRS Teachers" ||
      selectedProject?.name == "Digital Device Procurement" ? (
        <div className="mb-6">
          <button
            onClick={() => setShowAddDataModal(true)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg 
                     transition-colors font-redhat
                     flex items-center space-x-2"
          >
            <span className="text-lg">+</span>
            <span>Add Data</span>
          </button>
        </div>
      ) : (
        <></>
      )}
      {/* Selection Dropdowns */}
      {renderSelect({
        label: "Select State",
        value: selectedState,
        options: states,
        onChange: onStateSelect,
        placeholder: "Choose a state",
      })}
      {selectedState &&
        renderSelect({
          label: "Select District",
          value: selectedDistrict,
          options: districts,
          onChange: onDistrictSelect,
          placeholder: "Choose a district",
        })}
      {selectedDistrict &&
        renderSelect({
          label: "Select School",
          value: selectedSchool,
          options: schools,
          onChange: onSchoolSelect,
          placeholder: "Choose a school",
        })}
      {selectedSchool &&
        renderSelect({
          label: "Select Category",
          value: selectedCategory,
          options: categories,
          onChange: onCategorySelect,
          placeholder: "Choose a category",
        })}
      {/* Device Procurement Table */}
      {(selectedProject?.name === "Digital Device Procurement" ||
        selectedProject?.name ==
          "Residential Training Project for EMRS Teachers") &&
        selectedCategory && (
          <DeviceProcurementTable
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedSchool={selectedSchool}
            selectedCategory={selectedCategory}
          />
        )}
      {/* Add Data Modal */}
      {selectedProject?.name ===
        "Residential Training Project for EMRS Teachers" && (
        <TrainingForm
          isOpen={showAddDataModal}
          onClose={() => setShowAddDataModal(false)}
        />
      )}

      {selectedProject?.name === "Digital Device Procurement" && (
        <DeviceForm
          isOpen={showAddDataModal}
          onClose={() => setShowAddDataModal(false)}
        />
      )}
    </div>
  );
};

export default SelectionForm;
