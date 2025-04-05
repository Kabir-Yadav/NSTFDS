// src/components/ProjectDetails/TableSanitaryPad.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SanitaryPadTable = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8000/sanitary-pad-procurements/");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch sanitary data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Sanitary Pad Procurement Report", 14, 10);

    const tableColumn = ["State", "District", "School", "Cost", "Status", "Date"];
    const tableRows = data.map((row) => [
      row.state_name,
      row.district_name,
      row.school_name,
      `₹${row.cost}`,
      row.status,
      new Date(row.delivery_date).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("SanitaryPadProcurementReport.pdf");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-6 overflow-x-auto">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h3 className="text-xl text-[var(--color-text)] font-semibold">Sanitary Pad Procurement Records</h3>
        <button
          onClick={exportToPDF}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Export to PDF
        </button>
      </div>
      <table className="min-w-full table-auto text-sm text-left">
        <thead className="bg-purple-50 dark:bg-gray-800 text-purple-800 dark:text-purple-200">
          <tr>
            <th className="px-4 py-3">State</th>
            <th className="px-4 py-3">District</th>
            <th className="px-4 py-3">School</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Proof Image</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-100 dark:bg-gray-800"}
            >
              <td className="px-4 py-2">{entry.state_name}</td>
              <td className="px-4 py-2">{entry.district_name}</td>
              <td className="px-4 py-2">{entry.school_name}</td>
              <td className="px-4 py-2">₹{entry.cost}</td>
              <td className="px-4 py-2">{entry.status}</td>
              <td className="px-4 py-2">{new Date(entry.delivery_date).toLocaleDateString()}</td>
              <td className="px-4 py-2">
                {entry.proof_image_url ? (
                  <img
                    src={entry.proof_image_url}
                    alt="proof"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SanitaryPadTable;
