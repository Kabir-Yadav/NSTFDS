import React, { useState } from "react";
import {
  X,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Hash,
  Building2,
  FileText,
  Receipt,
  Shield,
  User,
  Phone,
  MessageSquare,
  Link,
} from "lucide-react";
import { useProjectComponents } from "../../../models/projectComponents";
import { getAvailableComponentsForSchool } from "../../../services/dispatchService";

const AddDispatchDialog = ({
  isOpen,
  onClose,
  school,
  onAddDispatch,
  projectName = "Space Lab",
}) => {
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [dispatchDate, setDispatchDate] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    tracking_number: "",
    tracking_url: "",
    vendor_name: "",
    purchase_order: "",
    invoice_number: "",
    warranty_period: "",
    installation_date: "",
    technician_name: "",
    contact_person: "",
    contact_phone: "",
    remarks: "",
  });

  // Fetch components from database
  const {
    components: projectComponents,
    loading: componentsLoading,
    error: componentsError,
  } = useProjectComponents(projectName);

  if (!isOpen) return null;

  // Get available components using utility function with fetched components
  const availableComponents = getAvailableComponentsForSchool(
    school,
    projectComponents || []
  );

  const toggleComponent = (componentName) => {
    setSelectedComponents((prev) => {
      if (prev.includes(componentName)) {
        return prev.filter((name) => name !== componentName);
      } else {
        return [...prev, componentName];
      }
    });
    // Clear error when component is selected
    if (errors.components) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.components;
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (selectedComponents.length === 0) {
      newErrors.components = "Please select at least one component";
    }

    // Expected delivery date is optional - no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdditionalInfoChange = (field, value) => {
    setAdditionalInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Prepare dispatch data with additional info (only include non-empty fields)
      const dispatchData = {
        components: selectedComponents,
      };

      // Add expected delivery date only if provided
      if (expectedDeliveryDate && expectedDeliveryDate.trim() !== "") {
        dispatchData.expected_delivery_date = expectedDeliveryDate;
      }

      // Add dispatch date only if provided
      if (dispatchDate && dispatchDate.trim() !== "") {
        dispatchData.dispatch_date = dispatchDate;
      }

      // Add additional info fields (only if they have values)
      Object.keys(additionalInfo).forEach((key) => {
        if (additionalInfo[key] && additionalInfo[key].trim() !== "") {
          dispatchData[key] = additionalInfo[key].trim();
        }
      });

      await onAddDispatch(school.id, dispatchData);

      // Reset form
      setSelectedComponents([]);
      setExpectedDeliveryDate("");
      setDispatchDate("");
      setAdditionalInfo({
        tracking_number: "",
        tracking_url: "",
        vendor_name: "",
        purchase_order: "",
        invoice_number: "",
        warranty_period: "",
        installation_date: "",
        technician_name: "",
        contact_person: "",
        contact_phone: "",
        remarks: "",
      });
      setShowAdditionalInfo(false);
      setErrors({});
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || "Failed to add dispatch" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedComponents([]);
    setExpectedDeliveryDate("");
    setDispatchDate("");
    setAdditionalInfo({
      tracking_number: "",
      tracking_url: "",
      vendor_name: "",
      purchase_order: "",
      invoice_number: "",
      warranty_period: "",
      installation_date: "",
      technician_name: "",
      contact_person: "",
      contact_phone: "",
      remarks: "",
    });
    setShowAdditionalInfo(false);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ marginTop: "0px" }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Dispatch
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {school?.school_name} - Select components for dispatch
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {componentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading components from database...
                </p>
              </div>
            </div>
          ) : componentsError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Failed to Load Components
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {componentsError?.message ||
                      "Unable to fetch project components from database. Please check your connection and try again."}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Check the browser console for more details.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Component Selection - Chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Package className="inline h-4 w-4 mr-1" />
                  Select Components ({selectedComponents.length} selected)
                </label>
                {availableComponents.length === 0 ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No available components. All components have already been
                      dispatched.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 min-h-[100px]">
                    {availableComponents.map((compName) => {
                      const isSelected = selectedComponents.includes(compName);
                      return (
                        <button
                          key={compName}
                          type="button"
                          onClick={() => toggleComponent(compName)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400"
                          }`}
                        >
                          {compName}
                        </button>
                      );
                    })}
                  </div>
                )}
                {errors.components && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.components}
                  </p>
                )}
              </div>

              {/* Dispatch Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Dispatch Date{" "}
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => {
                    setDispatchDate(e.target.value);
                    if (errors.dispatchDate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.dispatchDate;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                    errors.dispatchDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white`}
                />
                {errors.dispatchDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.dispatchDate}
                  </p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Expected Delivery Date{" "}
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => {
                    setExpectedDeliveryDate(e.target.value);
                    if (errors.expectedDeliveryDate) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.expectedDeliveryDate;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                    errors.expectedDeliveryDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white`}
                />
                {errors.expectedDeliveryDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.expectedDeliveryDate}
                  </p>
                )}
              </div>

              {/* Selected Components Summary */}
              {selectedComponents.length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Selected Components:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedComponents.map((compName) => (
                      <span
                        key={compName}
                        className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium"
                      >
                        {compName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Information (Optional)
                  </span>
                  {showAdditionalInfo ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>

                {showAdditionalInfo && (
                  <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tracking Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Hash className="inline h-4 w-4 mr-1" />
                          Tracking Number
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.tracking_number}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "tracking_number",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter tracking number"
                        />
                      </div>
                      {/* Tracking URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Link className="inline h-4 w-4 mr-1" />
                          Tracking URL
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.tracking_url}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "tracking_url",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter tracking URL"
                        />
                      </div>
                      {/* Vendor Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Building2 className="inline h-4 w-4 mr-1" />
                          Vendor Name
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.vendor_name}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "vendor_name",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter vendor name"
                        />
                      </div>

                      {/* Purchase Order */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FileText className="inline h-4 w-4 mr-1" />
                          Purchase Order
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.purchase_order}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "purchase_order",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter purchase order"
                        />
                      </div>

                      {/* Invoice Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Receipt className="inline h-4 w-4 mr-1" />
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.invoice_number}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "invoice_number",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter invoice number"
                        />
                      </div>

                      {/* Warranty Period */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Shield className="inline h-4 w-4 mr-1" />
                          Warranty Period
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.warranty_period}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "warranty_period",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="e.g., 1 year, 2 years"
                        />
                      </div>

                      {/* Installation Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Installation Date
                        </label>
                        <input
                          type="date"
                          value={additionalInfo.installation_date}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "installation_date",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Technician Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <User className="inline h-4 w-4 mr-1" />
                          Technician Name
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.technician_name}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "technician_name",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter technician name"
                        />
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <User className="inline h-4 w-4 mr-1" />
                          Contact Person
                        </label>
                        <input
                          type="text"
                          value={additionalInfo.contact_person}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "contact_person",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter contact person name"
                        />
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Phone className="inline h-4 w-4 mr-1" />
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={additionalInfo.contact_phone}
                          onChange={(e) =>
                            handleAdditionalInfoChange(
                              "contact_phone",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                          placeholder="Enter contact phone"
                        />
                      </div>
                    </div>

                    {/* Remarks - Full Width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        Remarks
                      </label>
                      <textarea
                        value={additionalInfo.remarks}
                        onChange={(e) =>
                          handleAdditionalInfoChange("remarks", e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                        placeholder="Enter any additional remarks or notes"
                      />
                    </div>
                  </div>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.submit}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              componentsLoading ||
              availableComponents.length === 0 ||
              selectedComponents.length === 0
            }
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting
              ? "Adding..."
              : `Add Dispatch (${selectedComponents.length} component${
                  selectedComponents.length !== 1 ? "s" : ""
                })`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDispatchDialog;
