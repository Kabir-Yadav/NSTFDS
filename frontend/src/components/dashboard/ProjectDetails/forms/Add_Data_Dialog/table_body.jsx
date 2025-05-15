import { useState } from "react";
import { CheckCircle, LucidePencil } from "lucide-react";

const TableBody = ({
  parsedData,
  selectedProject,
  setEditingRowIndex,
  editingRowIndex,
  handleCellChange,
}) => {
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
      {parsedData.slice(0, 10).map((row, index) => (
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
          <td className="px-6 py-4 whitespace-nowrap text-sm bg-[var(--color-surface-secondary)]">
            <button
              onClick={() =>
                setEditingRowIndex(editingRowIndex === index ? null : index)
              }
              className={`
                
                text-gray-500 hover:text-purple-600 
                dark:text-gray-400 dark:hover:text-purple-400
                ${
                  editingRowIndex === index
                    ? "text-purple-600 dark:text-purple-300"
                    : ""
                }
                `}
            >
              {editingRowIndex === index ? (
                <CheckCircle size={20} />
              ) : (
                <LucidePencil size={16} />
              )}
            </button>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
            {index + 1}
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Delivery_Date}
                rowIndex={index}
                field="Delivery_Date"
                type="date"
              />
            ) : (
              new Date(row.Delivery_Date).toLocaleDateString()
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
            {editingRowIndex == index ? (
              <EditableCell
                value={row.District}
                rowIndex={index}
                field={"District"}
              />
            ) : (
              row.District
            )}
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex == index ? (
              <EditableCell
                value={row.School}
                rowIndex={index}
                field={"School"}
              />
            ) : (
              row.School
            )}
          </td>
          {selectedProject?.name === "Digital Device Procurement" && (
            <td
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              style={{ minWidth: "120px" }}
            >
              {editingRowIndex == index ? (
                <EditableCell
                  value={row.Category}
                  rowIndex={index}
                  field={"Category"}
                />
              ) : (
                row.Category
              )}
            </td>
          )}
          <td
            className="px-6 py-4 whitespace-nowrap text-sm"
            style={{ minWidth: "120px" }}
          >
            <span
              className={`
                inline-flex
                px-3 py-1
                text-xs leading-5 font-semibold
                rounded-full
                ${
                  row.Status.toLowerCase() === "shipped"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : row.Status.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : row.Status.toLowerCase() === "just deployed"
                    ? "bg-teal-300 text-teal-800 dark:bg-teal-600 dark:text-teal-200"
                    : row.Status.toLowerCase() === "arrived"
                    ? "bg-green-200 text-green-800 dark:bg-green-600 dark:text-green-100"
                    : "bg-gray-700 text-green-800 dark:bg-gray-700 dark:text-green-100"
                }
                `}
            >
              {editingRowIndex === index ? (
                <EditableCell
                  value={row.Status}
                  rowIndex={index}
                  field="Status"
                />
              ) : (
                row.Status
              )}
            </span>
          </td>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
            style={{ minWidth: "120px" }}
          >
            {editingRowIndex === index ? (
              <EditableCell
                value={row.Cost}
                rowIndex={index}
                field="Cost"
                type="number"
              />
            ) : (
              `₹${row.Cost}`
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
