import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BarChart3, Plus, FileCheck, Edit2 } from "lucide-react";
import TablePageNavButton from "../../components/table_components/table_pageNav_button";
import HeaderButtons from "../../components/table_components/header_buttons";
import LoadingOverlay from "../../components/common/LoadingOverlay";
import CertificateUploadDialog from "../../components/project_components/psu_project_table_components/CertificateUploadDialog";
import AddDispatchDialog from "../../components/project_components/psu_project_table_components/AddDispatchDialog";
import DispatchDetailsRow from "../../components/project_components/psu_project_table_components/DispatchDetailsRow";
import DispatchInfoModal from "../../components/project_components/psu_project_table_components/DispatchInfoModal";
import AddSpaceLabSchoolDialog from "../../components/project_components/psu_project_table_components/AddSpaceLabSchoolDialog";
import TrainingHandoverEditDialog from "../../components/project_components/psu_project_table_components/TrainingHandoverEditDialog";
import ProjectTableFilters from "../../components/project_components/psu_project_table_components/ProjectTableFilters";
import {
  getSimpleStatusDisplay,
  getSimpleStatusColor,
  canEditTraining,
  canEditHandover,
} from "../../utils/trainingHandoverUtils";

// Import service layer - abstracts data source
import {
  fetchSchools,
  toggleSchoolReady,
  uploadCertificate,
  addDispatch,
  uploadDeliveryProof,
  uploadInstallationProof,
  updateDispatchStatus,
  getDispatchStatusDisplay,
} from "../../services/dispatchService";
import {
  getDispatchStatusOrder,
  getAvailableNextStatuses,
  validateStatusChange,
  normalizeDispatch,
  getDispatchedComponents,
} from "../../utils/dispatchUtils";
import { useProjectComponents } from "../../models/projectComponents";

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
  const [showOverview, setShowOverview] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedpsu, setSelectedpsu] = useState("");
  const [sortAsc, setsortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;
  const [exportType, setExportType] = useState("PDF");
  const [isLoading, setIsLoading] = useState(true);

  // New state for dialogs
  const [certificateDialog, setCertificateDialog] = useState({
    isOpen: false,
    school: null,
  });
  const [dispatchDialog, setDispatchDialog] = useState({
    isOpen: false,
    school: null,
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [uploadingDelivery, setUploadingDelivery] = useState(null);
  const [uploadingInstallation, setUploadingInstallation] = useState(null);
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    dispatch: null,
    school: null,
  });
  const [addSchoolDialog, setAddSchoolDialog] = useState(false);
  const [trainingHandoverDialog, setTrainingHandoverDialog] = useState({
    isOpen: false,
    school: null,
    type: null, // "training" or "handover"
  });
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [componentDropdownOpen, setComponentDropdownOpen] = useState(false);
  const [selectedReady, setSelectedReady] = useState("");
  const [selectedTraining, setSelectedTraining] = useState("");
  const [selectedHandover, setSelectedHandover] = useState("");

  const toggleRowExpansion = (schoolId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId);
      } else {
        newSet.add(schoolId);
      }
      return newSet;
    });
  };

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

  // Get project name for component fetching
  const projectName =
    typeof selectedPsuProject === "string"
      ? selectedPsuProject
      : selectedPsuProject?.name || "Space Lab";

  // Fetch components from database
  const {
    components: projectComponents,
    loading: componentsLoading,
    error: componentsError,
  } = useProjectComponents(projectName);

  useEffect(() => {
    fetchData();
  }, [selectedPsuProject]);

  const fetchData = async () => {
    const projectName =
      typeof selectedPsuProject === "string"
        ? selectedPsuProject
        : selectedPsuProject?.name;

    if (!projectName) {
      setTableData([]);
      setFilteredData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch from database using project name
      const { data, error } = await fetchSchools(projectName);
      if (error) throw new Error(error);

      setTableData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error("Failed to fetch PSU data:", error);
      setTableData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    filterData();
  }, [
    selectedState,
    selectedDistrict,
    selectedSchool,
    selectedpsu,
    selectedComponents,
    selectedReady,
    selectedTraining,
    selectedHandover,
    tableData,
    sortAsc,
  ]);

  const filterData = () => {
    const filtered = tableData.filter((item) => {
      // Basic filters
      const matchesState = !selectedState || item.state === selectedState;
      const matchesDistrict =
        !selectedDistrict || item.district === selectedDistrict;
      const matchesSchool =
        !selectedSchool || item.school_name === selectedSchool;
      const matchesPsu = !selectedpsu || item.psu_name === selectedpsu;

      // Component filter: check if any dispatch contains any of the selected components
      let matchesComponents = true;
      if (
        selectedComponents.length > 0 &&
        item.dispatches &&
        item.dispatches.length > 0
      ) {
        // Get all components from all dispatches for this school
        const allDispatchedComponents = getDispatchedComponents(
          item.dispatches
        );
        // Check if any selected component is in the dispatched components
        matchesComponents = selectedComponents.some((comp) =>
          allDispatchedComponents.has(comp)
        );
      } else if (selectedComponents.length > 0) {
        // If components are selected but school has no dispatches, exclude it
        matchesComponents = false;
      }

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
        matchesState &&
        matchesDistrict &&
        matchesSchool &&
        matchesPsu &&
        matchesComponents &&
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

  // Component filter handlers
  const toggleComponent = (componentName) => {
    setSelectedComponents((prev) => {
      if (prev.includes(componentName)) {
        return prev.filter((name) => name !== componentName);
      } else {
        return [...prev, componentName];
      }
    });
  };

  const selectAllComponents = () => {
    if (projectComponents && projectComponents.length > 0) {
      setSelectedComponents([...projectComponents]);
    }
  };

  const deselectAllComponents = () => {
    setSelectedComponents([]);
  };

  const removeComponent = (componentName) => {
    setSelectedComponents((prev) =>
      prev.filter((name) => name !== componentName)
    );
  };

  // Toggle ready status
  const handleToggleReady = async (schoolId, currentStatus) => {
    const school = tableData.find((s) => s.id === schoolId);

    // Once a dispatch exists, readiness status cannot be changed
    if (school?.dispatches && school.dispatches.length > 0) {
      alert(
        "Readiness cannot be changed after a dispatch has been created for this school."
      );
      return;
    }

    // Simply toggle ready on/off (no certificate requirement)
    try {
      const { data, error } = await toggleSchoolReady(schoolId, !currentStatus);
      if (error) throw new Error(error);

      // Update local state
      setTableData((prev) =>
        prev.map((school) => (school.id === schoolId ? data : school))
      );
    } catch (error) {
      console.error("Failed to toggle ready status:", error);
      alert("Failed to update ready status. Please try again.");
    }
  };

  // Handle certificate upload
  const handleUploadCertificate = async (schoolId, file) => {
    const school = certificateDialog.school;

    try {
      // Pass school data for folder structure: proofs/{Project Name}/{School Name}/
      const projectName =
        typeof selectedPsuProject === "string"
          ? selectedPsuProject
          : selectedPsuProject?.name || "Space Lab";

      const { data, error } = await uploadCertificate(schoolId, file, {
        school_name: school?.school_name,
        project_name: projectName,
        ...school,
      });
      if (error) throw new Error(error);
      // Update local state with new certificate info (no readiness coupling)
      setTableData((prev) =>
        prev.map((school) => (school.id === schoolId ? data : school))
      );
    } catch (error) {
      throw error; // Re-throw to let dialog handle error display
    }
  };

  // Handle add dispatch
  const handleAddDispatch = async (schoolId, dispatchData) => {
    const { data, error } = await addDispatch(schoolId, dispatchData);
    if (error) throw new Error(error);

    // Refresh data
    fetchData();
  };

  // Handle delivery proof upload
  const handleUploadDeliveryProof = async (schoolId, dispatchId, file) => {
    setUploadingDelivery(dispatchId);
    try {
      // Get school data for folder structure
      const school = tableData.find((s) => s.id === schoolId);
      const projectName =
        typeof selectedPsuProject === "string"
          ? selectedPsuProject
          : selectedPsuProject?.name || "Space Lab";

      const { data, error } = await uploadDeliveryProof(
        schoolId,
        dispatchId,
        file,
        school
          ? {
              school_name: school.school_name,
              project_name: school.project_name || projectName,
            }
          : null
      );
      if (error) throw new Error(error);

      // Update local state immediately without refreshing whole table
      if (data && data.delivery_proof_url) {
        setTableData((prev) =>
          prev.map((s) => {
            if (s.id === schoolId) {
              return {
                ...s,
                dispatches: s.dispatches.map((d) =>
                  d.id === dispatchId
                    ? { ...d, delivery_proof_url: data.delivery_proof_url }
                    : d
                ),
              };
            }
            return s;
          })
        );
      }
    } catch (error) {
      console.error("Failed to upload delivery proof:", error);
      alert("Failed to upload delivery proof. Please try again.");
    } finally {
      setUploadingDelivery(null);
    }
  };

  // Handle installation proof upload
  const handleUploadInstallationProof = async (schoolId, dispatchId, file) => {
    setUploadingInstallation(dispatchId);
    try {
      // Get school data for folder structure
      const school = tableData.find((s) => s.id === schoolId);
      const projectName =
        typeof selectedPsuProject === "string"
          ? selectedPsuProject
          : selectedPsuProject?.name || "Space Lab";

      const { data, error } = await uploadInstallationProof(
        schoolId,
        dispatchId,
        file,
        school
          ? {
              school_name: school.school_name,
              project_name: school.project_name || projectName,
            }
          : null
      );
      if (error) throw new Error(error);

      // Update local state immediately without refreshing whole table
      if (data && data.installation_proof_url) {
        setTableData((prev) =>
          prev.map((s) => {
            if (s.id === schoolId) {
              return {
                ...s,
                dispatches: s.dispatches.map((d) =>
                  d.id === dispatchId
                    ? {
                        ...d,
                        installation_proof_url: data.installation_proof_url,
                      }
                    : d
                ),
              };
            }
            return s;
          })
        );
      }
    } catch (error) {
      console.error("Failed to upload installation proof:", error);
      alert("Failed to upload installation proof. Please try again.");
    } finally {
      setUploadingInstallation(null);
    }
  };

  // Handle edit dispatch status
  const handleEditStart = (dispatch) => {
    setEditingDispatch(dispatch.id);
    setEditFormData({
      dispatch_status: dispatch.dispatch_status || "pending_dispatch",
    });
  };

  const handleEditCancel = () => {
    setEditingDispatch(null);
    setEditFormData({});
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSave = async (schoolId, dispatchId) => {
    try {
      // Find the dispatch to get current status
      const school = tableData.find((s) => s.id === schoolId);
      const dispatch = school?.dispatches?.find((d) => d.id === dispatchId);

      if (!dispatch) {
        throw new Error("Dispatch not found");
      }

      const currentStatus = dispatch.dispatch_status || "pending_dispatch";
      const newStatus = editFormData.dispatch_status;

      // Validate: prevent going backwards in status
      if (newStatus) {
        const currentOrder = getDispatchStatusOrder(currentStatus);
        const newOrder = getDispatchStatusOrder(newStatus);

        if (newOrder < currentOrder) {
          throw new Error(
            `Cannot revert status. Current status is "${getDispatchStatusDisplay(
              currentStatus
            )}". You can only move forward to: ${getAvailableNextStatuses(
              currentStatus,
              dispatch
            )
              .slice(1)
              .map((s) => getDispatchStatusDisplay(s))
              .join(", ")}`
          );
        }

        // Validate: check if proofs are required and uploaded
        const proofValidation = validateStatusChange(newStatus, dispatch);
        if (!proofValidation.isValid) {
          throw new Error(proofValidation.error);
        }
      }

      const { data, error } = await updateDispatchStatus(
        schoolId,
        dispatchId,
        editFormData,
        dispatch // Pass current dispatch for validation
      );
      if (error) throw new Error(error);

      // Update local state
      setTableData((prev) =>
        prev.map((school) => {
          if (school.id === schoolId) {
            return {
              ...school,
              dispatches: school.dispatches.map((d) =>
                d.id === dispatchId
                  ? { ...d, dispatch_status: editFormData.dispatch_status }
                  : d
              ),
            };
          }
          return school;
        })
      );

      setEditingDispatch(null);
      setEditFormData({});
    } catch (error) {
      console.error("Failed to update dispatch status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Handle info modal
  const handleInfoClick = (dispatch, school) => {
    setInfoModal({
      isOpen: true,
      dispatch,
      school,
    });
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF("landscape");
  //   doc.text(`${selectedPsuProject?.name || "Space Lab"} Report`, 14, 10);

  //   const tableColumn = [
  //     "ID",
  //     "State",
  //     "District",
  //     "School",
  //     "PSU",
  //     "Ready",
  //     "Certificate",
  //     "Components Dispatched",
  //     "Components Installed",
  //   ];

  //   const tableRows = filteredData.map((row) => [
  //     row.id,
  //     row.state,
  //     row.district,
  //     row.school_name,
  //     row.psu_name,
  //     row.is_ready ? "Yes" : "No",
  //     row.certificate_url ? "Uploaded" : "Pending",
  //     row.dispatches.length,
  //     row.dispatches.filter((d) => d.is_installed).length,
  //   ]);

  //   doc.autoTable({
  //     head: [tableColumn],
  //     body: tableRows,
  //     startY: 20,
  //     styles: { fontSize: 8 },
  //     margin: { top: 20 },
  //     pageBreak: "auto",
  //     headStyles: { fillColor: [102, 51, 153] },
  //   });

  //   doc.save(`${selectedPsuProject?.name || "Space Lab"}_Report.pdf`);
  // };

  // const exportToCSV = () => {
  //   const headers = [
  //     "ID",
  //     "State",
  //     "District",
  //     "School",
  //     "PSU",
  //     "Ready",
  //     "Certificate",
  //     "Components Dispatched",
  //     "Components Installed",
  //   ];

  //   const rows = filteredData.map((row) => [
  //     row.id,
  //     row.state,
  //     row.district,
  //     row.school_name,
  //     row.psu_name,
  //     row.is_ready ? "Yes" : "No",
  //     row.certificate_url ? "Uploaded" : "Pending",
  //     row.dispatches.length,
  //     row.dispatches.filter((d) => d.is_installed).length,
  //   ]);

  //   const csvContent =
  //     "data:text/csv;charset=utf-8," +
  //     [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement("a");
  //   link.setAttribute("href", encodedUri);
  //   link.setAttribute(
  //     "download",
  //     `${selectedPsuProject?.name || "Space Lab"}_Report.csv`
  //   );
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const handleExport = () => {
  //   exportType === "PDF" ? exportToPDF() : exportToCSV();
  // };

  // Handle successful school project creation
  const handleSchoolProjectCreated = () => {
    fetchData();
  };

  // Handle training/handover status update
  const handleTrainingHandoverUpdate = (updatedSchool) => {
    setTableData((prev) =>
      prev.map((school) =>
        school.id === updatedSchool.id ? updatedSchool : school
      )
    );
    setFilteredData((prev) =>
      prev.map((school) =>
        school.id === updatedSchool.id ? updatedSchool : school
      )
    );
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

  return (
    <div className="space-y-6">
      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-2xl shadow-lg dark:bg-gray-900">
        <div className="p-6 border-b border-purple-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            {/* Add New Entry Button - Left Side */}
            <button
              onClick={() => setAddSchoolDialog(true)}
              className="px-6 py-2 text-white bg-green-600 rounded-lg transition-colors shadow-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 font-medium"
            >
              + Add New Entry
            </button>

            {/* Export Controls - Right Side */}
            {/* <div className="flex items-center gap-2"> */}
            {/* Segmented Control for Export Type */}
            {/* <div className="inline-flex p-1 bg-gray-200 rounded-full dark:bg-gray-700">
                {["PDF", "CSV"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setExportType(type)}
                    className={`px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-full transition-colors duration-200 ${
                      exportType === type
                        ? "bg-white dark:bg-gray-800 shadow"
                        : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div> */}

            {/* Export Button */}
            {/* <button
                onClick={handleExport}
                className="px-6 py-2 text-white font-medium bg-[var(--color-primary)] rounded-lg transition-colors shadow-md dark:bg-[var(--color-secondary)] hover:bg-[var(--color-primary-dark)] dark:hover:bg-[var(--color-secondary-dark)] dark:text-[var(--color-primary-light)]"
              >
                Export to {exportType}
              </button> */}
            {/* </div> */}
          </div>

          <ProjectTableFilters
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            selectedSchool={selectedSchool}
            selectedReady={selectedReady}
            selectedTraining={selectedTraining}
            selectedHandover={selectedHandover}
            selectedComponents={selectedComponents}
            componentDropdownOpen={componentDropdownOpen}
            onStateChange={setSelectedState}
            onDistrictChange={setSelectedDistrict}
            onSchoolChange={setSelectedSchool}
            onReadyChange={setSelectedReady}
            onTrainingChange={setSelectedTraining}
            onHandoverChange={setSelectedHandover}
            onComponentToggle={toggleComponent}
            onComponentDropdownToggle={setComponentDropdownOpen}
            onSelectAllComponents={selectAllComponents}
            onDeselectAllComponents={deselectAllComponents}
            onRemoveComponent={removeComponent}
            stateOptions={stateOptions}
            districtOptions={districtOptions}
            schoolOptions={schoolOptions}
            projectComponents={projectComponents}
            componentsLoading={componentsLoading}
          />
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingOverlay message="Fetching school records..." />
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No records found. Try adjusting your filters.
            </div>
          ) : (
            <table className="w-full">
              <thead className="text-purple-800 bg-purple-50 dark:bg-gray-800 dark:text-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    S.No.
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
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Actions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                    Dispatches
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ minWidth: "180px" }}>
                    Training
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ minWidth: "180px" }}>
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
                  const dispatchDetails = DispatchDetailsRow({
                    school: row,
                    onUploadDeliveryProof: handleUploadDeliveryProof,
                    onUploadInstallationProof: handleUploadInstallationProof,
                    isExpanded: expandedRows.has(row.id),
                    onToggle: () => toggleRowExpansion(row.id),
                    uploadingDelivery,
                    uploadingInstallation,
                    editingDispatch,
                    onEditStart: handleEditStart,
                    onEditSave: handleEditSave,
                    onEditCancel: handleEditCancel,
                    editFormData,
                    onEditChange: handleEditChange,
                    onInfoClick: (dispatch) => handleInfoClick(dispatch, row),
                  });

                  return (
                    <React.Fragment key={row.id}>
                      <tr
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
                              checked={row.is_ready}
                              onChange={() =>
                                handleToggleReady(row.id, row.is_ready)
                              }
                              className="sr-only peer"
                            />
                            <div
                              className={`relative w-9 h-5 bg-gray-300 rounded-full peer
                        dark:bg-gray-700 peer-checked:bg-green-600 dark:peer-checked:bg-green-600
                          peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800
                          peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                          peer-checked:after:border-white after:content-['']
                          after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full
                          after:h-4 after:w-4 after:transition-all
                          ${
                            row.certificate_url
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }
                        `}
                            ></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {row.certificate_url ? (
                              // When certificate exists, show only "View"
                              <a
                                href={row.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline"
                              >
                                <FileCheck className="h-4 w-4" />
                                <span>View</span>
                              </a>
                            ) : row.is_ready ? (
                              // When ready but no certificate, show only "Add Certificate" button
                              <button
                                onClick={() =>
                                  setCertificateDialog({
                                    isOpen: true,
                                    school: row,
                                  })
                                }
                                className="px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              >
                                Add Certificate
                              </button>
                            ) : (
                              // When not ready, just show info text and no button
                              <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Mark ready to add certificate
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {row.is_ready ? (
                            <button
                              onClick={() =>
                                setDispatchDialog({ isOpen: true, school: row })
                              }
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              Add Dispatch
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                              Not ready
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {dispatchDetails.summary}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(() => {
                            const trainingEditCheck = canEditTraining(row);
                            const canEdit = trainingEditCheck.canEdit;
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSimpleStatusColor(
                                      row.training_status || "not_started"
                                    )}`}
                                  >
                                    {getSimpleStatusDisplay(
                                      row.training_status || "not_started"
                                    )}
                                  </span>
                                  {canEdit && (
                                    <button
                                      onClick={() =>
                                        setTrainingHandoverDialog({
                                          isOpen: true,
                                          school: row,
                                          type: "training",
                                        })
                                      }
                                      className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                      title="Edit training status"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                {row.expected_training_completion_date &&
                                  row.training_status !== "complete" && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Expected:{" "}
                                      {row.expected_training_completion_date}
                                    </p>
                                  )}
                                {!canEdit && trainingEditCheck.error && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                    {trainingEditCheck.error}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(() => {
                            const handoverEditCheck = canEditHandover(row);
                            const canEdit = handoverEditCheck.canEdit;
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSimpleStatusColor(
                                      row.handover_status || "not_started"
                                    )}`}
                                  >
                                    {getSimpleStatusDisplay(
                                      row.handover_status || "not_started"
                                    )}
                                  </span>
                                  {canEdit && (
                                    <button
                                      onClick={() =>
                                        setTrainingHandoverDialog({
                                          isOpen: true,
                                          school: row,
                                          type: "handover",
                                        })
                                      }
                                      className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                      title="Edit handover status"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                {row.expected_handover_date &&
                                  row.handover_status !== "complete" && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Expected: {row.expected_handover_date}
                                    </p>
                                  )}
                                {!canEdit && handoverEditCheck.error && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                    {handoverEditCheck.error}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
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

                      {/* Expanded Details Row */}
                      {dispatchDetails.expanded && (
                        <tr>
                          <td
                            colSpan={12}
                            className="p-0 bg-gray-50 dark:bg-gray-800/50"
                          >
                            {dispatchDetails.expanded}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
      </div>

      {/* Dialogs */}
      <CertificateUploadDialog
        isOpen={certificateDialog.isOpen}
        onClose={() => {
          setCertificateDialog({
            isOpen: false,
            school: null,
          });
        }}
        school={certificateDialog.school}
        onUpload={handleUploadCertificate}
      />

      <AddDispatchDialog
        isOpen={dispatchDialog.isOpen}
        onClose={() => setDispatchDialog({ isOpen: false, school: null })}
        school={dispatchDialog.school}
        onAddDispatch={handleAddDispatch}
      />

      <DispatchInfoModal
        isOpen={infoModal.isOpen}
        onClose={() =>
          setInfoModal({ isOpen: false, dispatch: null, school: null })
        }
        dispatch={infoModal.dispatch}
        school={infoModal.school}
        onUpdate={(dispatchId, updatedDispatch) => {
          // Update local state when dispatch is updated
          setTableData((prev) =>
            prev.map((s) => {
              if (s.id === infoModal.school?.id) {
                return {
                  ...s,
                  dispatches: s.dispatches.map((d) =>
                    d.id === dispatchId ? { ...d, ...updatedDispatch } : d
                  ),
                };
              }
              return s;
            })
          );
          // Update the modal's dispatch data
          setInfoModal((prev) => ({
            ...prev,
            dispatch: { ...prev.dispatch, ...updatedDispatch },
          }));
        }}
      />

      <AddSpaceLabSchoolDialog
        isOpen={addSchoolDialog}
        onClose={() => setAddSchoolDialog(false)}
        onSuccess={handleSchoolProjectCreated}
        projectName={
          typeof selectedPsuProject === "string"
            ? selectedPsuProject
            : selectedPsuProject?.name || "Space Lab"
        }
      />

      <TrainingHandoverEditDialog
        isOpen={trainingHandoverDialog.isOpen}
        onClose={() =>
          setTrainingHandoverDialog({ isOpen: false, school: null, type: null })
        }
        school={trainingHandoverDialog.school}
        type={trainingHandoverDialog.type}
        onUpdate={handleTrainingHandoverUpdate}
      />
    </div>
  );
};

export default PsuSelectionForm;
