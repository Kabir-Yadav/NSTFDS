import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TablePageNavButton from "../components/table_components/table_pageNav_button";

const UserPsuSelectionForm = ({ selectedPsuProject }) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [fundFilter, setFundFilter] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [fundComparison, setFundComparison] = useState("greater");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [exportType, setExportType] = useState("PDF");
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
  }, [selectedPsuProject]);

  const fetchData = async () => {
    // Dummy data for demonstration
    const dummyData = [
      {
        id: 1,
        date: "2025-05-01",
        school_name: "Greenwood High",
        district_name: "District A",
        state_name: "State X",
        project_name: "Project Alpha",
        status: "Pending",
        fund: 10000,
      },
      {
        id: 2,
        date: "2025-05-02",
        school_name: "Blue Ridge School",
        district_name: "District B",
        state_name: "State Y",
        project_name: "Project Beta",
        status: "Completed",
        fund: 15000,
      },
      {
        id: 3,
        date: "2025-05-03",
        school_name: "Sunrise Academy",
        district_name: "District C",
        state_name: "State Z",
        project_name: "Project Gamma",
        status: "Starting",
        fund: 20000,
      },
    ];
    setTableData(dummyData);
    setFilteredData(dummyData);
  };

  useEffect(() => {
    filterData();
  }, [
    startDate,
    endDate,
    selectedState,
    selectedDistrict,
    selectedProject,
    selectedSchool,
    fundFilter,
    fundComparison,
    tableData,
  ]);

  const filterData = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = tableData.filter((item) => {
      const itemDate = new Date(item.date);
      const fundCondition =
        fundFilter === ""
          ? true
          : fundComparison === "greater"
          ? item.fund >= parseFloat(fundFilter)
          : item.fund <= parseFloat(fundFilter);

      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end) &&
        (!selectedSchool || item.school_name === selectedSchool) &&
        (!selectedState || item.state_name === selectedState) &&
        (!selectedDistrict || item.district_name === selectedDistrict) &&
        (!selectedProject || item.project_name === selectedProject) &&
        fundCondition
      );
    });

    setFilteredData(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${selectedPsuProject?.name || "Funding"} Report`, 14, 10);

    const tableColumn = [
      "Date",
      "District",
      "State",
      "School",
      "Project",
      "Status",
      "Fund",
    ];
    const tableRows = filteredData.map((row) => [
      row.date,
      row.district_name,
      row.state_name,
      row.school_name,
      row.project_name,
      row.status,
      row.fund,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${selectedPsuProject?.name || "Funding"}Report.pdf`);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Date",
      "State",
      "District",
      "School",
      "Status",
      "Cost",
    ];

    const rows = filteredData.map((row) => [
      row.id,
      new Date(row.date).toLocaleDateString(),
      row.state_name,
      row.district_name,
      row.school_name,
      row.project_name,
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

  const stateOptions = [...new Set(tableData.map((item) => item.state_name))];
  const districtOptions = [
    ...new Set(tableData.map((item) => item.district_name)),
  ];
  const projectOptions = [
    ...new Set(tableData.map((item) => item.project_name)),
  ];
  const schoolOptions = [...new Set(tableData.map((item) => item.school_name))];

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
        <div
          className="
            flex
            mb-4
            justify-start items-center
          "
        >
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="
              mr-2 px-6 py-2
              text-white font-medium
              bg-[var(--color-primary)]
              rounded-lg
              transition-colors shadow-md
              dark:bg-[var(--color-secondary)] hover:bg-[var(--color-primary-dark)] dark:hover:bg-[var(--color-secondary-dark)] dark:text-[var(--color-primary-light)]
            "
          >
            Export to {exportType}
          </button>
          <div
            className="
              inline-flex
              p-1
              bg-gray-200
              rounded-full
              dark:bg-gray-700
            "
          >
            {["PDF", "CSV"].map((type) => (
              <button
                key={type}
                onClick={() => setExportType(type)}
                className={`
                  px-4 py-1
                  text-sm font-medium text-[var(--color-text)]
                  rounded-full
                  transition-colors
                  duration-200
                  ${
                    exportType === type
                      ? "bg-white dark:bg-gray-800 shadow"
                      : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div
          className="
            grid grid-cols-2
            gap-4
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          <div>
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            />
          </div>
          <div>
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            />
          </div>
          <div>
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
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
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            >
              <option value="">All Districts</option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              School
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            >
              <option value="">All Schools</option>
              {schoolOptions.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
            >
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            >
              <option value="">All Projects</option>
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="
                flex
                mb-2
                text-sm font-medium text-[var(--color-primary)]
                items-center
              "
            >
              Fund
              <button
                onClick={() =>
                  setFundComparison((prev) =>
                    prev === "greater" ? "less" : "greater"
                  )
                }
                className="
                  ml-2 px-2
                  border border-gray-300 rounded-md
                  dark:border-gray-500
                "
              >
                {fundComparison === "greater" ? ">" : "<"}
              </button>
            </label>
            <input
              type="number"
              value={fundFilter}
              onChange={(e) => setFundFilter(e.target.value)}
              placeholder="Enter amount"
              className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
            />
          </div>
        </div>
      </div>
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
                Date
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
                Project
              </th>
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
                Fund
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
                  {row.date}
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
                  {row.project_name}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  {row.status}
                </td>
                <td
                  className="
                    px-6 py-4
                    text-sm text-gray-700
                    dark:text-gray-300
                  "
                >
                  ₹{row.fund}
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
    </div>
  );
};

export default UserPsuSelectionForm;
