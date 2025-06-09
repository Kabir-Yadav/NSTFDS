import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  fetchDeviceProcurements,
  fetchSanitaryProcurements,
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
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [selectedpsu, setSelectedpsu] = useState("");
  const [sortAsc, setsortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [exportType, setExportType] = useState("PDF");
  const [showEnhancedAddDataDialog, setShowEnhancedAddDataDialog] =
    useState(false);

  // New state for editing and timeline
  const [editingRow, setEditingRow] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [timelineModal, setTimelineModal] = useState({
    isOpen: false,
    row: null,
  });
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    row: null,
    type: null,
  });

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

  useEffect(() => {
    fetchData();
  }, [selectedProject]);

  const fetchData = async () => {
    let result = [];
    if (selectedProject?.name === "Digital Device Procurement") {
      result = await fetchDeviceProcurements({});
    } else if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
      result = await fetchSanitaryProcurements({});
    }

    // Sort data by delivery_date (ascending)
    result.sort(
      (a, b) => new Date(a.delivery_date) - new Date(b.delivery_date)
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
    tableData,
    sortAsc,
  ]);

  const filterData = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = tableData.filter((item) => {
      const itemDate = new Date(item.delivery_date);
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end) &&
        (!selectedState || item.state_name === selectedState) &&
        (!selectedDistrict || item.district_name === selectedDistrict) &&
        (!selectedSchool || item.school_name === selectedSchool) &&
        (!selectedCategory || item.item_name === selectedCategory)
      );
    });

    filtered.sort((a, b) =>
      sortAsc
        ? new Date(a.delivery_date) - new Date(b.delivery_date)
        : new Date(b.delivery_date) - new Date(a.delivery_date)
    );

    setFilteredData(filtered);
  };

  const handleEditStart = (row) => {
    setEditingRow(row.id);
    setEditingStatus(row.status);
    setEditingData({
      delivery_tracking_number: row.delivery_tracking_number || "",
      vendor_name: row.vendor_name || "",
      purchase_order_number: row.purchase_order_number || "",
      invoice_number: row.invoice_number || "",
      warranty_period: row.warranty_period || "",
      installation_date: row.installation_date || "",
      technician_name: row.technician_name || "",
      remarks: row.remarks || "",
      contact_person: row.contact_person || "",
      contact_phone: row.contact_phone || "",
    });
  };

  const handleEditSave = async (row) => {
    try {
      // Call your API to update the status
      // await updateProcurementStatus(row.id, editingStatus);

      // Update local state
      const updatedData = tableData.map((item) =>
        item.id === row.id ? { ...item, status: editingStatus } : item
      );
      setTableData(updatedData);
      setFilteredData(updatedData);

      setEditingRow(null);
      setEditingStatus("");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditingStatus("");
  };

  const handleImageUpload = async (file, rowId, imageType) => {
    try {
      // Call your API to upload image
      const imageUrl = await uploadProofImage(file, rowId, imageType);

      // Update local state
      const updatedData = tableData.map((item) =>
        item.id === rowId ? { ...item, [imageType]: imageUrl } : item
      );
      setTableData(updatedData);
      setFilteredData(updatedData);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedProject?.name || "Procurement"} Report`, 14, 10);

    const tableColumn = [
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

    const tableRows = filteredData.map((row) => [
      row.id,
      new Date(row.delivery_date).toLocaleDateString(),
      row.state_name,
      row.district_name,
      row.school_name,
      row.psu ?? "BPCL",
      ...(selectedProject?.name === "Digital Device Procurement"
        ? [row.item_name]
        : []),
      row.status,
      row.cost,
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

    const rows = filteredData.map((row) => [
      row.id,
      new Date(row.delivery_date).toLocaleDateString(),
      row.state_name,
      row.district_name,
      row.school_name,
      row.psu ?? "BPCL",
      ...(selectedProject?.name === "Digital Device Procurement"
        ? [row.item_name]
        : []),
      row.status,
      row.cost,
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

  const handleCloseModal = () => {
    setShowAddDataModal(false);
    fetchData(); // Refresh data after adding a new entry
  };

  const stateOptions = tableData
    ? Array.from(new Set(tableData.map((item) => item.state_name))).sort()
    : [];
  const districtOptions =
    (selectedState &&
      hierarchicalData
        .find((item) => item.state_name === selectedState)
        ?.districts.map((d) => d.district_name)
        .sort()) ||
    [];
  const schoolOptions =
    (selectedState &&
      selectedDistrict &&
      hierarchicalData
        .find((item) => item.state_name === selectedState)
        ?.districts.find((d) => d.district_name === selectedDistrict)
        ?.schools) ||
    [];
  const psuOptions = tableData
    ? Array.from(new Set(tableData.map((item) => item.psu)))
    : [];

  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-lg dark:bg-gray-900">
      <div className="p-6 border-b border-purple-200 dark:border-gray-700">
        <HeaderButtons
          exportType={exportType}
          setExportType={setExportType}
          handleExport={handleExport}
          isAdmin={true}
          setShowAddDataModal={() => setShowEnhancedAddDataDialog(true)}
        />

        <TableFilters
          isAdmin={true}
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
                  Delivery Date
                  <button onClick={() => setsortAsc(!sortAsc)} className="ml-2">
                    {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                </div>
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Actions
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
                  {new Date(row.delivery_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {row.state_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {row.district_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {row.school_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {"BPCL"}
                </td>
                {selectedProject?.name === "Digital Device Procurement" && (
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.item_name}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {editingRow === row.id ? (
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="px-2 py-1 text-xs border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
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
                        ${
                          row.status.toLowerCase() === "shipped"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : row.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : row.status.toLowerCase() === "just deployed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : row.status.toLowerCase() === "arrived"
                            ? "bg-indigo-100 text-green-800 dark:bg-green-500 dark:text-green-100"
                            : ""
                        }
                      `}
                    >
                      {row.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  ₹{row.cost}
                </td>
                {/* Proof Photo Column */}
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
                      <button
                        onClick={() =>
                          setImageModal({
                            isOpen: true,
                            row,
                            type: "proof_photo",
                          })
                        }
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="Add proof photo"
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                </td>
                {/* Completed Photo Column */}
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
                      <button
                        onClick={() =>
                          setImageModal({
                            isOpen: true,
                            row,
                            type: "completed_photo",
                          })
                        }
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="Add completed photo"
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </div>
                </td>
                {/* Actions Column */}{" "}
                <td className="px-6 py-4 text-sm">
                  <TableActions
                    row={row}
                    editingRow={editingRow}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    setTimelineModal={setTimelineModal}
                    setImageModal={setImageModal}
                  />
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

      <EnhancedAddDataDialog
        isOpen={showEnhancedAddDataDialog}
        onClose={() => setShowEnhancedAddDataDialog(false)}
        selectedProject={selectedProject}
        psuList={psulist}
        hierarchicalData={hierarchicalData}
        status={statusOptions}
        categories={projectdata.category_list || []}
        onSubmitSingle={(entry) => {
          setTableData((prev) => [...prev, entry]);
          setFilteredData((prev) => [...prev, entry]);
        }}
        onSubmitMultiple={(entries) => {
          setTableData((prev) => [...prev, ...entries]);
          setFilteredData((prev) => [...prev, ...entries]);
        }}
      />

      {/* Timeline Modal */}
      <StatusTimeline
        status={timelineModal.row?.status}
        deliveryDate={timelineModal.row?.delivery_date}
        isOpen={timelineModal.isOpen}
        onClose={() => setTimelineModal({ isOpen: false, row: null })}
      />

      {/* Image Upload/View Modal */}
      <ImageUploadModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, row: null, type: null })}
        title={
          imageModal.type === "proof_photo" ? "Proof Photo" : "Completed Photo"
        }
        currentImage={imageModal.row?.[imageModal.type]}
        onUpload={(file) =>
          handleImageUpload(file, imageModal.row?.id, imageModal.type)
        }
      />
    </div>
  );
};

export default AdminProjectSelectionForm;
