import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TablePageNavButton from "../components/table_components/table_pageNav_button";
import HeaderButtons from "../components/table_components/header_buttons";
import {
  fetchTableData,
  uploadProofImage,
  supabase,
} from "../../../action/supabase_actions";
import { SortAscIcon, SortDescIcon, Eye, Upload } from "lucide-react";
import EnhancedAddDataDialog from "./forms/Add_Data_Dialog/add_dataDialog";
import StatusTimeline from "./components/StatusTimeline";
import TableActions from "./components/TableActions";
import ImageUploadModal from "./components/ImageUploadModal";
import TableFilters from "../components/table_components/table_filters";

const PsuSelectionForm = ({
  selectedPsuProject,
  projectList,
  projectdata,
  hierarchicalData,
  psulist,
  psuName,
  isAdmin,
}) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [fundFilter, setFundFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [fundComparison, setFundComparison] = useState("greater");
  const [currentPage, setCurrentPage] = useState(1);
  const [exportType, setExportType] = useState("PDF");
  const [sortAsc, setsortAsc] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelecteStatus] = useState("");

  const recordsPerPage = 20;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const [showEnhancedAddDataDialog, setShowEnhancedAddDataDialog] =
    useState(false);
  // New state for editing and timeline
  const [editingData, setEditingData] = useState({});
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / recordsPerPage)
  );

  const fetchData = async () => {
    let result = [];
    result = await fetchTableData({ selectedProject: selectedPsuProject });
    result.sort(
      (a, b) => new Date(a.committed_date) - new Date(b.committed_date)
    );

    setTableData(result);
    setFilteredData(result);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPsuProject]);

  useEffect(() => {
    filterData();
  }, [
    startDate,
    endDate,
    selectedState,
    selectedDistrict,
    selectedSchool,
    selectedCategory,
    fundFilter,
    fundComparison,
    tableData,
    selectedStatus,
    sortAsc,
  ]);
  const filterData = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Make sure we have data to filter
    if (!tableData || !tableData.length) {
      setFilteredData([]);
      return;
    }
    const filtered = tableData.filter((item) => {
      const itemDate = new Date(item.committed_date);
      const fundCondition =
        fundFilter === ""
          ? true
          : fundComparison === "greater"
          ? item.total_cost >= parseFloat(fundFilter)
          : item.total_cost <= parseFloat(fundFilter);

      const stateMatch = !selectedState || item.state === selectedState;
      const districtMatch =
        !selectedDistrict || item.district === selectedDistrict;
      const schoolMatch =
        !selectedSchool || item.school_name === selectedSchool;
      const categoryMatch =
        !selectedCategory || item.item_type === selectedCategory;
      const statusMatch = !selectedStatus || item.status === selectedStatus;
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end) &&
        stateMatch &&
        districtMatch &&
        schoolMatch &&
        categoryMatch &&
        statusMatch &&
        fundCondition
      );
    });

    // Sort using committed_date consistently
    filtered.sort((a, b) =>
      sortAsc
        ? new Date(a.committed_date) - new Date(b.committed_date)
        : new Date(b.committed_date) - new Date(a.committed_date)
    );
    setFilteredData(filtered);
  };

  // Function to handle row click for editing status or viewing timeline ----------------------------
  const handleEditSave = async (row) => {
    try {
      // Update the database
      const { data, error } = await supabase
        .from("project_deliveries")
        .update({
          status: editingStatus,
          // Reset proof URLs if status is changed to earlier stages
          ...(statusOptions.indexOf(editingStatus) < statusOptions.length - 2
            ? { stage1_proof_url: null, stage2_proof_url: null }
            : statusOptions.indexOf(editingStatus) === statusOptions.length - 2
            ? { stage2_proof_url: null }
            : {}),
        })
        .eq("id", row.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedData = tableData.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: editingStatus,
              // Also update proof URLs in UI if needed
              ...(statusOptions.indexOf(editingStatus) <
              statusOptions.length - 2
                ? { proof_photo: null, completed_photo: null }
                : statusOptions.indexOf(editingStatus) ===
                  statusOptions.length - 2
                ? { completed_photo: null }
                : {}),
            }
          : item
      );

      setTableData(updatedData);
      setFilteredData(updatedData);

      setEditingRow(null);
      setEditingStatus("");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditingStatus("");
  };
  const handleImageUpload = async (file, rowId, imageType) => {
    try {
      // Upload the image to storage bucket
      const imageUrl = await uploadProofImage({
        file,
        projectName: selectedPsuProject,
      });

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Convert imageType to database column name
      const columnName =
        imageType === "proof_photo" ? "stage1_proof_url" : "stage2_proof_url";

      // Update the database
      const { data, error } = await supabase
        .from("project_deliveries")
        .update({ [columnName]: imageUrl })
        .eq("id", rowId)
        .select()
        .single();

      if (error) throw error;

      // Update local state after successful database update
      const updatedData = tableData.map((item) =>
        item.id === rowId ? { ...item, [imageType]: imageUrl } : item
      );

      setTableData(updatedData);
      setFilteredData(updatedData);

      // Close the modal
      setImageModal({ isOpen: false, row: null, type: null });
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    }
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

  // Function to export data to PDF or CSV -------------------------------------------

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text(`${selectedPsuProject?.name || "Funding"} Report`, 14, 10);

    const tableColumn = [
      "ID",
      "Committed_Date",
      "Target_Date",
      "State",
      "District",
      "Block",
      "School",
      "Status",
      "Quantity",
      "Unit_Cost",
      "Total_Cost",
      ...(projectdata.category_list.length > 0 ? ["Item_Type"] : []),
      ...(isAdmin ? ["Stage1_proof"] : []),
      ...(isAdmin ? ["Stage2_proof"] : []),
      ...(isAdmin ? ["Completion_Certificate"] : []),
      "Extras",
    ];

    const columnWidths = {
      0: 15, // ID
      1: 25, // Committed_Date
      2: 25, // Target_Date
      3: 25, // State
      4: 25, // District
      5: 25, // Block
      6: 35, // School
      7: 25, // Status
      8: 20, // Quantity
      9: 25, // Unit_Cost
      10: 25, // Total_Cost
      11: 25, // Item_Type (if applicable)
      12: 15, // Stage1_proof - slightly increased for better readability
      13: 15, // Stage2_proof - slightly increased for better readability
      14: 15, // Completion_Certificate - slightly increased for better readability
      15: 25, // Extras
    };

    const tableRows = filteredData.map((row) => [
      row.id,
      row.committed_date,
      row.target_date,
      row.state,
      row.district,
      row.block,
      row.school_name,
      row.status,
      row.quantity,
      row.unit_cost,
      row.total_cost,
      ...(projectdata.category_list.length > 0 ? [row.item_type] : []),
      ...(isAdmin ? [row.stage1_proof_url ? "Link" : "No Link"] : []),
      ...(isAdmin ? [row.stage2_proof_url ? "Link" : "No Link"] : []),
      ...(isAdmin ? [row.completion_certificate_url ? "Link" : "No Link"] : []),
      row.extra_json
        ? (() => {
            try {
              return JSON.stringify(
                JSON.parse(row.extra_json),
                null,
                1
              ).replace(/[{}"]/g, "");
            } catch (e) {
              console.error("Invalid JSON:", e);
              return "--";
            }
          })()
        : "--",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      columnStyles: columnWidths,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "left",
      },
      margin: { top: 20 },
      pageBreak: "auto",
      headStyles: {
        fillColor: [102, 51, 153],
        textColor: [255, 255, 255],
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1,
      },
    });

    doc.save(`${selectedPsuProject || "Funding"}Report.pdf`);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Committed_Date",
      "Target_Date",
      "State",
      "District",
      "Block",
      "School",
      "Status",
      "Quantity",
      "Unit_Cost",
      "Total_Cost",
      ...(projectdata.category_list.length > 0 ? ["Item_Type"] : []),
      ...(isAdmin ? ["Stage1_proof"] : []),
      ...(isAdmin ? ["Stage2_proof"] : []),
      ...(isAdmin ? ["Completion_Certificate"] : []),
      "Extras",
    ];

    const rows = filteredData.map((row) => [
      row.id,
      row.committed_date,
      row.target_date,
      row.state,
      row.district,
      row.block,
      row.school_name,
      row.status,
      row.quantity,
      row.unit_cost,
      row.total_cost,
      ...(projectdata.category_list.length > 0 ? [row.item_type] : []),
      ...(isAdmin ? [row.stage1_proof_url] : []),
      ...(isAdmin ? [row.stage2_proof_url] : []),
      ...(isAdmin ? [row.completion_certificate_url] : []),
      // Parse and format the JSON data
      row.extra_json
        ? (() => {
            try {
              return JSON.stringify(
                JSON.parse(row.extra_json),
                null,
                1
              ).replace(/[{}"]/g, "");
            } catch (e) {
              console.error("Invalid JSON:", e);
              return "";
            }
          })()
        : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedPsuProject || "Procurement"}Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    exportType === "PDF" ? exportToPDF() : exportToCSV();
  };

  // Generate unique options for filters -------------------------------------------

  const statusOptions = projectdata.status_list || [];

  const stateOptions = tableData
    ? Array.from(new Set(tableData.map((item) => item.state)))
        .filter(Boolean)
        .sort()
    : [];

  const districtOptions = selectedState
    ? Array.from(
        new Set(
          tableData
            .filter((item) => item.state === selectedState)
            .map((item) => item.district)
        )
      )
        .filter(Boolean)
        .sort()
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
        )
          .filter(Boolean)
          .sort()
      : [];

  // Render the component -------------------------------------------

  return (
    <div className="overflow-hidden bg-white rounded-2xl shadow-lg dark:bg-gray-900">
      <div className="p-6 border-b border-purple-200dark:border-gray-700">
        <HeaderButtons
          exportType={exportType}
          setExportType={setExportType}
          handleExport={handleExport}
          isAdmin={isAdmin}
          setShowAddDataModal={() => setShowEnhancedAddDataDialog(true)}
        />
        <TableFilters
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
          categories={projectdata?.category_list}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          stateOptions={stateOptions}
          districtOptions={districtOptions}
          schoolOptions={schoolOptions}
          selectedProject={selectedPsuProject}
          fundFilter={fundFilter}
          setFundFilter={setFundFilter}
          fundComparison={fundComparison}
          setFundComparison={setFundComparison}
          selectedStatus={selectedStatus}
          statusOptions={statusOptions}
          setSelectedStatus={setSelecteStatus}
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

              {projectdata.category_list.length > 0 && (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Category
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Total Cost
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Proof Photo
                </th>
              )}
              {isAdmin && (
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                  Completed Photo
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                `{isAdmin ? "Actions" : "Extras"}`
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`
                  transition-colors
                  hover:bg-purple-100/50 dark:hover:bg-gray-700/50
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
                {projectdata.category_list.length > 0 && (
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.item_type}
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
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  ₹{row.total_cost}
                </td>{" "}
                {/* Proof Photo Column */}
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const statusIndex = statusOptions.indexOf(row.status);
                        const totalStatuses = statusOptions.length;
                        const showProofUpload =
                          statusIndex >= totalStatuses - 2;

                        if (!showProofUpload) {
                          return (
                            <span className="text-gray-400 text-xs">
                              Not required
                            </span>
                          );
                        }

                        if (row.stage1_proof_url) {
                          return (
                            <div className="flex items-center gap-2">
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
                              <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                {row.stage1_proof_url.split("/").pop()}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() =>
                              setImageModal({
                                isOpen: true,
                                row,
                                type: "proof_photo",
                              })
                            }
                            className="p-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            title="Add proof photo"
                          >
                            <Upload size={16} />
                            <span className="text-xs">Upload proof</span>
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                )}
                {/* Completed Photo Column */}
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const statusIndex = statusOptions.indexOf(row.status);
                        const totalStatuses = statusOptions.length;
                        const showCompletedUpload =
                          statusIndex === totalStatuses - 1;

                        if (!showCompletedUpload) {
                          return (
                            <span className="text-gray-400 text-xs">
                              Not required
                            </span>
                          );
                        }

                        if (row.stage2_proof_url) {
                          return (
                            <div className="flex items-center gap-2">
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
                              <span className="text-xs text-gray-600 truncate max-w-[120px]">
                                {row.stage2_proof_url.split("/").pop()}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() =>
                              setImageModal({
                                isOpen: true,
                                row,
                                type: "completed_photo",
                              })
                            }
                            className="p-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                            title="Add completed photo"
                          >
                            <Upload size={16} />
                            <span className="text-xs">Upload photo</span>
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                )}
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
                    isAdmin={isAdmin}
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
      {isAdmin && (
        <EnhancedAddDataDialog
          isOpen={showEnhancedAddDataDialog}
          onClose={() => setShowEnhancedAddDataDialog(false)}
          psuList={psulist}
          hierarchicalData={hierarchicalData}
          selectedProject={selectedPsuProject}
          status={statusOptions}
          categories={projectdata.category_list || []}
          onSubmitSingle={(entry) => {
            setTableData((prev) => [entry, ...prev]);
            setFilteredData((prev) => [entry, ...prev]);
          }}
          onSubmitMultiple={(entries) => {
            setTableData((prev) => [...prev, ...entries]);
            setFilteredData((prev) => [...prev, ...entries]);
          }}
          psuName={psuName}
        />
      )}
      {/* Timeline Modal */}{" "}
      <StatusTimeline
        isAdmin={isAdmin}
        status={timelineModal.row?.status}
        deliveryDate={timelineModal.row?.target_date}
        isOpen={timelineModal.isOpen}
        onClose={() => setTimelineModal({ isOpen: false, row: null })}
        projectStatuses={statusOptions}
        additionalData={timelineModal.row?.extra_json}
      />
      <ImageUploadModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, row: null, type: null })}
        title={
          imageModal.type === "proof_photo" ? "Proof Photo" : "Completed Photo"
        }
        currentImage={
          imageModal.row?.[
            imageModal.type === "proof_photo"
              ? "stage1_proof_url"
              : "stage2_proof_url"
          ]
        }
        onUpload={(file) =>
          handleImageUpload(file, imageModal.row?.id, imageModal.type)
        }
      />
    </div>
  );
};

export default PsuSelectionForm;
