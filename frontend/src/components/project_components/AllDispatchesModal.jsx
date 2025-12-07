import React, { useState } from "react";
import {
  X,
  FileCheck,
  Package,
  FileText,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import {
  getDispatchStatusDisplay,
  getDispatchStatusColor,
} from "../../utils/dispatchUtils";

const AllDispatchesModal = ({ isOpen, onClose, dispatches, schoolName }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen) return null;

  // Helper function to determine if URL is an image or PDF
  const getFileType = (url) => {
    if (!url) return "unknown";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith(".pdf")) return "pdf";
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return "image";
    // Check if URL contains common image hosting patterns
    if (lowerUrl.includes("image") || lowerUrl.includes("img")) return "image";
    if (lowerUrl.includes("pdf")) return "pdf";
    return "unknown";
  };

  // Helper function to render proof file
  const renderProofFile = (url, index, type) => {
    const fileType = getFileType(url);

    if (fileType === "image") {
      return (
        <div
          key={index}
          className="relative group cursor-pointer"
          onClick={() => setSelectedImage(url)}
        >
          <img
            src={url}
            alt={`${type} proof ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-purple-500 transition-all"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded">
            {index + 1}
          </span>
        </div>
      );
    } else if (fileType === "pdf") {
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg hover:border-red-500 transition-all group"
        >
          <FileText className="h-8 w-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-900 dark:text-red-100">
              PDF Document {index + 1}
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-400 group-hover:underline">
              Click to open
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-red-600 dark:text-red-400" />
        </a>
      );
    } else {
      // Unknown file type - show generic link
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 transition-all group"
        >
          <FileCheck className="h-8 w-8 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
              File {index + 1}
            </p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 group-hover:underline">
              Click to open
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </a>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package className="h-6 w-6" />
              Dispatch Details
            </h2>
            <p className="mt-1 text-sm text-purple-100">
              {schoolName} • {dispatches?.length || 0} Dispatch
              {dispatches?.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {!dispatches || dispatches.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No dispatches found for this school.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dispatches.map((dispatch, index) => {
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

                const currentStatus =
                  dispatch.dispatch_status || "pending_dispatch";

                return (
                  <div
                    key={dispatch.id || index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    {/* Dispatch Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Dispatch #{dispatch.dispatch_no || dispatch.id}
                        </h3>
                        {dispatch.dispatch_date && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Date: {dispatch.dispatch_date}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getDispatchStatusColor(
                          currentStatus
                        )}`}
                      >
                        {getDispatchStatusDisplay(currentStatus)}
                      </span>
                    </div>

                    {/* Components */}
                    {dispatch.components && dispatch.components.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Components ({dispatch.components.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dispatch.components.map((comp, idx) => {
                            const componentName =
                              typeof comp === "string"
                                ? comp
                                : comp.component_name ||
                                  comp.component ||
                                  "Unknown";
                            return (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-medium"
                              >
                                {componentName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tracking Link */}
                    <div className="mb-4">
                      <div
                        className={`rounded-lg p-3 border transition-all ${
                          dispatch.tracking_url
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Tracking URL
                            </p>
                            <p
                              className={`text-sm font-semibold break-all ${
                                dispatch.tracking_url
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-400 dark:text-gray-500 italic"
                              }`}
                            >
                              {dispatch.tracking_url || "Not available"}
                            </p>
                          </div>
                          {dispatch.tracking_url ? (
                            dispatch.tracking_url ? (
                              <a
                                href={dispatch.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                              >
                                Track
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <button
                                onClick={() => {
                                  // Generic tracking search - can be customized per courier service
                                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                                    dispatch.tracking_number + " tracking"
                                  )}`;
                                  window.open(searchUrl, "_blank");
                                }}
                                className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                              >
                                Search
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )
                          ) : (
                            <button
                              disabled
                              className="flex-shrink-0 px-3 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed flex items-center gap-1"
                            >
                              Track
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Proof Documents */}
                    <div className="space-y-4">
                      {/* Delivery Proof */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Delivery Proof ({deliveryProofUrls.length})
                        </p>
                        {deliveryProofUrls.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {deliveryProofUrls.map((url, idx) =>
                              renderProofFile(url, idx, "delivery")
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">
                            No delivery proof uploaded
                          </p>
                        )}
                      </div>

                      {/* Installation Proof */}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          Installation Proof ({installationProofUrls.length})
                        </p>
                        {installationProofUrls.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {installationProofUrls.map((url, idx) =>
                              renderProofFile(url, idx, "installation")
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">
                            No installation proof uploaded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Vendor:
                          </span>
                          <p
                            className={`font-medium truncate ${
                              dispatch.vendor_name
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-400 dark:text-gray-500 italic"
                            }`}
                          >
                            {dispatch.vendor_name || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Expected Delivery:
                          </span>
                          <p
                            className={`font-medium ${
                              dispatch.expected_delivery_date
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-400 dark:text-gray-500 italic"
                            }`}
                          >
                            {dispatch.expected_delivery_date || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Proof preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              Open in New Tab
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDispatchesModal;
