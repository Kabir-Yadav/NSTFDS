import { useState } from "react";
import { CheckCircle, LucidePencil, Eye, Upload } from "lucide-react";

const TableBody = ({
  parsedData,
  selectedProject,
  setEditingRowIndex,
  editingRowIndex,
  handleCellChange,
  statusOptions,
}) => {
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

    return (
      <input
        type={type}
        value={localValue || ""}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full bg-transparent border-b border-transparent focus:border-purple-500 focus:outline-none"
      />
    );
  };
  return (
    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
      {parsedData.map((row, index) => (
        <tr
          key={index}
          className={`
            ${
              editingRowIndex === index
                ? "bg-purple-50 dark:bg-purple-900/20"
                : index % 2 === 0
                ? "bg-white dark:bg-gray-900"
                : "bg-gray-50 dark:bg-gray-800/50"
            }
            transition-colors duration-200
            `}
        >
          {" "}
          <td className="px-6 py-4 whitespace-nowrap text-sm bg-[var(--color-surface-secondary)]">
            <button
              onClick={() =>
                setEditingRowIndex(editingRowIndex === index ? null : index)
              }
              className={`text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 ${
                editingRowIndex === index
                  ? "text-purple-600 dark:text-purple-300"
                  : ""
              }`}
            >
              {editingRowIndex === index ? (
                <CheckCircle size={20} />
              ) : (
                <LucidePencil size={16} />
              )}
            </button>
          </td>
          {/* ID */}
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
            {index + 1}
          </td>
          {/* Required Fields */}
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Committed_Date}
                rowIndex={index}
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
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Target_Date}
                rowIndex={index}
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
            {editingRowIndex === index ? (
              <EditableCell value={row.State} rowIndex={index} field="State" />
            ) : (
              row.State
            )}
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <EditableCell
                value={row.District}
                rowIndex={index}
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
            {editingRowIndex === index ? (
              <EditableCell value={row.Block} rowIndex={index} field="Block" />
            ) : (
              row.Block
            )}
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <EditableCell
                value={row.School}
                rowIndex={index}
                field="School"
              />
            ) : (
              row.School
            )}
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <select
                value={row.Status}
                onChange={(e) =>
                  handleCellChange(index, "Status", e.target.value)
                }
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm"
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
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Quantity}
                rowIndex={index}
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
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Unit_Cost}
                rowIndex={index}
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
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Total_Cost}
                rowIndex={index}
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
              {editingRowIndex === index ? (
                <EditableCell
                  value={row.Item_Type}
                  rowIndex={index}
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
              {editingRowIndex === index && shouldShowUpload(row) && (
                <div className="flex items-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      handleCellChange(index, "Stage1_proof", e.target.files[0])
                    }
                    className="hidden"
                    id={`stage1-${index}`}
                  />
                  <label
                    htmlFor={`stage1-${index}`}
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
              {editingRowIndex === index && shouldShowStage2Upload(row) && (
                <div className="flex items-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      handleCellChange(index, "Stage2_proof", e.target.files[0])
                    }
                    className="hidden"
                    id={`stage2-${index}`}
                  />
                  <label
                    htmlFor={`stage2-${index}`}
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
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Completion_Certificate}
                rowIndex={index}
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
            className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "200px", maxWidth: "300px" }}
          >
            <div className="max-h-40 overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
              {editingRowIndex === index ? (
                <EditableCell
                  value={row.Extras}
                  rowIndex={index}
                  field="Extras"
                />
              ) : row.Extras ? (
                (() => {
                  try {
                    const parsed = JSON.parse(row.Extras);
                    return Object.entries(parsed)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join("\n");
                  } catch (e) {
                    console.error("Invalid JSON:", e);
                    return "--";
                  }
                })()
              ) : (
                "--"
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
