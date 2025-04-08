import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DeviceProcurementTable = ({
  selectedState,
  selectedDistrict,
  selectedSchool,
  selectedCategory,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Device procurement data
  const deviceData = [
    {
      _id: "6790be47d674eed32c3edb34",
      date: "2025-01-22T00:00:00.000+00:00",
      device_category: "Laptop",
      status: "Shipped",
      serial_id: "1dd-2323dw",
      photo_url: "/static/uploads/bennett.jpg",
    },
    {
      _id: "6790be47d674eed32c3edb35",
      date: "2025-01-23T00:00:00.000+00:00",
      device_category: "Tablet",
      status: "Delivered",
      serial_id: "2de-3345xy",
      photo_url: "/static/uploads/tablet.jpg",
    },
    {
      _id: "6790be47d674eed32c3edb36",
      date: "2025-01-24T00:00:00.000+00:00",
      device_category: "Interactive Board",
      status: "In Transit",
      serial_id: "3fe-4567op",
      photo_url: "/static/uploads/board.jpg",
    },
    // Add 7 more entries as needed
  ];
  const filteredData = deviceData.filter((item) => {
    const itemDate = new Date(item.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || itemDate >= start) && (!end || itemDate <= end);
  });

  const exportToPDF = () => {
      const doc = new jsPDF();
      doc.text("Device Procurement Report", 14, 10);
  
      const tableColumn = ["ID", "Date", "Category", "Status", "Serial ID"];
      const tableRows = filteredData.map((row) => [
        row._id.slice(0, 6) + "...",
        new Date(row.date).toLocaleDateString(),
        row.device_category,
        row.status,
        row.serial_id,
      ]);
  
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("DeviceProcurementReport.pdf");
    };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Filter and Export Section */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-6 border-b border-purple-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-purple-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-purple-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={exportToPDF}
            className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-9.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Export to PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-50 dark:bg-gray-800 text-purple-800 dark:text-purple-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Serial ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {deviceData.map((row, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-purple-50/50 dark:bg-gray-800/50"
                } hover:bg-purple-100/50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" title={row._id}>
  {row._id.slice(0, 6)}...
</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {row.device_category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      row.status === "Delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : row.status === "In Transit"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {row.serial_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                <img
                src={row.photo_url}
                alt={row.device_category}
                className="w-16 h-16 rounded-lg object-cover"
              />
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
      </div>
    </div>
  );
};

export default DeviceProcurementTable;
