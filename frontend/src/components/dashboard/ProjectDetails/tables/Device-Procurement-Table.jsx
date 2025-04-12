import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DeviceProcurementTable = ({ data }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.delivery_date);
        return itemDate >= start && itemDate <= end;
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [startDate, endDate, data]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Device Procurement Report", 14, 10);

    const tableColumn = ["ID", "Date", "Category", "Status", "Cost"];
    const tableRows = filteredData.map((row) => [
      row.id,
      new Date(row.delivery_date).toLocaleDateString(),
      row.item_name,
      row.status,
      row.cost,
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
            Export to PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-50 dark:bg-gray-800 text-purple-800 dark:text-purple-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Serial ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Image</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr
                key={index}
                className={`$${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-purple-50/50 dark:bg-gray-800/50"} hover:bg-purple-100/50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" title={row.id}>{row.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(row.delivery_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {row.item_name}
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
                  {row.cost}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <img
                    src={row.proof_image_url}
                    alt={row.item_name}
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
