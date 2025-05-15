import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import TablePageNavButton from "../../../components/table_components/table_pageNav_button";

import {
  X,
  Upload,
  FileSpreadsheet,
  FilePlus,
  Loader,
  LucidePencil,
  AlertCircle,
} from "lucide-react";
import DeviceForm from "../device-form";
import SanitaryPadForm from "../sanitary-form";
import TableHeader from "./table_header";
import TableBody from "./table_body";
import DialogFooter from "./footer";
import { validateRow } from "./actions";

const EnhancedAddDataDialog = ({
  isOpen,
  onClose,
  selectedProject,
  data,
  categories,
  onSubmitSingle,
  onSubmitMultiple,
}) => {
  const [mode, setMode] = useState(null); // "single" or "multiple"
  const [parsedData, setParsedData] = useState([]);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(parsedData.length / recordsPerPage));
  // Reset form state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setMode(null);
      setParsedData([]);
      setIsPreviewReady(false);
      setHasErrors(false);
      setErrorMessages([]);
      setEditingRowIndex(null);
    }
  }, [isOpen]);

  // New function to handle cell value change
  const handleCellChange = (rowIndex, field, newValue) => {
    const updatedData = [...parsedData];
    const updatedRow = {
      ...updatedData[rowIndex],
      [field]: newValue,
    };

    // Validate the updated row
    updatedRow.errors = validateRow(updatedRow, selectedProject, categories);

    // Update the parsed data
    updatedData[rowIndex] = updatedRow;
    setParsedData(updatedData);

    // Revalidate all rows and update error messages
    const allErrors = [];
    updatedData.forEach((row, index) => {
      if (row.errors && row.errors.length > 0) {
        allErrors.push(`Row ${index + 1}: ${row.errors.join(", ")}`);
      }
    });

    setErrorMessages(allErrors);
    setHasErrors(allErrors.length > 0);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    console.log("File added");
    // Check file type
    if (file.name.endsWith(".csv")) {
      console.log("Processing CSV");

      processCSV(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      console.log("Processing Xls");
      processExcel(file);
    } else {
      setErrorMessages(["Only CSV and Excel files are supported"]);
      setHasErrors(true);
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(results);
        validateAndPreviewData(results.data);
      },
      error: (error) => {
        setErrorMessages([`Error parsing CSV: ${error.message}`]);
        setHasErrors(true);
        setIsProcessing(false);
      },
    });
  };

  const processExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData);
        validateAndPreviewData(jsonData);
      } catch (error) {
        setErrorMessages([`Error parsing Excel file: ${error.message}`]);
        setHasErrors(true);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateAndPreviewData = (data) => {
    const errors = [];
    const allData = [];

    // Validate each row
    data.forEach((row, index) => {
      const normalizedRow = { ...row, errors: [] };

      // Validate the row
      normalizedRow.errors = validateRow(
        normalizedRow,
        selectedProject,
        categories
      );

      allData.push(normalizedRow);

      if (normalizedRow.errors.length > 0) {
        errors.push({ row: index + 1, errors: normalizedRow.errors });
      }
    });

    setParsedData(allData);
    setIsPreviewReady(true);
    setIsProcessing(false);

    if (errors.length > 0) {
      setHasErrors(true);
      setErrorMessages(
        errors.map((err) => `Row ${err.row}: ${err.errors.join(", ")}`)
      );
    } else {
      setHasErrors(false);
      setErrorMessages([]);
    }
  };

  const handleSubmitMultiple = () => {
    if (parsedData.length > 0) {
      onSubmitMultiple(parsedData);
      onClose();
    }
  };

  const sampleCSV = () => {
    const headers = [
      "ID",
      "Delivery_Date",
      "State",
      "District",
      "School",
      "PSU",
      ...(selectedProject?.name === "Digital Device Procurement"
        ? ["Category"]
        : []),
      "Status",
      "Cost",
    ];

    const exampleRow = [
      "112", // Example ID
      new Date().toLocaleDateString(), // Example Date
      "Example State", // Example State
      "Example District", // Example District
      "Example School", // Example School
      "BPCL", // Example PSU
      ...(selectedProject?.name === "Digital Device Procurement"
        ? ["Example Category"] // Example Category
        : []),
      "Pending", // Example Status
      "1000", // Example Cost
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), exampleRow.join(",")].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedProject?.name || "Procurement"}SampleFormat.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openForm = (selectedProject) => {
    if (selectedProject?.name === "Digital Device Procurement") {
      return (
        <DeviceForm
          isOpen={true}
          data={data}
          categories={categories}
          onClose={() => {
            setMode(null); // Reset mode when form is closed
            onClose(); // Close the dialog
          }}
        />
      );
    } else if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
      return (
        <SanitaryPadForm
          isOpen={true}
          data={data}
          onClose={() => {
            setMode(null); // Reset mode when form is closed
            onClose(); // Close the dialog
          }}
        />
      );
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 max-h-4xl">
        <div className="w-full max-w-2xl md:max-w-3xl max-h-[80%] flex flex-col rounded-xl shadow-xl bg-[var(--color-surface-secondary)]">
          {/* Render Form or Dialog Content */}
          {mode === "single" ? (
            openForm(selectedProject)
          ) : (
            <>
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {mode === null && "Add Data"}
                  {mode === "multiple" && "Add Multiple Entries"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="flex-grow overflow-auto p-6">
                {/* Initial Mode Selection */}
                {mode === null && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                      onClick={() => setMode("single")}
                      className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-lg hover:border-purple-500 bg-[var(--color-surface-hover)] dark:border-gray-600 dark:hover:border-purple-400"
                    >
                      <FilePlus
                        size={48}
                        className="mb-4 text-purple-600 dark:text-purple-400"
                      />
                      <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        Add Single Entry
                      </span>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Add one entry at a time manually
                      </p>
                    </button>

                    <button
                      onClick={() => setMode("multiple")}
                      className="flex flex-col items-center justify-center p-8  border-2 border-gray-200 rounded-lg hover:border-purple-500 bg-[var(--color-surface-hover)] dark:border-gray-600 dark:hover:border-purple-400"
                    >
                      <FileSpreadsheet
                        size={48}
                        className="mb-4 text-purple-600 dark:text-purple-400"
                      />
                      <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                        Add Multiple Entries
                      </span>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Upload CSV or Excel file with multiple entries
                      </p>
                    </button>
                  </div>
                )}

                {/* Multiple Entry Upload */}
                {mode === "multiple" && !isPreviewReady && (
                  <div className="p-4">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 dark:bg-blue-900/30">
                      <div className="flex items-center">
                        <AlertCircle
                          className="mr-3 text-blue-600 dark:text-blue-400"
                          size={24}
                        />
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          Ensure your uploaded file follows the correct format.
                          For sample table format click{" "}
                          <a
                            onClick={sampleCSV}
                            className="text-purple-600 underline cursor-pointer hover:text-purple-800"
                          >
                            link
                          </a>
                        </p>
                      </div>
                    </div>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20"
                          : "border-gray-300 hover:border-purple-400 dark:border-gray-600 dark:hover:border-purple-500"
                      }`}
                    >
                      <input {...getInputProps()} />

                      {isProcessing ? (
                        <div className="flex flex-col items-center justify-center">
                          <Loader
                            size={48}
                            className="text-purple-600 dark:text-purple-400 animate-spin"
                          />
                          <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Processing file...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload
                            size={48}
                            className="text-purple-600 dark:text-purple-400"
                          />
                          <p className="mt-4 text-gray-600 dark:text-gray-400">
                            {isDragActive
                              ? "Drop the file here ..."
                              : "Drag & drop a CSV or Excel file here, or click to select one"}
                          </p>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Supported formats: .csv, .xlsx, .xls
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview Table for Multiple Entries */}
                {mode === "multiple" && isPreviewReady && (
                  <div>
                    <h3 className="mb-3 text-lg font-medium text-gray-800 dark:text-gray-200">
                      Preview ({parsedData.length} entries)
                    </h3>
                    {hasErrors && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                        <h3 className="text-red-700 font-medium mb-2 dark:text-red-400">
                          Error Processing File
                        </h3>
                        <ul className="text-sm text-red-600 list-disc pl-5 dark:text-red-300">
                          {errorMessages.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {errorMessages.length > 5 && (
                            <li>
                              ...and {errorMessages.length - 5} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <div className="overflow-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <TableHeader selectedProject={selectedProject} />
                        <TableBody
                          selectedProject={selectedProject}
                          parsedData={parsedData}
                          setEditingRowIndex={setEditingRowIndex}
                          editingRowIndex={editingRowIndex}
                          handleCellChange={handleCellChange}
                        />
                      </table>
                    </div>

                    {totalPages > recordsPerPage && (
                      <TablePageNavButton
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Dialog Footer */}
              <DialogFooter
                onClose={onClose}
                handleSubmitMultiple={handleSubmitMultiple}
                mode={mode}
                isPreviewReady={isPreviewReady}
                parsedData={parsedData}
                hasError={hasErrors}
              />
            </>
          )}
        </div>
      </div>
    )
  );
};

export default EnhancedAddDataDialog;
