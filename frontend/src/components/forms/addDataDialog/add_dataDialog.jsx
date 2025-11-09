import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  uploadProofImage,
  insertProjectDeliveries,
} from "../../../action/supabase_actions";
import TablePageNavButton from "../../table_components/table_pageNav_button";

import {
  X,
  Upload,
  FileSpreadsheet,
  FilePlus,
  Loader,
  AlertCircle,
} from "lucide-react";
import TableHeader from "./table_header";
import TableBody from "./table_body";
import DialogFooter from "./footer";
import { validateRow } from "./actions";
import AddSingleDataForm from "./add_single_data_form";

const EnhancedAddDataDialog = ({
  psuName,
  isOpen,
  onClose,
  selectedProject,
  psuList,
  hierarchicalData,
  status,
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
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = parsedData.slice(indexOfFirstRecord, indexOfLastRecord);

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
    let updatedRow = {
      ...updatedData[rowIndex],
      [field]: newValue,
    };

    // Only add this logic when changing Status
    if (field === "Status") {
      const totalStatuses = status.length;
      const newStatusIndex = status.indexOf(newValue);

      // If not second last or last status, clear both proofs
      if (newStatusIndex < totalStatuses - 2) {
        updatedRow.Stage1_proof = null;
        updatedRow.Stage2_proof = null;
      }
      // If second last status, keep Stage1_proof, clear Stage2_proof
      else if (newStatusIndex === totalStatuses - 2) {
        // Keep Stage1_proof as is
        updatedRow.Stage2_proof = null;
      }
      // If last status, keep both proofs as is (do nothing)
    }

    // Validate the updated row
    updatedRow.errors = validateRow(
      updatedRow,
      selectedProject,
      categories,
      status
    );

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

  // Function to handle row deletion
  const handleDeleteRow = (rowIndex) => {
    const updatedData = parsedData.filter((_, index) => index !== rowIndex);
    setParsedData(updatedData);

    // Reset editing if the deleted row was being edited
    if (editingRowIndex === rowIndex) {
      setEditingRowIndex(null);
    } else if (editingRowIndex > rowIndex) {
      // Adjust editing index if a row before the edited row was deleted
      setEditingRowIndex(editingRowIndex - 1);
    }

    // Revalidate remaining rows and update error messages
    const allErrors = [];
    updatedData.forEach((row, index) => {
      if (row.errors && row.errors.length > 0) {
        allErrors.push(`Row ${index + 1}: ${row.errors.join(", ")}`);
      }
    });

    setErrorMessages(allErrors);
    setHasErrors(allErrors.length > 0);

    // Adjust current page if needed (if last item on last page is deleted)
    const newTotalPages = Math.max(
      1,
      Math.ceil(updatedData.length / recordsPerPage)
    );
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    // Check file type
    if (file.name.endsWith(".csv")) {
      processCSV(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
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
        categories,
        status
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
  const handleSubmitMultiple = async () => {
    // Check for any rows that have validation errors
    const hasValidationErrors = parsedData.some(
      (row) => row.errors && row.errors.length > 0
    );

    // Check for any rows that need proofs based on status
    const hasProofErrors = parsedData.some((row) => {
      const statusIndex = status.indexOf(row.Status);
      const totalStatuses = status.length;

      if (statusIndex === totalStatuses - 2) {
        return !row.Stage1_proof;
      }
      if (statusIndex === totalStatuses - 1) {
        return !row.Stage1_proof || !row.Stage2_proof;
      }
      return false;
    });

    if (hasValidationErrors || hasProofErrors) {
      setHasErrors(true);
      setErrorMessages([
        ...errorMessages,
        "Please ensure all required proofs are uploaded based on status",
      ]);
      return;
    }

    if (parsedData.length > 0) {
      setIsProcessing(true);
      try {
        // Process each row and upload proofs if they exist
        const processedData = await Promise.all(
          parsedData.map(async (row) => {
            const processedRow = { ...row };

            // Upload Stage1 proof if it's a File
            if (row.Stage1_proof instanceof File) {
              const stage1Url = await uploadProofImage({
                file: row.Stage1_proof,
                projectName: selectedProject,
              });
              processedRow.Stage1_proof = stage1Url;
            }

            // Upload Stage2 proof if it's a File
            if (row.Stage2_proof instanceof File) {
              const stage2Url = await uploadProofImage({
                file: row.Stage2_proof,
                projectName: selectedProject,
              });
              processedRow.Stage2_proof = stage2Url;
            }

            // Format the data for database
            return {
              psu_name: psuName,
              project_name: selectedProject,
              state: processedRow.State,
              district: processedRow.District,
              block: processedRow.Block || null,
              school_name: processedRow.School,
              item_type: processedRow.Item_Type,
              quantity: Number(processedRow.Quantity) || 0,
              unit_cost: Number(processedRow.Unit_Cost) || 0,
              total_cost: Number(processedRow.Total_Cost) || 0,
              committed_date: processedRow.Committed_Date,
              target_date: processedRow.Target_Date,
              status: processedRow.Status,
              stage1_proof_url: processedRow.Stage1_proof || null,
              stage2_proof_url: processedRow.Stage2_proof || null,
              completion_certificate_url:
                processedRow.Completion_Certificate || null,
              extra_json: processedRow.Extras
                ? JSON.parse(processedRow.Extras)
                : {},
            };
          })
        );

        // Insert all records into the database
        const { data, error } = await insertProjectDeliveries(processedData);

        if (error) {
          throw new Error(error.message);
        }

        onSubmitMultiple(data); // data = array of DB-inserted rows (with IDs)
        console.log(processedData);
        onClose();
      } catch (error) {
        console.error("Error processing data:", error);
        setHasErrors(true);
        setErrorMessages([
          ...errorMessages,
          `Error submitting data: ${error.message}`,
        ]);
      } finally {
        setIsProcessing(false);
      }
    }
  };
  const sampleCSV = () => {
    // Helper function to properly escape CSV fields
    const escapeCSVField = (field) => {
      if (field === null || field === undefined) return "";
      const fieldStr = String(field);
      // If field contains comma, quote, or newline, wrap in quotes and escape quotes
      if (
        fieldStr.includes(",") ||
        fieldStr.includes('"') ||
        fieldStr.includes("\n")
      ) {
        return `"${fieldStr.replace(/"/g, '""')}"`;
      }
      return fieldStr;
    };

    const headers = [
      "ID",
      // Required fields
      "Commited_Date",
      "Target_Date",
      "State",
      "District",
      "Block",
      "School",
      "Status",
      "Quantity",
      "Unit_Cost",
      "Total_Cost",
      ...(categories?.length > 0 ? ["Item_Type"] : []),
      // Optional proofs
      "Stage1_proof",
      "Stage2_proof",
      "Completion_Certificate",
      // Optional notes
      "Extras",
    ];

    const today = new Date();
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);

    const exampleRow = [
      "122",
      // Required fields
      today.toISOString().split("T")[0], // Committed Date
      targetDate.toISOString().split("T")[0], // Target Date
      "Maharashtra", // State
      "Mumbai", // District
      "Delhi Public School", // School
      "Block A", // Block
      status?.[0] || "Pending", // Status
      "100", // Quantity
      "1000", // Unit Cost
      "100000", // Total Cost
      ...(categories?.length > 0 ? [categories[0]] : []), // Item Type if applicable
      // Optional proofs
      "https://example.com/stage1.pdf", // Stage 1 proof
      "https://example.com/stage2.pdf", // Stage 2 proof
      "https://example.com/cert.pdf", // Certificate URL
      // Optional notes
      '{"tracking_id": "DEL123456", "courier_name": "Express Delivery", "expected_date": "2025-07-01","invoice_number":"122312312", "installation_date": "2025-07-15", "warranty_period": "2 years", "notes": "Special handling required, fragile items included"}', // Extras (JSON format with sample fields)
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), exampleRow.map(escapeCSVField).join(",")].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedProject || "Procurement"}SampleFormat.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openForm = (selectedProject) => {
    return (
      <AddSingleDataForm
        projectName={selectedProject}
        isOpen={true}
        psuList={psuList}
        hierarchicalData={hierarchicalData}
        categories={categories}
        status={status}
        onClose={() => {
          setMode(null); // Reset mode when form is closed
          onClose(); // Close the dialog
        }}
        onSubmitSingle={onSubmitSingle}
        psu_name={psuName}
      />
    );
  };

  // Determine dialog width based on mode and file state
  const getDialogWidthClass = () => {
    if (mode === null) {
      // Initial state with 2 buttons - smaller width
      return "w-full max-w-2xl";
    } else if (mode === "multiple" && isPreviewReady) {
      // File dropped and preview ready - larger width for content viewing
      return "w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw]";
    } else if (mode === "multiple" && !isPreviewReady) {
      // Multiple mode but no file yet - medium width
      return "w-full max-w-3xl";
    }
    // Default fallback
    return "w-full max-w-2xl";
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 max-h-4xl">
        <div
          className={`${getDialogWidthClass()} max-h-[90%] flex flex-col rounded-xl shadow-xl bg-[var(--color-surface-secondary)]`}
        >
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
                          parsedData={paginatedData}
                          setEditingRowIndex={setEditingRowIndex}
                          editingRowIndex={editingRowIndex}
                          handleCellChange={handleCellChange}
                          statusOptions={status}
                          handleDeleteRow={handleDeleteRow}
                          indexOfFirstRecord={indexOfFirstRecord}
                          totalDataLength={parsedData.length}
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
                isSubmitting={isProcessing}
              />
            </>
          )}
        </div>
      </div>
    )
  );
};

export default EnhancedAddDataDialog;
