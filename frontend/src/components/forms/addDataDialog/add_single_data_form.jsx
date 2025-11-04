import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Package,
  DollarSign,
  FileImage,
  AlertCircle,
  Landmark,
} from "lucide-react";
import { InputField } from "./FormFields";
import {
  insertProjectDelivery,
  uploadProofImage,
} from "../../../action/supabase_actions";

// Initial form state
const initialFormState = (psu_name) => ({
  // Required fields
  committedDate: "",
  targetDate: "",
  state: "",
  district: "",
  schoolName: "",
  itemType: "",
  quantity: "",
  unitCost: "",
  totalCost: "",
  status: "",
  PSU: psu_name || "",

  // Optional fields
  block: "",
  stage1ProofUrl: null,
  stage2ProofUrl: null,
  TackNumber: "",
  vendorName: "",
  purchaseOrderNumber: "",
  invoiceNumber: "",
  installationDate: "",
  contactNumber: "",
  certificateUrl: "",
  remarks: "",
});

const AddSingleDataForm = ({
  projectName,
  psu_name,
  psuList,
  isOpen,
  hierarchicalData,
  onClose,
  categories,
  status,
  onSubmitSingle,
}) => {
  const [formData, setFormData] = useState({
    ...initialFormState,
    PSU: psu_name || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Handle cost calculations
      if (field === "quantity" || field === "unitCost") {
        const quantity =
          field === "quantity"
            ? parseFloat(value)
            : parseFloat(prev.quantity) || 0;
        const unitCost =
          field === "unitCost"
            ? parseFloat(value)
            : parseFloat(prev.unitCost) || 0;
        newData.totalCost = (quantity * unitCost).toFixed(2);
      }

      return newData;
    });

    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // Memoize options
  const stateOptions = useMemo(
    () =>
      hierarchicalData
        ? [...new Set(hierarchicalData.map((item) => item.state_name))]
        : [],
    [hierarchicalData]
  );

  const districtOptions = useMemo(
    () =>
      formData.state && hierarchicalData
        ? hierarchicalData
            .find((item) => item.state_name === formData.state)
            ?.districts?.map((d) => d.district_name) || []
        : [],
    [hierarchicalData, formData.state]
  );

  const schoolOptions = useMemo(
    () =>
      formData.state && formData.district && hierarchicalData
        ? hierarchicalData
            .find((item) => item.state_name === formData.state)
            ?.districts?.find((d) => d.district_name === formData.district)
            ?.functional_schools || []
        : [],
    [hierarchicalData, formData.state, formData.district]
  );

  const validateForm = () => {
    const newErrors = {}; // Required fields validation
    const requiredFields = {
      committedDate: "Committed Date",
      targetDate: "Target Date",
      state: "State",
      district: "District",
      schoolName: "School Name",
      totalCost: "Total Cost",
      status: "Status",
      ...(Array.isArray(categories) &&
        categories.length > 0 && { itemType: "Item Type" }),
      PSU: "PSU",
      ...(formData.status === status[status.length - 2] ||
      formData.status === status[status.length - 1]
        ? { stage1ProofUrl: "Stage 1 Proof Document" }
        : {}),
      ...(formData.status === status[status.length - 1]
        ? { stage2ProofUrl: "Stage 2 Proof Document" }
        : {}),
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = `${label} is required`;
      }
    });

    // Numeric validations
    if (
      formData.quantity &&
      (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0)
    ) {
      newErrors.quantity = "Quantity must be a positive number";
    }

    if (
      formData.unitCost &&
      (isNaN(formData.unitCost) || parseFloat(formData.unitCost) <= 0)
    ) {
      newErrors.unitCost = "Unit cost must be a positive number";
    }

    if (
      formData.totalCost &&
      (isNaN(formData.totalCost) || parseFloat(formData.totalCost) <= 0)
    ) {
      newErrors.totalCost = "Total cost must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed. Invalid fields:", errors);
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`${field}: ${error}`);
      });
      return;
    }

    setLoading(true);

    try {
      let urlStage1 = null;
      let urlStage2 = null; // Upload Stage 1 proof if exists
      // Only upload if value is a File (not string/URL)
      if (formData.stage1ProofUrl && formData.stage1ProofUrl instanceof File) {
        urlStage1 = await uploadProofImage({
          file: formData.stage1ProofUrl,
          projectName,
        });
      } else if (typeof formData.stage1ProofUrl === "string") {
        urlStage1 = formData.stage1ProofUrl;
      }

      if (formData.stage2ProofUrl && formData.stage2ProofUrl instanceof File) {
        urlStage2 = await uploadProofImage({
          file: formData.stage2ProofUrl,
          projectName,
        });
      } else if (typeof formData.stage2ProofUrl === "string") {
        urlStage2 = formData.stage2ProofUrl;
      }

      // Continue with form submission
      try {
        const payload = {
          psu_name: formData.PSU,
          project_name: projectName,
          state: formData.state,
          district: formData.district,
          block: formData.block || null,
          school_name: formData.schoolName,
          item_type: formData.itemType,
          quantity: Number(formData.quantity) || 0,
          unit_cost: Number(formData.unitCost) || 0,
          total_cost: Number(formData.totalCost) || 0,
          committed_date: formData.committedDate,
          status: formData.status,
          stage1_proof_url: urlStage1 || null,
          stage2_proof_url: urlStage2 || null,
          target_date: formData.targetDate,
          completion_certificate_url: formData.certificateUrl || null,
          extra_json: {
            tracking_number: formData.TackNumber || null,
            vendor_name: formData.vendorName || null,
            purchase_order_number: formData.purchaseOrderNumber || null,
            invoice_number: formData.invoiceNumber || null,
            installation_date: formData.installationDate || null,
            contact_number: formData.contactNumber || null,
            remarks: formData.remarks || null,
          },
        };

        const { data, error } = await insertProjectDelivery(payload);
        if (error) throw error;
        onSubmitSingle(data);
        handleClose();
      } catch (error) {
        console.error("Submission error:", error);
        setErrors({ submit: `Failed to save data: ${error.message}` });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors({ submit: `Failed to save data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setFormData({ ...initialFormState, PSU: psu_name || "" });
    setErrors({});
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Add New {projectName.replace("Procurement", "").trim()}
          </h2>
          <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
            Fill in the essential details to create a new project record
          </p>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            {/* Date and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Committed Date"
                name="committedDate"
                type="date"
                icon={Calendar}
                required
                value={formData.committedDate}
                onChange={handleInputChange}
                error={errors.committedDate}
              />
              <InputField
                label="Target Date"
                name="targetDate"
                type="date"
                icon={Calendar}
                value={formData.targetDate}
                onChange={handleInputChange}
                error={errors.targetDate}
                required
              />
              <InputField
                label="Status"
                name="status"
                icon={Package}
                options={status}
                placeholder="Select status"
                required
                value={formData.status}
                onChange={handleInputChange}
                error={errors.status}
              />{" "}
              <InputField
                label="PSU"
                name="PSU"
                icon={Landmark}
                value={psu_name}
                disabled={true}
              />
            </div>
            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="State"
                  name="state"
                  icon={MapPin}
                  options={stateOptions}
                  placeholder="Select state"
                  required
                  value={formData.state}
                  onChange={handleInputChange}
                  error={errors.state}
                />
                <InputField
                  label="District"
                  name="district"
                  icon={MapPin}
                  options={districtOptions}
                  placeholder="Select district"
                  disabled={!formData.state}
                  required
                  value={formData.district}
                  onChange={handleInputChange}
                  error={errors.district}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Block"
                  name="block"
                  placeholder="Enter block name (optional)"
                  value={formData.block}
                  onChange={handleInputChange}
                />
                <InputField
                  label="School Name"
                  name="schoolName"
                  options={schoolOptions}
                  placeholder="Select school"
                  disabled={!formData.district}
                  required
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  error={errors.schoolName}
                />
              </div>
            </div>
            {/* Item Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Item Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(categories) && categories.length > 0 && (
                  <InputField
                    label="Item Type"
                    name="itemType"
                    options={categories}
                    placeholder="Select item type"
                    required
                    value={formData.itemType}
                    onChange={handleInputChange}
                    error={errors.itemType}
                  />
                )}
                <InputField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  error={errors.quantity}
                />
              </div>
            </div>{" "}
            {/* Cost Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Cost Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Unit Cost"
                  name="unitCost"
                  type="number"
                  icon={DollarSign}
                  placeholder="0.00"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                  error={errors.unitCost}
                />
                <InputField
                  label="Total Cost"
                  name="totalCost"
                  type="number"
                  icon={DollarSign}
                  placeholder="0.00"
                  required
                  value={formData.totalCost}
                  onChange={handleInputChange}
                  error={errors.totalCost}
                />
                {/* Show Stage 1 proof for second last and last status */}
                {formData.status === status[status.length - 2] ||
                formData.status === status[status.length - 1] ? (
                  <div className="md:col-span-1">
                    <InputField
                      label="Stage 1 Proof"
                      name="stage1ProofUrl"
                      type="file"
                      icon={FileImage}
                      required
                      value={formData.stage1ProofUrl}
                      onChange={handleInputChange}
                      error={errors.stage1ProofUrl}
                    />
                  </div>
                ) : null}
                {/* Show Stage 2 proof only for last status */}
                {formData.status === status[status.length - 1] ? (
                  <div className="md:col-span-1">
                    <InputField
                      label="Stage 2 Proof"
                      name="stage2ProofUrl"
                      type="file"
                      icon={FileImage}
                      required
                      value={formData.stage2ProofUrl}
                      onChange={handleInputChange}
                      error={errors.stage2ProofUrl}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            {/* Extra Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Extra Details (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Delivery Tracking Number"
                  name="TackNumber"
                  type="text"
                  placeholder="Enter tracking number"
                  value={formData.TackNumber}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Vendor Name"
                  name="vendorName"
                  type="text"
                  placeholder="Enter vendor name"
                  value={formData.vendorName}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Purchase Order Number"
                  name="purchaseOrderNumber"
                  type="text"
                  value={formData.purchaseOrderNumber}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Invoice Number"
                  name="invoiceNumber"
                  type="number"
                  placeholder="Enter invoice number"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Installation Date"
                  name="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Contact Number"
                  name="contactNumber"
                  type="number"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Certificate Url"
                  name="certificateUrl"
                  type="text"
                  value={formData.certificateUrl}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Remarks"
                  name="remarks"
                  type="text"
                  value={formData.remarks}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center min-w-[120px] ${
                  loading
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Create Delivery"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSingleDataForm;
