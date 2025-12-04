import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Calendar,
  DollarSign,
  Upload,
  CheckCircle,
  Image as ImageIcon,
  Eye,
  Edit2,
  Save,
  X as XIcon,
  Info,
} from "lucide-react";
import {
  normalizeDispatch,
  getTotalComponentCount,
  getInstalledComponentCount,
  getDispatchStatusDisplay,
  getDispatchStatusColor,
  getAvailableNextStatuses,
  getDispatchStatusOrder,
  DISPATCH_STATUS_ENUM,
} from "../../../utils/dispatchUtils";

const DispatchDetailsRow = ({
  school,
  onUploadDeliveryProof,
  onUploadInstallationProof,
  isExpanded,
  onToggle,
  uploadingDelivery,
  uploadingInstallation,
  editingDispatch,
  onEditStart,
  onEditSave,
  onEditCancel,
  editFormData,
  onEditChange,
  onInfoClick,
}) => {
  if (!school.dispatches || school.dispatches.length === 0) {
    return {
      summary: (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          No dispatches yet
        </div>
      ),
      expanded: null,
      isExpanded: false,
    };
  }

  const handleDeliveryProofUpload = async (dispatchId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Upload each selected file sequentially to preserve ordering
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      await onUploadDeliveryProof(school.id, dispatchId, file);
    }

    // Reset input so the same file(s) can be selected again if needed
    e.target.value = "";
  };

  const handleInstallationProofUpload = async (dispatchId, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Upload each selected file sequentially to preserve ordering
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      await onUploadInstallationProof(school.id, dispatchId, file);
    }

    // Reset input
    e.target.value = "";
  };

  // Calculate counts using utility functions
  const dispatchedCount = getTotalComponentCount(school.dispatches);
  const installedCount = getInstalledComponentCount(school.dispatches);

  return {
    summary: (
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 hover:bg-purple-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {dispatchedCount} Component{dispatchedCount !== 1 ? "s" : ""}{" "}
              Dispatched
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {installedCount} Installed
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
    ),
    expanded: isExpanded ? (
      <div
        className="p-4 bg-gray-50 dark:bg-gray-800/30"
        style={{ display: "grid" }}
      >
        <style>{`
          .dispatch-scroll-container::-webkit-scrollbar {
            height: 8px;
          }
          .dispatch-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .dispatch-scroll-container::-webkit-scrollbar-thumb {
            background-color: #9CA3AF;
            border-radius: 4px;
          }
          .dispatch-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #6B7280;
          }
          .dark .dispatch-scroll-container::-webkit-scrollbar-thumb {
            background-color: #4B5563;
          }
          .dark .dispatch-scroll-container::-webkit-scrollbar-thumb:hover {
            background-color: #6B7280;
          }
          @supports (scrollbar-width: thin) {
            .dispatch-scroll-container {
              scrollbar-width: thin;
              scrollbar-color: #9CA3AF transparent;
            }
          }
        `}</style>
        <div className="flex flex-row gap-4 overflow-x-auto overflow-y-hidden pb-2 dispatch-scroll-container">
          {school.dispatches.map((dispatch) => {
            // Normalize dispatch to support both new and legacy formats
            const normalizedDispatch = normalizeDispatch(dispatch);
            const components = normalizedDispatch.components || [];

            // Check if uploads are enabled (status must be "delivered" or above)
            const currentStatus =
              editingDispatch === dispatch.id
                ? editFormData.dispatch_status || dispatch.dispatch_status
                : dispatch.dispatch_status;
            const deliveredOrder = getDispatchStatusOrder(
              DISPATCH_STATUS_ENUM.DELIVERED
            );
            const currentStatusOrder = getDispatchStatusOrder(
              currentStatus || DISPATCH_STATUS_ENUM.PENDING_DISPATCH
            );
            const canUploadProofs = currentStatusOrder >= deliveredOrder;

            // Normalize proof fields to arrays for multi-proof support
            const deliveryProofUrls = Array.isArray(
              dispatch.delivery_proof_urls
            )
              ? dispatch.delivery_proof_urls
              : dispatch.delivery_proof_url
              ? [dispatch.delivery_proof_url]
              : [];

            const installationProofUrls = Array.isArray(
              dispatch.installation_proof_urls
            )
              ? dispatch.installation_proof_urls
              : dispatch.installation_proof_url
              ? [dispatch.installation_proof_url]
              : [];

            return (
              <div
                key={dispatch.id}
                className="flex-shrink-0 w-[360px] bg-white dark:bg-gray-800 rounded-lg p-3 space-y-3 border border-gray-200 dark:border-gray-900 shadow-sm"
              >
                {/* Dispatch Header */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Dispatch #{dispatch.dispatch_no}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {components.length} Component
                      {components.length !== 1 ? "s" : ""}
                      {dispatch.dispatch_date && ` • ${dispatch.dispatch_date}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInfoClick(dispatch)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="View details"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    {editingDispatch === dispatch.id ? (
                      <>
                        <button
                          onClick={() => onEditSave(school.id, dispatch.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={onEditCancel}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Cancel"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onEditStart(dispatch)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                        title="Edit status"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Components List - Chips */}
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Components ({components.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {components.map((comp, compIndex) => {
                      // Handle both new format (string) and legacy format (object)
                      const componentName =
                        typeof comp === "string"
                          ? comp
                          : comp.component_name || comp.component || "Unknown";
                      return (
                        <span
                          key={compIndex}
                          className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                        >
                          {componentName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Status Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Dispatch Status
                    </span>
                    {editingDispatch === dispatch.id ? (
                      <>
                        <select
                          value={
                            editFormData.dispatch_status ||
                            dispatch.dispatch_status ||
                            "pending_dispatch"
                          }
                          onChange={(e) =>
                            onEditChange("dispatch_status", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          {getAvailableNextStatuses(
                            dispatch.dispatch_status || "pending_dispatch",
                            dispatch
                          ).map((status) => (
                            <option key={status} value={status}>
                              {getDispatchStatusDisplay(status)}
                            </option>
                          ))}
                        </select>
                        {/* Show error message if status requires proof but proof isn't uploaded */}
                        {editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.DELIVERED &&
                          !dispatch.delivery_proof_url && (
                            <p className="text-xs text-red-500 mt-1 font-medium">
                              ⚠️ Please upload delivery proof before saving this
                              status
                            </p>
                          )}
                        {editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.INSTALLED && (
                          <>
                            {!dispatch.delivery_proof_url && (
                              <p className="text-xs text-red-500 mt-1 font-medium">
                                ⚠️ Please upload delivery proof before saving
                                this status
                              </p>
                            )}
                            {!dispatch.installation_proof_url && (
                              <p className="text-xs text-red-500 mt-1 font-medium">
                                ⚠️ Please upload installation proof before
                                saving this status
                              </p>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDispatchStatusColor(
                          dispatch.dispatch_status
                        )}`}
                      >
                        {getDispatchStatusDisplay(dispatch.dispatch_status)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Proof Section */}
                <div
                  className={`border-t pt-2 ${
                    editingDispatch === dispatch.id &&
                    (editFormData.dispatch_status ===
                      DISPATCH_STATUS_ENUM.DELIVERED ||
                      dispatch.dispatch_status ===
                        DISPATCH_STATUS_ENUM.DELIVERED ||
                      editFormData.dispatch_status ===
                        DISPATCH_STATUS_ENUM.INSTALLED ||
                      dispatch.dispatch_status ===
                        DISPATCH_STATUS_ENUM.INSTALLED) &&
                    !dispatch.delivery_proof_url
                      ? "border-red-300 dark:border-red-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-medium ${
                        editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.DELIVERED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.DELIVERED ||
                          editFormData.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED) &&
                        !dispatch.delivery_proof_url
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Delivery Proof
                      {editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.DELIVERED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.DELIVERED ||
                          editFormData.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED) &&
                        !dispatch.delivery_proof_url && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                    </span>
                    {deliveryProofUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {deliveryProofUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full"
                          >
                            <Eye className="h-3 w-3" />
                            <span>File {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <label
                        htmlFor={`delivery-${dispatch.id}`}
                        className={`flex items-center gap-1 text-xs ${
                          !canUploadProofs || uploadingDelivery === dispatch.id
                            ? "text-gray-400 cursor-not-allowed"
                            : editingDispatch === dispatch.id &&
                              (editFormData.dispatch_status ===
                                DISPATCH_STATUS_ENUM.DELIVERED ||
                                dispatch.dispatch_status ===
                                  DISPATCH_STATUS_ENUM.DELIVERED ||
                                editFormData.dispatch_status ===
                                  DISPATCH_STATUS_ENUM.INSTALLED ||
                                dispatch.dispatch_status ===
                                  DISPATCH_STATUS_ENUM.INSTALLED) &&
                              !dispatch.delivery_proof_url
                            ? "text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
                            : "text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        }`}
                      >
                        <Upload className="h-3 w-3" />
                        {uploadingDelivery === dispatch.id
                          ? "Uploading..."
                          : !canUploadProofs
                          ? "Upload"
                          : deliveryProofUrls.length > 0
                          ? "Add More"
                          : "Upload"}
                      </label>
                    )}
                    <input
                      type="file"
                      id={`delivery-${dispatch.id}`}
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) =>
                        handleDeliveryProofUpload(dispatch.id, e)
                      }
                      className="hidden"
                      disabled={
                        !canUploadProofs || uploadingDelivery === dispatch.id
                      }
                    />
                  </div>
                  {deliveryProofUrls.length === 0 && (
                    <p
                      className={`text-xs italic ${
                        editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.DELIVERED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.DELIVERED ||
                          editFormData.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED)
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      No proof uploaded yet
                    </p>
                  )}
                </div>

                {/* Installation Proof Section */}
                <div
                  className={`border-t pt-2 ${
                    editingDispatch === dispatch.id &&
                    (editFormData.dispatch_status ===
                      DISPATCH_STATUS_ENUM.INSTALLED ||
                      dispatch.dispatch_status ===
                        DISPATCH_STATUS_ENUM.INSTALLED) &&
                    !dispatch.installation_proof_url
                      ? "border-red-300 dark:border-red-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-medium ${
                        editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED) &&
                        !dispatch.installation_proof_url
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Installation Proof
                      {editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED) &&
                        !dispatch.installation_proof_url && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                    </span>
                    {installationProofUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {installationProofUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full"
                          >
                            <Eye className="h-3 w-3" />
                            <span>File {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <label
                        htmlFor={`installation-${dispatch.id}`}
                        className={`flex items-center gap-1 text-xs ${
                          !canUploadProofs ||
                          uploadingInstallation === dispatch.id ||
                          deliveryProofUrls.length === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : editingDispatch === dispatch.id &&
                              (editFormData.dispatch_status ===
                                DISPATCH_STATUS_ENUM.INSTALLED ||
                                dispatch.dispatch_status ===
                                  DISPATCH_STATUS_ENUM.INSTALLED) &&
                              !dispatch.installation_proof_url
                            ? "text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
                            : "text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                        }`}
                      >
                        <Upload className="h-3 w-3" />
                        {uploadingInstallation === dispatch.id
                          ? "Uploading..."
                          : !canUploadProofs
                          ? "Upload"
                          : deliveryProofUrls.length === 0
                          ? "Upload (Delivery proof required first)"
                          : "Upload"}
                      </label>
                    )}
                    <input
                      type="file"
                      id={`installation-${dispatch.id}`}
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) =>
                        handleInstallationProofUpload(dispatch.id, e)
                      }
                      className="hidden"
                      disabled={
                        !canUploadProofs ||
                        uploadingInstallation === dispatch.id ||
                        deliveryProofUrls.length === 0
                      }
                    />
                  </div>
                  {installationProofUrls.length === 0 && (
                    <p
                      className={`text-xs italic ${
                        editingDispatch === dispatch.id &&
                        (editFormData.dispatch_status ===
                          DISPATCH_STATUS_ENUM.INSTALLED ||
                          dispatch.dispatch_status ===
                            DISPATCH_STATUS_ENUM.INSTALLED)
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {deliveryProofUrls.length > 0
                        ? "No proof uploaded yet"
                        : "Upload delivery proof first"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null,
    isExpanded,
  };
};

export default DispatchDetailsRow;
