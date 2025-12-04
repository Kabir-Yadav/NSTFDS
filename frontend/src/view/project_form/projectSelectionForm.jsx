import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BarChart3, FileCheck } from "lucide-react";
import ImageUploadModal from "../../components/project_components/ImageUploadModal";
import HeaderButtons from "../../components/table_components/header_buttons";
import TableFilters from "../../components/table_components/table_filters";
import TablePageNavButton from "../../components/table_components/table_pageNav_button";
import ProjectOverview from "../../components/project_components/ProjectOverview";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import {
  getSimpleStatusDisplay,
  getSimpleStatusColor,
} from "../../utils/trainingHandoverUtils";
import {
  getCumulativeDispatchStatus,
  getCumulativeDispatchStatusColor,
} from "../../utils/dispatchUtils";
import { fetchSchools } from "../../services/dispatchService";

const ProjectSelectionForm = ({ selectedProject, projectdata, isAdmin }) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showOverview, setShowOverview] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedReady, setSelectedReady] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [selectedHandover, setSelectedHandover] = useState("");
  const [sortAsc, setsortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const [exportType, setExportType] = useState("PDF");
  const [isLoading, setIsLoading] = useState(true);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / recordsPerPage)
  );
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    row: null,
    type: null,
  });
  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  const fetchData = async () => {
    const projectName =
      typeof selectedProject === "string"
        ? selectedProject
        : selectedProject?.name;

    if (!projectName) {
      setTableData([]);
      setFilteredData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch from the same table as psu_Selection_form.jsx
      const { data, error } = await fetchSchools(projectName);
      if (error) throw new Error(error);

      setTableData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Failed to fetch project table data:", error);
      setTableData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [
    startDate,
    endDate,
    selectedState,
    selectedDistrict,
    selectedSchool,
    selectedReady,
    selectedTraining,
    selectedHandover,
    tableData,
    sortAsc,
  ]);

  const filterData = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = tableData.filter((item) => {
      // Date filter (optional - only applies if item has committed_date or created_at)
      const itemDate = item.committed_date
        ? new Date(item.committed_date)
        : item.created_at
        ? new Date(item.created_at)
        : null;
      const matchesDate =
        !start || !end || !itemDate || (itemDate >= start && itemDate <= end);

      // Basic filters
      const matchesState = !selectedState || item.state === selectedState;
      const matchesDistrict =
        !selectedDistrict || item.district === selectedDistrict;
      const matchesSchool =
        !selectedSchool || item.school_name === selectedSchool;

      // Ready filter
      const matchesReady =
        !selectedReady ||
        (selectedReady === "ready" && item.is_ready) ||
        (selectedReady === "not_ready" && !item.is_ready);

      // Training filter
      const matchesTraining =
        !selectedTraining ||
        (item.training_status || "not_started") === selectedTraining;

      // Handover filter
      const matchesHandover =
        !selectedHandover ||
        (item.handover_status || "not_started") === selectedHandover;

      return (
        matchesDate &&
        matchesState &&
        matchesDistrict &&
        matchesSchool &&
        matchesReady &&
        matchesTraining &&
        matchesHandover
      );
    });

    // Sort by created_at (newest first by default)
    filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    setFilteredData(filtered);
  };

  // Function to export data to PDF or CSV -------------------------------------------

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text(`${selectedProject?.name || "Project"} Report`, 14, 10);

    const tableColumn = [
      "ID",
      "State",
      "District",
      "School",
      "PSU",
      "Ready",
      "Certificate",
      "Delivery & Installation Status",
      "Training Status",
      "Handover Status",
      "Handover Certificate",
    ];

    const columnWidths = {
      0: 15, // ID
      1: 25, // State
      2: 25, // District
      3: 35, // School
      4: 20, // Ready
      5: 25, // Certificate
      6: 40, // Delivery & Installation Status
      7: 25, // Training Status
      8: 25, // Handover Status
      9: 30, // Handover Certificate
    };

    const tableRows = filteredData.map((row) => [
      row.id,
      row.state || "",
      row.district || "",
      row.school_name || "",
      row.is_ready ? "Yes" : "No",
      row.certificate_url ? "Uploaded" : "Not uploaded",
      row.dispatches && row.dispatches.length > 0
        ? getCumulativeDispatchStatus(row.dispatches)
        : "No dispatches",
      getSimpleStatusDisplay(row.training_status || "not_started"),
      getSimpleStatusDisplay(row.handover_status || "not_started"),
      row.handover_certificate_url ? "Uploaded" : "Not uploaded",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      columnStyles: columnWidths,

      styles: { fontSize: 8 },
      margin: { top: 20 },
      pageBreak: "auto",
      headStyles: { fillColor: [102, 51, 153] },
    });

    doc.save(`${selectedProject?.name || "Project"}Report.pdf`);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "State",
      "District",
      "School",
      "Ready",
      "Certificate",
      "Delivery & Installation Status",
      "Training Status",
      "Handover Status",
      "Handover Certificate",
    ];

    const rows = filteredData.map((row) => [
      row.id,
      row.state || "",
      row.district || "",
      row.school_name || "",
      row.is_ready ? "Yes" : "No",
      row.certificate_url ? "Uploaded" : "Not uploaded",
      row.dispatches && row.dispatches.length > 0
        ? getCumulativeDispatchStatus(row.dispatches)
        : "No dispatches",
      getSimpleStatusDisplay(row.training_status || "not_started"),
      getSimpleStatusDisplay(row.handover_status || "not_started"),
      row.handover_certificate_url ? "Uploaded" : "Not uploaded",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedProject?.name || "Project"} Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    exportType === "PDF" ? exportToPDF() : exportToCSV();
  };

  const stateOptions = tableData
    ? Array.from(new Set(tableData.map((item) => item.state))).sort()
    : [];
  const districtOptions = selectedState
    ? Array.from(
        new Set(
          tableData
            .filter((item) => item.state === selectedState)
            .map((item) => item.district)
        )
      ).sort()
    : [];
  const schoolOptions =
    selectedState && selectedDistrict
      ? Array.from(
          new Set(
            tableData
              .filter(
                (item) =>
                  item.state === selectedState &&
                  item.district === selectedDistrict
              )
              .map((item) => item.school_name)
          )
        ).sort()
      : [];

  console.log(selectedProject);
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Summary of project status and key metrics
            </p>
          </div>
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <BarChart3
              className={`h-5 w-5 transform transition-transform ${
                showOverview ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>
        {showOverview && (
          <ProjectOverview
            data={tableData}
            projectName={selectedProject?.name}
            statusList={projectdata.status_list ?? []}
          />
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-2xl shadow-lg dark:bg-gray-900">
        <div className="p-6 border-b border-purple-200 dark:border-gray-700">
          <HeaderButtons
            exportType={exportType}
            setExportType={setExportType}
            handleExport={handleExport}
            isAdmin={false}
          />

          <TableFilters
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            selectedReady={selectedReady}
            setSelectedReady={setSelectedReady}
            selectedTraining={selectedTraining}
            setSelectedTraining={setSelectedTraining}
            selectedHandover={selectedHandover}
            setSelectedHandover={setSelectedHandover}
            stateOptions={stateOptions}
            districtOptions={districtOptions}
            schoolOptions={schoolOptions}
            selectedProject={selectedProject}
          />
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingOverlay message="Fetching project records..." />
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No records found. Try adjusting your filters.
            </div>
          ) : (
            <table className="w-full">
              <thead className="text-purple-800 bg-purple-50 dark:bg-gray-800 dark:text-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    State
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    District
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    School
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Ready
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Certificate
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase">
                    Delivery and Installation Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Training
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Handover
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Handover Certificate
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => {
                  // Calculate enumerated ID based on page and position
                  const enumeratedId =
                    (currentPage - 1) * recordsPerPage + index + 1;
                  return (
                    <tr
                      key={row.id || index}
                      className={`
                  transition-colors hover:bg-purple-100/50 dark:hover:bg-gray-700/50
                  ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-purple-50/50 dark:bg-gray-800/50"
                  }
                    `}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {enumeratedId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.district}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.school_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={row.is_ready || false}
                            onChange={() => {}}
                            disabled
                            className="sr-only peer"
                          />
                          <div
                            className={`relative w-9 h-5 rounded-full peer
                        dark:bg-gray-700 peer-checked:bg-green-600 dark:peer-checked:bg-green-600
                          peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800
                          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                          peer-checked:after:border-white after:content-['']
                          after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full
                          after:h-4 after:w-4 after:transition-all
                          ${
                            row.is_ready
                              ? "bg-green-600"
                              : "bg-gray-300 dark:bg-gray-700"
                          }
                        `}
                          ></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.certificate_url ? (
                          <a
                            href={row.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
                          >
                            <FileCheck className="h-4 w-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                            Not uploaded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {row.dispatches && row.dispatches.length > 0 ? (
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCumulativeDispatchStatusColor(
                              row.dispatches
                            )}`}
                          >
                            {getCumulativeDispatchStatus(row.dispatches)}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                            No dispatches
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSimpleStatusColor(
                              row.training_status || "not_started"
                            )}`}
                          >
                            {getSimpleStatusDisplay(
                              row.training_status || "not_started"
                            )}
                          </span>
                          {row.expected_training_completion_date &&
                            row.training_status !== "complete" && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Expected:{" "}
                                {row.expected_training_completion_date}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSimpleStatusColor(
                              row.handover_status || "not_started"
                            )}`}
                          >
                            {getSimpleStatusDisplay(
                              row.handover_status || "not_started"
                            )}
                          </span>
                          {row.expected_handover_date &&
                            row.handover_status !== "complete" && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Expected: {row.expected_handover_date}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.handover_certificate_url ? (
                          <a
                            href={row.handover_certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
                          >
                            <FileCheck className="h-4 w-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                            {row.handover_status === "complete"
                              ? "Certificate required"
                              : "--"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && filteredData.length > 0 && (
          <TablePageNavButton
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Image Upload/View Modal */}
        <ImageUploadModal
          isOpen={imageModal.isOpen}
          onClose={() =>
            setImageModal({ isOpen: false, row: null, type: null })
          }
          title={
            imageModal.type === "proof_photo"
              ? "Proof Photo"
              : "Completed Photo"
          }
          currentImage={
            imageModal.row?.[
              imageModal.type === "proof_photo"
                ? "stage1_proof_url"
                : "stage2_proof_url"
            ]
          }
        />
      </div>
    </div>
  );
};

export default ProjectSelectionForm;
