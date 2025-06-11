import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  X,
  Edit3,
  Save,
  XCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";

const StatusTimeline = ({
  status,
  deliveryDate,
  isOpen,
  onClose,
  additionalData = {},
  onUpdateData,
  projectStatuses = [], // Array of possible statuses for this project
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    delivery_tracking_number: "",
    vendor_name: "",
    purchase_order_number: "",
    invoice_number: "",
    warranty_period: "",
    installation_date: "",
    technician_name: "",
    contact_person: "",
    contact_phone: "",
    remarks: "",
  });

  // Initialize edit data when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditData({
        delivery_tracking_number:
          additionalData?.delivery_tracking_number ?? "",
        vendor_name: additionalData?.vendor_name ?? "",
        purchase_order_number: additionalData?.purchase_order_number ?? "",
        invoice_number: additionalData?.invoice_number ?? "",
        warranty_period: additionalData?.warranty_period ?? "",
        installation_date: additionalData?.installation_date ?? "",
        technician_name: additionalData?.technician_name ?? "",
        contact_person: additionalData?.contact_person ?? "",
        contact_phone: additionalData?.contact_phone ?? "",
        remarks: additionalData?.remarks ?? "",
      });
    }
  }, [isOpen]); // Only run when isOpen changes
  const getStatusStages = () => {
    // Map status icons based on position in the flow
    const getIconForStatus = (status, index, total) => {
      if (index === 0) return Clock; // First status
      if (index === total - 1) return FileCheck; // Last status
      if (index === total - 2) return CheckCircle; // Second to last status

      // For intermediate statuses, use contextual icons
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes("ship")) return Truck;
      if (lowerStatus.includes("arrive") || lowerStatus.includes("deliver"))
        return Package;
      if (lowerStatus.includes("deploy")) return CheckCircle;
      if (lowerStatus.includes("approve")) return FileCheck;
      if (lowerStatus.includes("review")) return AlertCircle;

      return CheckCircle; // Default icon
    };

    // Map the actual project statuses to stage objects
    const stages = projectStatuses.map((statusOption, index) => ({
      key: statusOption.toLowerCase(),
      label: statusOption,
      icon: getIconForStatus(statusOption, index, projectStatuses.length),
    }));

    const currentStageIndex = stages.findIndex(
      (stage) => stage.key === status?.toLowerCase()
    );

    return stages.map((stage, index) => ({
      ...stage,
      completed: index <= currentStageIndex,
      current: index === currentStageIndex,
    }));
  };

  const handleSave = () => {
    if (onUpdateData) {
      onUpdateData(editData);
    }
    setIsEditing(false);
  };
  const handleCancel = () => {
    // Reset to original data using the same structure as in useEffect
    setEditData({
      delivery_tracking_number: additionalData?.delivery_tracking_number ?? "",
      vendor_name: additionalData?.vendor_name ?? "",
      purchase_order_number: additionalData?.purchase_order_number ?? "",
      invoice_number: additionalData?.invoice_number ?? "",
      warranty_period: additionalData?.warranty_period ?? "",
      installation_date: additionalData?.installation_date ?? "",
      technician_name: additionalData?.technician_name ?? "",
      contact_person: additionalData?.contact_person ?? "",
      contact_phone: additionalData?.contact_phone ?? "",
      remarks: additionalData?.remarks ?? "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatValue = (value) => {
    return value && value.trim() !== "" ? value : "--";
  };

  const additionalFields = [
    { key: "delivery_tracking_number", label: "Tracking Number", type: "text" },
    { key: "vendor_name", label: "Vendor Name", type: "text" },
    { key: "purchase_order_number", label: "Purchase Order", type: "text" },
    { key: "invoice_number", label: "Invoice Number", type: "text" },
    { key: "warranty_period", label: "Warranty Period", type: "text" },
    { key: "installation_date", label: "Installation Date", type: "date" },
    { key: "technician_name", label: "Technician Name", type: "text" },
    { key: "contact_person", label: "Contact Person", type: "text" },
    { key: "contact_phone", label: "Contact Phone", type: "tel" },
    { key: "remarks", label: "Remarks", type: "textarea" },
  ];

  if (!isOpen) return null;

  const stages = getStatusStages();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky z-10 top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Timeline
            </h3>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit additional information"
                >
                  <Edit3 size={18} />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                    title="Save changes"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="Cancel editing"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Timeline Section */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Status Progress
            </h4>
            <div className="space-y-4 relative">
              {stages.map((stage, index) => {
                const IconComponent = stage.icon;
                return (
                  <div key={stage.key} className="relative">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          stage.completed
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                        }
                        ${stage.current ? "ring-2 ring-blue-500" : ""}
                      `}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`
                          text-sm font-medium
                          ${
                            stage.completed
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        `}
                        >
                          {stage.label}
                        </p>
                        {stage.current && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Connecting Line */}
                    {index < stages.length - 1 && (
                      <div
                        className={`
                        absolute left-4 w-0.5 h-6 mt-1
                        ${
                          stage.completed
                            ? "bg-green-300 dark:bg-green-600"
                            : "bg-gray-200 dark:bg-gray-600"
                        }
                      `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Date */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Expected Delivery Date
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {deliveryDate
                ? new Date(deliveryDate).toLocaleDateString()
                : "--"}
            </p>
          </div>

          {/* Additional Information Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Additional Information
              {isEditing && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                  (Editing Mode)
                </span>
              )}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.type === "textarea" ? (
                      <textarea
                        value={editData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 resize-none"
                        rows={3}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={editData[field.key] || ""}
                        onChange={(e) =>
                          handleInputChange(field.key, e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500">
                      <span
                        className={`${
                          formatValue(additionalData[field.key]) === "--"
                            ? "text-gray-400 dark:text-gray-500"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {field.type === "date" && additionalData[field.key]
                          ? new Date(
                              additionalData[field.key]
                            ).toLocaleDateString()
                          : formatValue(additionalData[field.key])}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                           bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white 
                           bg-blue-600 hover:bg-blue-700 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
