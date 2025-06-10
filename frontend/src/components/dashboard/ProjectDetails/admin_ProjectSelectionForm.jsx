import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  fetchDeviceProcurements,
  fetchSanitaryProcurements,
  fetchTableData,
  uploadProofImage,
} from "../../../action/supabase_actions";
import { SortAscIcon, SortDescIcon } from "lucide-react";
import StatusTimeline from "./components/StatusTimeline";
import ImageUploadModal from "./components/ImageUploadModal";
import TableActions from "./components/TableActions";
import { Eye, Upload } from "lucide-react";
import HeaderButtons from "../components/table_components/header_buttons";
import TableFilters from "../components/table_components/table_filters";
import TablePageNavButton from "../components/table_components/table_pageNav_button";
import EnhancedAddDataDialog from "./forms/Add_Data_Dialog/add_dataDialog";

const AdminProjectSelectionForm = ({
  selectedProject,
  hierarchicalData,
  projectdata,
  psulist,
}) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedpsu, setSelectedpsu] = useState("");
  const [sortAsc, setsortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const [exportType, setExportType] = useState("PDF");

  const statusOptions = projectdata.status_list || [];
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
    let result = [];
    result = await fetchTableData({ selectedProject: selectedProject.name });
    // if (selectedProject?.name === "Digital Device Procurement") {
    //   result = await fetchDeviceProcurements({});
    // } else if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
    //   result = await fetchSanitaryProcurements({});
    // }

    // Sort data by delivery_date (ascending)
    result.sort(
      (a, b) => new Date(a.committed_date) - new Date(b.committed_date)
    );

    setTableData(result);
    setFilteredData(result);
  };

  useEffect(() => {
    filterData();
  }, [
    startDate,
    endDate,
    selectedState,
    selectedDistrict,
    selectedSchool,
    selectedCategory,
    selectedpsu,
    tableData,
    sortAsc,
  ]);

  const filterData = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = tableData.filter((item) => {
      const itemDate = new Date(item.committed_date);
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end) &&
        (!selectedState || item.state === selectedState) &&
        (!selectedDistrict || item.district === selectedDistrict) &&
        (!selectedSchool || item.school_name === selectedSchool) &&
        (!selectedCategory || item.item_type === selectedCategory) &&
        (!selectedpsu || item.psu_name === selectedpsu)
      );
    });

    filtered.sort((a, b) =>
      sortAsc
        ? new Date(a.delivery_date) - new Date(b.committed_date)
        : new Date(b.delivery_date) - new Date(a.committed_date)
    );

    setFilteredData(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedProject?.name || "Procurement"} Report`, 14, 10);

    const tableColumn = [
      "ID",
      "Created_At",
      "State",
      "District",
      "School",
      "PSU",
      ...(projectdata.category_list.length > 0 ? ["Category"] : []),
      "Status",
      "Total Cost",
      "Quantity",
      "Unit Cost",
    ];

    const tableRows = filteredData.map((row) => [
      row.id,
      new Date(row.committed_date).toLocaleDateString(),
      row.state,
      row.district,
      row.school_name,
      row.psu_name ?? "",
      ...(projectdata.category_list.length > 0 ? [row.item_type] : []),
      row.status,
      row.total_cost,
      row.quantity,
      row.unit_cost,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${selectedProject?.name || "Procurement"}Report.pdf`);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Created_At",
      "State",
      "District",
      "School",
      "PSU",
      ...(projectdata.category_list.length > 0 ? ["Category"] : []),
      "Status",
      "Cost",
    ];

    const rows = filteredData.map((row) => [
      row.id,
      new Date(row.committed_date).toLocaleDateString(),
      row.state,
      row.district,
      row.school_name,
      row.psu_name ?? "BPCL",
      ...(projectdata.category_list.length > 0 ? [row.item_type] : []),
      row.status,
      row.total_cost,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedProject?.name || "Procurement"}Report.csv`
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
  const psuOptions = tableData
    ? Array.from(
        new Set(
          tableData
            .filter((item) => item.psu_name) // Filter out null/undefined values
            .map((item) => item.psu_name)
        )
      ).sort()
    : [];

  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-lg dark:bg-gray-900">
      <div className="p-6 border-b border-purple-200 dark:border-gray-700">
        <HeaderButtons
          exportType={exportType}
          setExportType={setExportType}
          handleExport={handleExport}
          isAdmin={false}
        />

        <TableFilters
          isAdmin={false}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          stateOptions={stateOptions}
          districtOptions={districtOptions}
          schoolOptions={schoolOptions}
          selectedProject={selectedProject}
          selectedPsu={selectedpsu}
          setSelectedPsu={setSelectedpsu}
          psuOptions={psuOptions}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-purple-800 bg-purple-50 dark:bg-gray-800 dark:text-purple-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                <div className="flex justify-start items-center">
                  Created Date
                  <button onClick={() => setsortAsc(!sortAsc)} className="ml-2">
                    {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Targeted Date
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
                PSU
              </th>
              {projectdata.category_list.length > 0 && (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Category
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Cost
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Proof Photo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Completed Photo
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
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
                  {row.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(row.committed_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {new Date(row.target_date).toLocaleDateString()}
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
                  {row.psu_name}
                </td>
                {projectdata.category_list.length > 0 && (
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.item_type}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <span
                    className={`
                        inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full
                        ${(() => {
                          // Get the index of current status in the status list
                          const statusIndex = statusOptions.indexOf(row.status);
                          const totalStatuses = statusOptions.length;

                          // Create color classes based on progress
                          if (statusIndex === 0) {
                            // First status (usually Pending)
                            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                          } else if (statusIndex === totalStatuses - 1) {
                            // Last status (Complete)
                            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                          } else {
                            // Intermediate statuses
                            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                          }
                        })()}
                      `}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  ₹{row.total_cost}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {row.proof_photo ? (
                      <button
                        onClick={() =>
                          setImageModal({
                            isOpen: true,
                            row,
                            type: "proof_photo",
                          })
                        }
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View proof photo"
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      <div className="border-2 h-14 w-14 border-dashed border-gray-300 rounded-md p-2 text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {row.completed_photo ? (
                      <button
                        onClick={() =>
                          setImageModal({
                            isOpen: true,
                            row,
                            type: "completed_photo",
                          })
                        }
                        className="p-1 text-green-600 hover:text-green-800"
                        title="View completed photo"
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      <div className="border-2 h-14 w-14 border-dashed border-gray-300 rounded-md p-2 text-gray-400" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePageNavButton
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Image Upload/View Modal */}
      <ImageUploadModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, row: null, type: null })}
        title={
          imageModal.type === "proof_photo" ? "Proof Photo" : "Completed Photo"
        }
        currentImage={imageModal.row?.[imageModal.type]}
      />
    </div>
  );
};

export default AdminProjectSelectionForm;
