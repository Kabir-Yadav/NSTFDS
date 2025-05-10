import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  fetchDeviceProcurements,
  fetchSanitaryProcurements,
} from "../../../action/supabase_actions";
import DeviceForm from "./forms/device-form";
import SanitaryPadForm from "./forms/sanitary-form";
import { SortAscIcon, SortDescIcon } from "lucide-react";
import HeaderButtons from "../components/table_components/header_buttons";
import TableFilters from "../components/table_components/table_filters";
import TablePageNavButton from "../components/table_components/table_pageNav_button";

const AdminProjectSelectionForm = ({ selectedProject, data, categories }) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [sortAsc, setsortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [exportType, setExportType] = useState("PDF");
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / recordsPerPage),
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
      (a, b) => new Date(a.delivery_date) - new Date(b.delivery_date),
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
        : new Date(b.delivery_date) - new Date(a.delivery_date),
    );

    setFilteredData(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedProject?.name || "Procurement"} Report`, 14, 10);

    const tableColumn = [
      "ID",
      "Date",
      "State",
      "District",
      "School",
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
      "Date",
      "State",
      "District",
      "School",
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
      `${selectedProject?.name || "Procurement"}Report.csv`,
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

  const renderAddDataForm = () => {
    if (selectedProject?.name === "Digital Device Procurement") {
      return (
        <DeviceForm
          isOpen={showAddDataModal}
          data={data}
          categories={categories}
          onClose={handleCloseModal}
        />
      );
    } else if (selectedProject?.name === "Sanitary Pad Devices Procurement") {
      return (
        <SanitaryPadForm
          isOpen={showAddDataModal}
          data={data}
          onClose={handleCloseModal}
        />
      );
    }
    return null;
  };

  const stateOptions = tableData
    ? Array.from(new Set(tableData.map((item) => item.state_name))).sort()
    : [];
  const districtOptions =
    (selectedState &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.map((d) => d.district_name)
        .sort()) ||
    [];
  const schoolOptions =
    (selectedState &&
      selectedDistrict &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.find((d) => d.district_name === selectedDistrict)
        ?.schools.sort()) ||
    [];

  return (
    <div
      className="
        overflow-hidden
        bg-white
        rounded-2xl
        shadow-lg
        dark:bg-gray-900
      "
    >
      <div
        className="
          p-6
          border-b border-purple-200
          dark:border-gray-700
        "
      >
        {/* {Table Header Buttons} */}

        <HeaderButtons
          exportType={exportType}
          setExportType={setExportType}
          handleExport={handleExport}
          setShowAddDataModal={setShowAddDataModal}
        />

        {/* {Filters} */}

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
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          stateOptions={stateOptions}
          districtOptions={districtOptions}
          schoolOptions={schoolOptions}
          categories={categories}
          selectedProject={selectedProject}
        />
      </div>

      {/* {TABLE} */}

      <div
        className="
          overflow-x-auto
        "
      >
        <table
          className="
            w-full
          "
        >
          <thead
            className="
              text-purple-800
              bg-purple-50
              dark:bg-gray-800 dark:text-purple-200
            "
          >
            <tr>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                ID
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                <div
                  className="
                    flex
                    justify-start items-center
                  "
                >
                  Delivery Date
                  <button
                    onClick={() => {
                      setsortAsc(!sortAsc); // Toggle sort order
                    }}
                    className="
                      ml-2
                    "
                  >
                    {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
                  </button>
                </div>
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                State
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                District
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                School
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                PSU
              </th>
              {selectedProject?.name === "Digital Device Procurement" && (
                <th
                  className="
                    px-6 py-4
                    text-left text-xs font-semibold
                    uppercase
                  "
                >
                  Category
                </th>
              )}
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                Status
              </th>
              <th
                className="
                  px-6 py-4
                  text-left text-xs font-semibold
                  uppercase
                "
              >
                Cost
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
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-900
                    dark:text-gray-100
                  "
                >
                  {row.id}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {new Date(row.delivery_date).toLocaleDateString()}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {row.state_name}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {row.district_name}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {row.school_name}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {"BPCL"}
                </td>
                {selectedProject?.name === "Digital Device Procurement" && (
                  <td
                    className="
                      px-6 py-4
                      text-sm text-gray-700
                      dark:text-gray-300
                    "
                  >
                    {row.item_name}
                  </td>
                )}
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  <span
                    className={`
                      inline-flex
                      px-3 py-1
                      text-xs leading-5 font-semibold
                      rounded-full
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
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  ₹{row.cost}
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
      {renderAddDataForm()}
    </div>
  );
};

export default AdminProjectSelectionForm;
