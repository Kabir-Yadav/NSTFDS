import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { CheckCircle, LucidePencil, Eye, Upload, Trash2 } from "lucide-react";

const TableBody = ({
  parsedData,
  selectedProject,
  setEditingRowIndex,
  editingRowIndex,
  handleCellChange,
  statusOptions,
  handleDeleteRow,
  indexOfFirstRecord,
  totalDataLength,
}) => {
  const { isDarkMode } = useTheme();

  const getProofFileName = (proof) => {
    if (!proof) return null;
    try {
      // If it's a File object, use its name
      if (proof instanceof File) {
        const fileName = proof.name;
        return fileName.length > 20
          ? fileName.substring(0, 17) + "..."
          : fileName;
      }
      // If it's a URL string (for existing proofs)
      if (typeof proof === "string") {
        const fileName = decodeURIComponent(proof.split("/").pop());
        return fileName.length > 20
          ? fileName.substring(0, 17) + "..."
          : fileName;
      }
      return "View Proof";
    } catch (e) {
      return "View Proof";
    }
  };

  const shouldShowUpload = (row) => {
    const statusIndex = statusOptions.indexOf(row.Status);
    const totalStatuses = statusOptions.length;
    return statusIndex >= totalStatuses - 2; // Show for last two statuses
  };

  const shouldShowStage2Upload = (row) => {
    const statusIndex = statusOptions.indexOf(row.Status);
    const totalStatuses = statusOptions.length;
    return statusIndex === totalStatuses - 1; // Show only for last status
  };
  const EditableCell = ({ value, rowIndex, field, type = "text" }) => {
    const [localValue, setLocalValue] = useState(() => {
      if (type === "date" && !isNaN(new Date(value).getTime())) {
        return new Date(value).toISOString().split("T")[0];
      }
      return type === "date" ? null : value;
    });

    const handleBlur = () => {
      handleCellChange(rowIndex, field, localValue);
    };

    if (type === "textarea") {
      return (
        <textarea
          value={localValue || ""}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          rows={4}
          className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2  focus:border-purple-500 focus:outline-none resize-none text-base max-h-48 overflow-y-auto"
        />
      );
    }

    return (
      <input
        type={type}
        value={localValue || ""}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        style={{ colorScheme: isDarkMode ? "dark" : "light" }}
        className="w-full bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none"
      />
    );
  };
  // Calculate total number of columns (including conditional Item Type column)
  const totalColumns =
    17 + (selectedProject?.name === "Digital Device Procurement" ? 1 : 0);

  // Show empty state if no data at all (not just empty page)
  if (totalDataLength === 0) {
    return (
      <tbody className="bg-white dark:bg-gray-900">
        <tr>
          <td colSpan={totalColumns} className="px-6 py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                No records found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Upload a file or add entries to get started
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
      {parsedData.map((row, index) => {
        const actualIndex = indexOfFirstRecord + index;
        const isEditing = editingRowIndex === actualIndex;
        return (
          <tr
            key={actualIndex}
            className={`
            ${
              isEditing
                ? "bg-purple-50 dark:bg-purple-900/20"
                : actualIndex % 2 === 0
                ? "bg-white dark:bg-gray-900"
                : "bg-gray-50 dark:bg-gray-800/50"
            }
            transition-colors duration-200
            `}
          >
            {" "}
            <td className="px-6 py-4 whitespace-nowrap text-sm bg-[var(--color-surface-secondary)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setEditingRowIndex(isEditing ? null : actualIndex)
                  }
                  className={`text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 ${
                    isEditing ? "text-purple-600 dark:text-purple-300" : ""
                  }`}
                  title={isEditing ? "Save" : "Edit"}
                >
                  {isEditing ? (
                    <CheckCircle size={20} />
                  ) : (
                    <LucidePencil size={16} />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteRow(actualIndex)}
                  className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete row"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
            {/* ID */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
              {actualIndex + 1}
            </td>
            {/* Required Fields */}
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Committed_Date}
                  rowIndex={actualIndex}
                  field="Committed_Date"
                  type="date"
                />
              ) : (
                new Date(row.Committed_Date).toLocaleDateString()
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Target_Date}
                  rowIndex={actualIndex}
                  field="Target_Date"
                  type="date"
                />
              ) : (
                new Date(row.Target_Date).toLocaleDateString()
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.State}
                  rowIndex={actualIndex}
                  field="State"
                />
              ) : (
                row.State
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.District}
                  rowIndex={actualIndex}
                  field="District"
                />
              ) : (
                row.District
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Block}
                  rowIndex={actualIndex}
                  field="Block"
                />
              ) : (
                row.Block
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.School}
                  rowIndex={actualIndex}
                  field="School"
                />
              ) : (
                row.School
              )}
            </td>
            <td
              className="px-2 py-4 whitespace-nowrap text-sm"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <select
                  value={row.Status}
                  onChange={(e) =>
                    handleCellChange(actualIndex, "Status", e.target.value)
                  }
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm dark:text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`
                  inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full
                  ${(() => {
                    const statusIndex = statusOptions.indexOf(row.Status);
                    const totalStatuses = statusOptions.length;
                    if (statusIndex === 0) {
                      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                    } else if (statusIndex === totalStatuses - 1) {
                      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                    } else {
                      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                    }
                  })()}
                `}
                >
                  {row.Status}
                </span>
              )}
            </td>
            {/* Cost Related Fields */}
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Quantity}
                  rowIndex={actualIndex}
                  field="Quantity"
                  type="number"
                />
              ) : (
                row.Quantity
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Unit_Cost}
                  rowIndex={actualIndex}
                  field="Unit_Cost"
                  type="number"
                />
              ) : (
                `₹${row.Unit_Cost}`
              )}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Total_Cost}
                  rowIndex={actualIndex}
                  field="Total_Cost"
                  type="number"
                />
              ) : (
                `₹${row.Total_Cost}`
              )}
            </td>
            {/* Conditional Category */}
            {selectedProject?.name === "Digital Device Procurement" && (
              <td
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                style={{ minWidth: "120px" }}
              >
                {isEditing ? (
                  <EditableCell
                    value={row.Item_Type}
                    rowIndex={actualIndex}
                    field="Item_Type"
                  />
                ) : (
                  row.Item_Type
                )}
              </td>
            )}
            {/* Proofs and Documents */}{" "}
            <td
              className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "150px" }}
            >
              <div className="flex items-center gap-2">
                {" "}
                {row.Stage1_proof && (
                  <div className="flex items-center">
                    <div className="flex items-center p-1 text-blue-600">
                      <Eye size={16} className="mr-1" />
                      <span className="text-xs">
                        {getProofFileName(row.Stage1_proof)}
                      </span>
                    </div>
                  </div>
                )}
                {isEditing && shouldShowUpload(row) && (
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleCellChange(
                          actualIndex,
                          "Stage1_proof",
                          e.target.files[0]
                        )
                      }
                      className="hidden"
                      id={`stage1-${actualIndex}`}
                    />
                    <label
                      htmlFor={`stage1-${actualIndex}`}
                      className="cursor-pointer p-1 text-gray-600 hover:text-gray-800 flex items-center"
                      title="Upload proof"
                    >
                      <Upload size={16} />
                    </label>
                  </div>
                )}
              </div>
            </td>{" "}
            <td
              className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "150px" }}
            >
              <div className="flex items-center gap-2">
                {" "}
                {row.Stage2_proof && (
                  <div className="flex items-center">
                    <div className="flex items-center p-1 text-blue-600">
                      <Eye size={16} className="mr-1" />
                      <span className="text-xs">
                        {getProofFileName(row.Stage2_proof)}
                      </span>
                    </div>
                  </div>
                )}
                {isEditing && shouldShowStage2Upload(row) && (
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleCellChange(
                          actualIndex,
                          "Stage2_proof",
                          e.target.files[0]
                        )
                      }
                      className="hidden"
                      id={`stage2-${actualIndex}`}
                    />
                    <label
                      htmlFor={`stage2-${actualIndex}`}
                      className="cursor-pointer p-1 text-gray-600 hover:text-gray-800 flex items-center"
                      title="Upload proof"
                    >
                      <Upload size={16} />
                    </label>
                  </div>
                )}
              </div>
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Completion_Certificate}
                  rowIndex={actualIndex}
                  field="Certificate_Url"
                />
              ) : (
                row.Completion_Certificate && (
                  <a
                    href={row.Completion_Certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Certificate
                  </a>
                )
              )}
            </td>
            {/* Additional Information */}{" "}
            <td
              className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "300px", maxWidth: "450px" }}
            >
              {isEditing ? (
                <EditableCell
                  value={row.Extras}
                  rowIndex={actualIndex}
                  field="Extras"
                  type="textarea"
                />
              ) : (
                <div className="max-h-24 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words">
                  {row.Extras
                    ? (() => {
                        try {
                          const parsed = JSON.parse(row.Extras);
                          return Object.entries(parsed)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join("\n");
                        } catch (e) {
                          console.error("Invalid JSON:", e);
                          return row.Extras;
                        }
                      })()
                    : "--"}
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableBody;
