import React, { useState } from "react";
import {
  X,
  School,
  DollarSign,
  FileCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  createSpaceLabSchoolProject,
  uploadCertificateFile,
} from "../../../action/supabase_actions";

const AddSpaceLabSchoolDialog = ({
  isOpen,
  onClose,
  onSuccess,
  projectName = "Space Lab",
}) => {
  const [formData, setFormData] = useState({
    school_name: "",
    unit_cost: "",
    readiness: false,
    requires_certificate: false,
    readiness_certificate_url: null,
    remarks: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // When readiness is toggled on, automatically require certificate
      if (field === "readiness" && value === true) {
        newData.requires_certificate = true;
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
        setErrors((prev) => ({
          ...prev,
          certificate: "Please upload a PDF, JPG, or PNG file",
        }));
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          certificate: "File size must be less than 5MB",
        }));
        setSelectedFile(null);
        return;
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.certificate;
        return newErrors;
      });
      setSelectedFile(file);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.school_name.trim()) {
      newErrors.school_name = "School name is required";
    }

    if (!formData.unit_cost || parseFloat(formData.unit_cost) <= 0) {
      newErrors.unit_cost = "Unit cost must be greater than 0";
    }

    // If readiness is true, certificate is mandatory
    if (
      formData.readiness &&
      !selectedFile &&
      !formData.readiness_certificate_url
    ) {
      newErrors.certificate =
        "Certificate is required when marking school as ready. Please upload a certificate.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      let certificateUrl = formData.readiness_certificate_url;

      // Upload certificate file if provided (required when readiness is true)
      if (formData.readiness) {
        if (selectedFile) {
          const { data: uploadedUrl, error: uploadError } =
            await uploadCertificateFile({
              file: selectedFile,
              projectName: projectName || "Space Lab",
              schoolName: formData.school_name.trim(),
            });
          if (uploadError || !uploadedUrl) {
            throw new Error(
              uploadError?.message || "Failed to upload certificate"
            );
          }
          certificateUrl = uploadedUrl;
        } else if (!formData.readiness_certificate_url) {
          throw new Error(
            "Certificate is required when marking school as ready"
          );
        }
      }

      // Call the database function
      const { data, error } = await createSpaceLabSchoolProject({
        school_name: formData.school_name.trim(),
        unit_cost: parseFloat(formData.unit_cost),
        readiness: formData.readiness,
        requires_certificate: formData.readiness, // Set to true if readiness is true
        readiness_certificate_url: certificateUrl,
        remarks: formData.remarks.trim() || null,
        project_name: projectName,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        school_name: "",
        unit_cost: "",
        readiness: false,
        requires_certificate: false,
        readiness_certificate_url: null,
        remarks: "",
      });
      setSelectedFile(null);
      setErrors({});

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }

      onClose();
    } catch (err) {
      console.error("Error creating school project:", err);
      setErrors({
        submit:
          err.message || "Failed to create school project. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      school_name: "",
      unit_cost: "",
      readiness: false,
      requires_certificate: false,
      readiness_certificate_url: null,
      remarks: "",
    });
    setSelectedFile(null);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ margin: 0 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Space Lab School Project
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new entry for a school in the Space Lab project
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* School Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <School className="h-4 w-4" />
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) =>
                  handleInputChange("school_name", e.target.value)
                }
                placeholder="Enter school name as stored in schools.name"
                className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.school_name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.school_name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.school_name}
                </p>
              )}
            </div>

            {/* Unit Cost */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4" />
                Unit Cost <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => handleInputChange("unit_cost", e.target.value)}
                placeholder="Enter unit cost"
                className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.unit_cost
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.unit_cost && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.unit_cost}
                </p>
              )}
            </div>

            {/* Readiness Toggle Switch */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="readiness"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mark as Ready
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="readiness"
                  checked={formData.readiness}
                  onChange={(e) =>
                    handleInputChange("readiness", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-green-600 dark:peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>

            {/* Certificate Upload - Show when readiness is true */}
            {formData.readiness && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileCheck className="h-4 w-4" />
                  Readiness Certificate <span className="text-red-500">*</span>
                </label>
                {!selectedFile && !formData.readiness_certificate_url && (
                  <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Certificate is required when marking school as ready.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.certificate
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-900 dark:text-green-100">
                        {selectedFile.name}
                      </span>
                    </div>
                  )}
                </div>
                {errors.certificate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.certificate}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Accepted formats: PDF, JPG, PNG (max 5MB)
                </p>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Remarks (Optional)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Enter any additional remarks"
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSpaceLabSchoolDialog;
