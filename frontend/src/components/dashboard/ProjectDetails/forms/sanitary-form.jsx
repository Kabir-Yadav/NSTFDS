import React, { useEffect, useState } from "react";
import {
  insertSanitaryProcurement,
  isSanitaryProcurementActive,
  uploadProofImage,
} from "../../../../action/supabase_actions";

const SanitaryPadForm = ({ isOpen, data, onClose }) => {
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formPhoto, setFormPhoto] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Added error state

  const [isProcurementAllowed, setIsProcurementAllowed] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setCheckedStatus(false);
      const result = await isSanitaryProcurementActive(selectedSchool);
      setIsProcurementAllowed(result);
      setCheckedStatus(true);
    };

    if (selectedState && selectedDistrict && selectedSchool) {
      checkStatus();
    }
  }, [selectedState, selectedDistrict, selectedSchool]);

  const handleClose = () => {
    setFormDate("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedSchool("");
    setFormStatus("");
    setFormCost("");
    setFormPhoto(null);
    setErrorMessage('')
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formDate ||
      !selectedState ||
      !selectedDistrict ||
      !selectedSchool ||
      !formStatus ||
      !formCost ||
      !formPhoto
    ) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setErrorMessage("");

    // ⬆️ Upload image to bucket
    const uploadedUrl = await uploadProofImage({file:formPhoto,sanitary:true});
    if (!uploadedUrl) {
      setErrorMessage("Image upload failed.");
      return;
    }

    // 📤 Insert into digital_device_procurement
    const formData = {
      state_name: selectedState,
      district_name: selectedDistrict,
      school_name: selectedSchool,
      cost: Number(formCost),
      status: formStatus,
      delivery_date: formDate,
      proof_image_url: uploadedUrl,
    };

    const result = await insertSanitaryProcurement(formData);
    if (result.success) {
      // Reset form
      setFormDate("");
      setSelectedState("");
      setSelectedDistrict("");
      setSelectedSchool("");
      setFormStatus("");
      setFormCost("");
      setFormPhoto(null);
      onClose();
    } else {
      setErrorMessage("Error saving data to database.");
    }
  };

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

  if (!isOpen) return null;

  const renderSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder,
    disabled = false,
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border px-3 py-2 rounded-lg disabled:bg-[var(--color-text-secondary)] bg-white"
        disabled={disabled}
        required
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

  const statusOptions = [
    { value: "shipped", label: "Shipped" },
    { value: "pending", label: "Pending" },
    { value: "just deployed", label: "Just Deployed" },
    { value: "arrived", label: "Arrived" },
  ];

  return (
    <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-7 relative">
        <div className="max-h-full overflow-y-auto w-full">
          <h2 className="text-3xl font-display font-semibold text-gray-900 mb-6">
            Add Sanitary Pad Data
          </h2>
          {errorMessage && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderSelect({
                label: "State",
                value: selectedState,
                options: stateOptions,
                onChange: setSelectedState,
                placeholder: "Select a state",
              })}
              {renderSelect({
                label: "District",
                value: selectedDistrict,
                options: districtOptions,
                onChange: setSelectedDistrict,
                placeholder: "Select a district",
                disabled: !selectedState,
              })}
            </div>
            {renderSelect({
              label: "School",
              value: selectedSchool,
              options: schoolOptions,
              onChange: setSelectedSchool,
              placeholder: "Select a school",
              disabled: !selectedDistrict,
            })}
            {selectedState && selectedDistrict && selectedSchool ? (
              checkedStatus ? (
                isProcurementAllowed ? (
                  <div>
                    {renderSelect({
                      label: "Status",
                      value: formStatus,
                      options: statusOptions.map((option) => option.label),
                      onChange: setFormStatus,
                      placeholder: "Select status",
                    })}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost
                      </label>
                      <input
                        type="number"
                        value={formCost}
                        onChange={(e) => setFormCost(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proof Photo
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setFormPhoto(e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        accept="image/*"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm mt-4">
                    Sanitory procurement is not active for this school. You
                    cannot submit data.
                  </p>
                )
              ) : (
                <p className="text-gray-500 mt-4">Checking permission...</p>
              )
            ) : null}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {isProcurementAllowed && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={!checkedStatus}
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SanitaryPadForm;
