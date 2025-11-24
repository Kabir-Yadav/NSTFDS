import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getSimpleStatusDisplay,
  getSimpleStatusColor,
  getAvailableNextStatuses,
  validateStatusChange,
  isExpectedDateRequired,
  SIMPLE_STATUS_ENUM,
} from "../../../utils/trainingHandoverUtils";
import {
  updateSchoolProjectTraining,
  updateSchoolProjectHandover,
  uploadCertificateFile,
} from "../../../action/supabase_actions";

const TrainingHandoverEditDialog = ({
  isOpen,
  onClose,
  school,
  type, // "training" or "handover"
  onUpdate,
}) => {
  const [status, setStatus] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen && school) {
      const currentStatus =
        type === "training"
          ? school.training_status || SIMPLE_STATUS_ENUM.NOT_STARTED
          : school.handover_status || SIMPLE_STATUS_ENUM.NOT_STARTED;

      const currentDate =
        type === "training"
          ? school.expected_training_completion_date || ""
          : school.expected_handover_date || "";

      setStatus(currentStatus);
      setExpectedDate(currentDate || "");
      setSelectedFile(null);
      setError(null);
    }
  }, [isOpen, school, type]);

  if (!isOpen || !school) return null;

  const currentStatus =
    type === "training"
      ? school.training_status || SIMPLE_STATUS_ENUM.NOT_STARTED
      : school.handover_status || SIMPLE_STATUS_ENUM.NOT_STARTED;

  const availableStatuses = getAvailableNextStatuses(currentStatus);
  const requiresDate = isExpectedDateRequired(currentStatus, status);
  const requiresCertificate =
    type === "handover" && status === SIMPLE_STATUS_ENUM.COMPLETE;

  const handleSave = async () => {
    setError(null);

    // Validate status change
    const validation = validateStatusChange(currentStatus, status);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Validate expected date if required
    if (requiresDate && !expectedDate) {
      setError(
        `Expected ${
          type === "training" ? "training completion" : "handover"
        } date is required when starting ${type}.`
      );
      return;
    }

    // Validate certificate if required (handover complete)
    if (
      requiresCertificate &&
      !selectedFile &&
      !school.handover_certificate_url
    ) {
      setError(
        "Handover certificate is required when marking handover as complete."
      );
      return;
    }

    setSaving(true);
    try {
      let certificateUrl = null;

      // Upload certificate if file is selected
      if (requiresCertificate && selectedFile) {
        const projectName = school.project_name || "Space Lab";
        const uploadResult = await uploadCertificateFile({
          file: selectedFile,
          projectName,
          schoolName: school.school_name,
        });

        if (uploadResult.error) {
          throw new Error(
            uploadResult.error.message || "Failed to upload certificate"
          );
        }

        certificateUrl = uploadResult.data;
      } else if (requiresCertificate && school.handover_certificate_url) {
        // Use existing certificate if no new file is selected
        certificateUrl = school.handover_certificate_url;
      }

      let result;
      if (type === "training") {
        result = await updateSchoolProjectTraining(
          school.id,
          status,
          expectedDate || null
        );
      } else {
        result = await updateSchoolProjectHandover(
          school.id,
          status,
          expectedDate || null,
          certificateUrl
        );
      }

      if (result.error) {
        throw new Error(result.error.message || "Failed to update status");
      }

      // Call onUpdate callback with updated data
      if (onUpdate) {
        const updatedSchool = {
          ...school,
          ...(type === "training"
            ? {
                training_status: status,
                expected_training_completion_date: expectedDate || null,
              }
            : {
                handover_status: status,
                expected_handover_date: expectedDate || null,
                handover_certificate_url:
                  certificateUrl || school.handover_certificate_url || null,
              }),
        };
        onUpdate(updatedSchool);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Failed to update status. Please try again.");
      console.error("Error updating status:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStatus(currentStatus);
    setExpectedDate(
      type === "training"
        ? school.expected_training_completion_date || ""
        : school.expected_handover_date || ""
    );
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF, JPG, PNG)
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF, JPG, or PNG file");
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      style={{ marginTop: "0px" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit {type === "training" ? "Training" : "Handover"} Status
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* School Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {school.school_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {school.state} • {school.district}
            </p>
          </div>

          {/* Current Status Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Status
            </label>
            <span
              className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getSimpleStatusColor(
                currentStatus
              )}`}
            >
              {getSimpleStatusDisplay(currentStatus)}
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {type === "training" ? "Training" : "Handover"} Status
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {availableStatuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {getSimpleStatusDisplay(statusOption)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Status changes are irreversible. You can only move forward.
            </p>
          </div>

          {/* Expected Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Expected{" "}
              {type === "training" ? "Training Completion" : "Handover"} Date
              {requiresDate && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {requiresDate
                ? "Required when starting " + type
                : "Optional. You can edit this date anytime."}
            </p>
          </div>

          {/* Handover Certificate Upload (only for handover type when status is complete) */}
          {requiresCertificate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Handover Certificate
                <span className="text-red-500 ml-1">*</span>
              </label>
              {school.handover_certificate_url && !selectedFile && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-900 dark:text-green-100">
                        Certificate Already Uploaded
                      </p>
                      <a
                        href={school.handover_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1 inline-block"
                      >
                        View Certificate →
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="handover-certificate-upload"
                />
                <label
                  htmlFor="handover-certificate-upload"
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    requiresCertificate &&
                    !selectedFile &&
                    !school.handover_certificate_url
                      ? "border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600"
                      : "border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500"
                  }`}
                >
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile
                      ? selectedFile.name
                      : school.handover_certificate_url
                      ? "Replace certificate"
                      : "Choose a file or drag it here"}
                  </span>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingHandoverEditDialog;
