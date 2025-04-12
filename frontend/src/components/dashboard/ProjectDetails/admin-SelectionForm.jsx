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

const AdminSelectionForm = ({ selectedProject, data, categories }) => {
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

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

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
    sortAsc
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

  const stateOptions = data ? data.map((item) => item.state_name) : [];
  const districtOptions =
    (selectedState &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.map((d) => d.district_name)) ||
    [];
  const schoolOptions =
    (selectedState &&
      selectedDistrict &&
      data
        .find((item) => item.state_name === selectedState)
        ?.districts.find((d) => d.district_name === selectedDistrict)
        ?.schools) ||
    [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-purple-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowAddDataModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
            dark:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md"
          >
            + Add New Entry
          </button>
          <button
            onClick={exportToPDF}
            className="px-6 py-2 bg-[var(--color-primary)] dark:bg-[var(--color-secondary)]
            hover:bg-[var(--color-primary-dark)] dark:hover:bg-[var(--color-secondary-dark)] rounded-lg 
            text-white dark:text-[var(--color-primary-light)] font-medium  
            transition-colors shadow-md"
          >
            Export to PDF
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
               bg-white dark:bg-gray-900 text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
              bg-white dark:bg-gray-900 text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedState(value);
                setSelectedDistrict("");
                setSelectedSchool("");
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
               bg-white dark:bg-gray-900 text-black dark:text-white"
            >
              <option value="">All States</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedDistrict(value);
                setSelectedSchool("");
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
               dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)]
                bg-white dark:bg-gray-900 text-black dark:text-white dark:disabled:text-gray-800"
              disabled={!selectedState}
            >
              <option value="">All Districts</option>
              {districtOptions?.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
              School
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg 
              dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] bg-white
               dark:bg-gray-900 text-black dark:text-white dark:disabled:text-gray-800"
              disabled={!selectedDistrict}
            >
              <option value="">All Schools</option>
              {schoolOptions?.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
          {selectedProject?.name === "Digital Device Procurement" && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg
                bg-white dark:bg-gray-900 text-black dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-50 dark:bg-gray-800 text-purple-800 dark:text-purple-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                <div className=" flex justify-start items-center">
                  Delivery Date
                  <button
                    onClick={() => {
                      setsortAsc(!sortAsc); // Toggle sort order
                    }}
                    className="ml-2"
                  >
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
              {selectedProject?.name === "Digital Device Procurement" && (
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
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-purple-50/50 dark:bg-gray-800/50"
                } hover:bg-purple-100/50 dark:hover:bg-gray-700/50 transition-colors`}
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
                {selectedProject?.name === "Digital Device Procurement" && (
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.item_name}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {row.status}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  ₹{row.cost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center space-x-4 mt-4 mb-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white dark:text-[var(--color-primary-light)]
             dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)]
             bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] rounded-lg
             transition-colors shadow-md
             "
        >
          Previous
        </button>
        <span className="text-[var(--color-primary)]">
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white dark:text-[var(--color-primary-light)]
             dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)]
             bg-[var(--color-primary)] dark:bg-[var(--color-secondary)] rounded-lg
             transition-colors shadow-md
             "
        >
          Next
        </button>
      </div>
      {renderAddDataForm()}
    </div>
  );
};

export default AdminSelectionForm;
