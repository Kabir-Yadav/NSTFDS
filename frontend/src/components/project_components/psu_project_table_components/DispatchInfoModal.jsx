import React, { useState, useEffect } from "react";
import {
  X,
  XCircle,
  CheckCircle,
  Circle,
  Clock,
  Edit2,
  Save,
  Hash,
  Building2,
  FileText,
  Receipt,
  Shield,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Link,
} from "lucide-react";
import {
  normalizeDispatch,
  getDispatchStatusDisplay,
  getDispatchStatusColor,
  DISPATCH_STATUS_ENUM,
  DISPATCH_STATUS_OPTIONS,
} from "../../../utils/dispatchUtils";
import {
  updateDispatch,
  uploadDeliveryProof,
  uploadInstallationProof,
} from "../../../services/dispatchService";

const DispatchInfoModal = ({ isOpen, onClose, dispatch, school, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingDelivery, setUploadingDelivery] = useState(false);
  const [uploadingInstallation, setUploadingInstallation] = useState(false);

  // Initialize edit data when dispatch changes or edit mode is enabled
  useEffect(() => {
    if (isEditing && dispatch) {
      setEditData({
        tracking_number: dispatch.tracking_number || "",
        tracking_url: dispatch.tracking_url || "",
        vendor_name: dispatch.vendor_name || "",
        purchase_order: dispatch.purchase_order || "",
        invoice_number: dispatch.invoice_number || "",
        warranty_period: dispatch.warranty_period || "",
        installation_date: dispatch.installation_date || "",
        technician_name: dispatch.technician_name || "",
        contact_person: dispatch.contact_person || "",
        contact_phone: dispatch.contact_phone || "",
        remarks: dispatch.remarks || "",
        expected_delivery_date: dispatch.expected_delivery_date || "",
        dispatch_date: dispatch.dispatch_date || "",
      });
    }
  }, [isEditing, dispatch]);

  // Reset edit mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setEditData({});
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !dispatch) return null;

  // Normalize dispatch to support both new and legacy formats
  const normalizedDispatch = normalizeDispatch(dispatch);
  const components = normalizedDispatch.components || [];

  // Normalize proof fields to arrays for multi-proof support
  const deliveryProofUrls = Array.isArray(dispatch.delivery_proof_urls)
    ? dispatch.delivery_proof_urls
    : dispatch.delivery_proof_url
    ? [dispatch.delivery_proof_url]
    : [];

  const installationProofUrls = Array.isArray(dispatch.installation_proof_urls)
    ? dispatch.installation_proof_urls
    : dispatch.installation_proof_url
    ? [dispatch.installation_proof_url]
    : [];

  // Combined status flow steps based on dispatch_enum (in correct order)
  const statusSteps = [
    {
      label: getDispatchStatusDisplay(DISPATCH_STATUS_ENUM.PENDING_DISPATCH),
      value: DISPATCH_STATUS_ENUM.PENDING_DISPATCH,
    },
    {
      label: getDispatchStatusDisplay(DISPATCH_STATUS_ENUM.DISPATCHED),
      value: DISPATCH_STATUS_ENUM.DISPATCHED,
    },
    {
      label: getDispatchStatusDisplay(DISPATCH_STATUS_ENUM.IN_TRANSIT),
      value: DISPATCH_STATUS_ENUM.IN_TRANSIT,
    },
    {
      label: getDispatchStatusDisplay(DISPATCH_STATUS_ENUM.DELIVERED),
      value: DISPATCH_STATUS_ENUM.DELIVERED,
    },
    {
      label: getDispatchStatusDisplay(
        DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS
      ),
      value: DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS,
    },
    {
      label: getDispatchStatusDisplay(DISPATCH_STATUS_ENUM.INSTALLED),
      value: DISPATCH_STATUS_ENUM.INSTALLED,
    },
  ];

  const getCurrentStepIndex = (steps, currentStatus) => {
    return steps.findIndex((step) => step.value === currentStatus);
  };

  const currentStatus =
    dispatch.dispatch_status || DISPATCH_STATUS_ENUM.PENDING_DISPATCH;
  const statusStepIndex = getCurrentStepIndex(statusSteps, currentStatus);

  // Allow uploads only once status is at/after "Delivered"
  const currentStatusIndex = DISPATCH_STATUS_OPTIONS.indexOf(currentStatus);
  const deliveredStatusIndex = DISPATCH_STATUS_OPTIONS.indexOf(
    DISPATCH_STATUS_ENUM.DELIVERED
  );
  const canUploadProofs =
    currentStatusIndex >= 0 &&
    deliveredStatusIndex >= 0 &&
    currentStatusIndex >= deliveredStatusIndex;

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Prepare updates (only include non-empty fields or fields that were changed)
      const updates = {};
      Object.keys(editData).forEach((key) => {
        const value = editData[key];
        // Include field if it has a value or if it was explicitly set to empty string
        if (value !== null && value !== undefined) {
          updates[key] = value.trim() || null;
        }
      });

      const { data, error: updateError } = await updateDispatch(
        school?.id,
        dispatch.id,
        updates
      );

      if (updateError) {
        throw new Error(updateError);
      }

      // Update local state if callback provided
      if (onUpdate && data) {
        onUpdate(dispatch.id, data);
      }

      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update dispatch information");
      console.error("Failed to update dispatch:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setError(null);
  };

  const handleAddDeliveryProof = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !school) return;

    setUploadingDelivery(true);
    setError(null);
    try {
      for (const file of files) {
        // Upload each file and update parent state with latest dispatch
        // eslint-disable-next-line no-await-in-loop
        const { data, error: uploadError } = await uploadDeliveryProof(
          school.id,
          dispatch.id,
          file
        );
        if (uploadError) {
          throw new Error(uploadError);
        }
        if (onUpdate && data) {
          onUpdate(dispatch.id, data);
        }
      }
    } catch (err) {
      console.error("Failed to upload delivery proof(s):", err);
      setError(
        err.message || "Failed to upload delivery proof. Please try again."
      );
    } finally {
      setUploadingDelivery(false);
      event.target.value = "";
    }
  };

  const handleAddInstallationProof = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !school) return;

    setUploadingInstallation(true);
    setError(null);
    try {
      for (const file of files) {
        // Upload each file and update parent state with latest dispatch
        // eslint-disable-next-line no-await-in-loop
        const { data, error: uploadError } = await uploadInstallationProof(
          school.id,
          dispatch.id,
          file
        );
        if (uploadError) {
          throw new Error(uploadError);
        }
        if (onUpdate && data) {
          onUpdate(dispatch.id, data);
        }
      }
    } catch (err) {
      console.error("Failed to upload installation proof(s):", err);
      setError(
        err.message || "Failed to upload installation proof. Please try again."
      );
    } finally {
      setUploadingInstallation(false);
      event.target.value = "";
    }
  };

  const handleDeleteDeliveryProof = async (index) => {
    const current = Array.isArray(dispatch.delivery_proof_urls)
      ? dispatch.delivery_proof_urls
      : dispatch.delivery_proof_url
      ? [dispatch.delivery_proof_url]
      : [];
    if (index < 0 || index >= current.length) return;

    const updated = current.filter((_, i) => i !== index);

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await updateDispatch(
        school?.id,
        dispatch.id,
        {
          delivery_proof_urls: updated,
          delivery_proof_url: updated[0] || null,
        }
      );

      if (updateError) {
        throw new Error(updateError);
      }

      if (onUpdate && data) {
        onUpdate(dispatch.id, data);
      }
    } catch (err) {
      setError(
        err.message || "Failed to delete delivery proof. Please try again."
      );
      console.error("Failed to delete delivery proof:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInstallationProof = async (index) => {
    const current = Array.isArray(dispatch.installation_proof_urls)
      ? dispatch.installation_proof_urls
      : dispatch.installation_proof_url
      ? [dispatch.installation_proof_url]
      : [];
    if (index < 0 || index >= current.length) return;

    const updated = current.filter((_, i) => i !== index);

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await updateDispatch(
        school?.id,
        dispatch.id,
        {
          installation_proof_urls: updated,
          installation_proof_url: updated[0] || null,
        }
      );

      if (updateError) {
        throw new Error(updateError);
      }

      if (onUpdate && data) {
        onUpdate(dispatch.id, data);
      }
    } catch (err) {
      setError(
        err.message || "Failed to delete installation proof. Please try again."
      );
      console.error("Failed to delete installation proof:", err);
    } finally {
      setSaving(false);
    }
  };

  const StepIndicator = ({ step, index, currentIndex, isLast }) => {
    // If it's the last step and it's the current status, treat it as completed
    const isCompleted =
      index < currentIndex || (isLast && index === currentIndex);
    const isCurrent = index === currentIndex && !isLast;
    const isPending = index > currentIndex;

    return (
      <div
        className={`flex items-center min-w-0 ${
          isLast ? "flex-none" : "flex-1"
        }`}
      >
        <div className="flex flex-col items-center min-w-0 flex-shrink-0">
          <div
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 ${
              isCompleted
                ? "bg-green-500 border-green-500 text-white"
                : isCurrent
                ? "bg-blue-500 border-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            ) : isCurrent ? (
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            ) : (
              <Circle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            )}
          </div>
          <p
            className={`mt-1 sm:mt-1.5 md:mt-2 text-[9px] sm:text-[10px] md:text-xs text-center max-w-[50px] sm:max-w-[60px] md:max-w-[80px] leading-tight ${
              isCompleted || isCurrent
                ? "text-gray-900 dark:text-white font-medium"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {step.label}
          </p>
        </div>
        {!isLast && (
          <div
            className={`flex-1 h-0.5 mx-1 sm:mx-1.5 md:mx-2 ${
              isCompleted ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
      style={{ marginTop: "0px" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
              Dispatch Details
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
              Dispatch #{dispatch.dispatch_no} • {components.length} Component
              {components.length !== 1 ? "s" : ""}
              {(isEditing
                ? editData.expected_delivery_date
                : dispatch.expected_delivery_date) && (
                <>
                  {" "}
                  • Expected:{" "}
                  {isEditing
                    ? editData.expected_delivery_date
                    : dispatch.expected_delivery_date}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                title="Edit information"
              >
                <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1.5 sm:p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Save changes"
                >
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Cancel editing"
                >
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 dark:text-purple-300" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Basic Info Card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                    School
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5 sm:mt-1 line-clamp-2">
                    {school?.school_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                    Dispatch Date
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.dispatch_date || ""}
                      onChange={(e) =>
                        handleEditChange("dispatch_date", e.target.value)
                      }
                      className="w-full mt-0.5 sm:mt-1 px-2 py-1 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5 sm:mt-1">
                      {dispatch.dispatch_date || (
                        <span className="text-gray-400 dark:text-gray-500 italic text-xs">
                          No date added
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                    Total Components
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5 sm:mt-1">
                    {components.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                    Expected Delivery
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.expected_delivery_date || ""}
                      onChange={(e) =>
                        handleEditChange(
                          "expected_delivery_date",
                          e.target.value
                        )
                      }
                      className="w-full mt-0.5 sm:mt-1 px-2 py-1 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white mt-0.5 sm:mt-1">
                      {dispatch.expected_delivery_date || "--"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Components List - Chips */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                Components ({components.length})
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {components.map((comp, index) => {
                  // Handle both new format (string) and legacy format (object)
                  const componentName =
                    typeof comp === "string"
                      ? comp
                      : comp.component_name ||
                        comp.component ||
                        "Unknown Component";
                  return (
                    <span
                      key={index}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {componentName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Status Flow */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                Dispatch Status
              </h3>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <div className="flex items-center min-w-[600px] sm:min-w-0">
                  {statusSteps.map((step, index) => (
                    <StepIndicator
                      key={step.value}
                      step={step}
                      index={index}
                      currentIndex={statusStepIndex}
                      isLast={index === statusSteps.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  Additional Information
                </h3>
                {isEditing && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Editing Mode
                  </span>
                )}
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {/* Tracking Number */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Hash className="inline h-3 w-3 mr-1" />
                      Tracking Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.tracking_number || ""}
                        onChange={(e) =>
                          handleEditChange("tracking_number", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter tracking number"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-all">
                          {dispatch.tracking_number || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tracking URL */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Link className="inline h-3 w-3 mr-1" />
                      Tracking URL
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.tracking_url || ""}
                        onChange={(e) =>
                          handleEditChange("tracking_url", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter tracking URL"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        {dispatch.tracking_url ? (
                          <a
                            href={dispatch.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {dispatch.tracking_url}
                          </a>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            --
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Vendor Name */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Building2 className="inline h-3 w-3 mr-1" />
                      Vendor Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.vendor_name || ""}
                        onChange={(e) =>
                          handleEditChange("vendor_name", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter vendor name"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                          {dispatch.vendor_name || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Purchase Order */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <FileText className="inline h-3 w-3 mr-1" />
                      Purchase Order
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.purchase_order || ""}
                        onChange={(e) =>
                          handleEditChange("purchase_order", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter purchase order"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-all">
                          {dispatch.purchase_order || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Invoice Number */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Receipt className="inline h-3 w-3 mr-1" />
                      Invoice Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.invoice_number || ""}
                        onChange={(e) =>
                          handleEditChange("invoice_number", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter invoice number"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-all">
                          {dispatch.invoice_number || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warranty Period */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Shield className="inline h-3 w-3 mr-1" />
                      Warranty Period
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.warranty_period || ""}
                        onChange={(e) =>
                          handleEditChange("warranty_period", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="e.g., 1 year, 2 years"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                          {dispatch.warranty_period || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Installation Date */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      Installation Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.installation_date || ""}
                        onChange={(e) =>
                          handleEditChange("installation_date", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                          {dispatch.installation_date || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Technician Name */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <User className="inline h-3 w-3 mr-1" />
                      Technician Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.technician_name || ""}
                        onChange={(e) =>
                          handleEditChange("technician_name", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter technician name"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                          {dispatch.technician_name || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <User className="inline h-3 w-3 mr-1" />
                      Contact Person
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.contact_person || ""}
                        onChange={(e) =>
                          handleEditChange("contact_person", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter contact person name"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                          {dispatch.contact_person || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <Phone className="inline h-3 w-3 mr-1" />
                      Contact Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.contact_phone || ""}
                        onChange={(e) =>
                          handleEditChange("contact_phone", e.target.value)
                        }
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white"
                        placeholder="Enter contact phone"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                          {dispatch.contact_phone || "--"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remarks - Full Width */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 md:mb-2 uppercase">
                      <MessageSquare className="inline h-3 w-3 mr-1" />
                      Remarks
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editData.remarks || ""}
                        onChange={(e) =>
                          handleEditChange("remarks", e.target.value)
                        }
                        rows={4}
                        className="w-full px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm text-gray-900 dark:text-white resize-none"
                        placeholder="Enter any additional remarks or notes"
                      />
                    ) : (
                      <div className="px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[60px] sm:min-h-[70px] md:min-h-[80px]">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                          {dispatch.remarks || "--"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Documents */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                Proof Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Delivery Proof */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                    Delivery Proof
                  </p>
                  {deliveryProofUrls.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {deliveryProofUrls.map((url, index) => (
                        <div
                          key={url}
                          className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            File {index + 1} →
                          </a>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDeliveryProof(index)}
                              className="ml-1 text-red-500 hover:text-red-600 text-[10px] sm:text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                      Not uploaded
                    </p>
                  )}
                  {isEditing && (
                    <div className="mt-2">
                      <label
                        htmlFor={`delivery-proof-upload-${dispatch.id}`}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white ${
                          uploadingDelivery || !canUploadProofs
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                        }`}
                      >
                        {uploadingDelivery ? "Uploading..." : "Add Proof"}
                      </label>
                      <input
                        id={`delivery-proof-upload-${dispatch.id}`}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleAddDeliveryProof}
                        disabled={uploadingDelivery || !canUploadProofs}
                      />
                    </div>
                  )}
                </div>

                {/* Installation Proof */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                    Installation Proof
                  </p>
                  {installationProofUrls.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {installationProofUrls.map((url, index) => (
                        <div
                          key={url}
                          className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full"
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            File {index + 1} →
                          </a>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteInstallationProof(index)
                              }
                              className="ml-1 text-red-500 hover:text-red-600 text-[10px] sm:text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                      Not uploaded
                    </p>
                  )}
                  {isEditing && (
                    <div className="mt-2">
                      <label
                        htmlFor={`installation-proof-upload-${dispatch.id}`}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white ${
                          uploadingInstallation || !canUploadProofs
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                        }`}
                      >
                        {uploadingInstallation ? "Uploading..." : "Add Proof"}
                      </label>
                      <input
                        id={`installation-proof-upload-${dispatch.id}`}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleAddInstallationProof}
                        disabled={uploadingInstallation || !canUploadProofs}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchInfoModal;
