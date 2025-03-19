import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DeviceProcurementTable = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Filter data based on date range
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
    <div className="mt-6">
      <h3 className="text-lg font-outfit font-medium mb-4">Device Procurement Table</h3>

      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div>
          <label className="text-sm font-medium text-gray-700 font-outfit block mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 font-outfit block mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-redhat text-sm"
        >
          Export to PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-outfit font-medium text-sm text-gray-700">
          <div>ID</div>
          <div>Date</div>
          <div>Category</div>
          <div>Status</div>
          <div>Serial ID</div>
          <div>Image</div>
        </div>

        {filteredData.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-200 font-redhat text-sm hover:bg-gray-50 transition-colors"
          >
            <div title={row._id}>{row._id.slice(0, 6)}...</div>
            <div>{new Date(row.date).toLocaleDateString()}</div>
            <div>{row.device_category}</div>
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  row.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : row.status === "In Transit"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {row.status}
              </span>
            </div>
            <div>{row.serial_id}</div>
            <div>
              <img
                src={row.photo_url}
                alt={row.device_category}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceProcurementTable;
