// import React, { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { SortAscIcon, SortDescIcon } from "lucide-react";
// import HeaderButtons from "../../components/table_components/header_buttons";
// import TableFilters from "../../components/table_components/table_filters";
// import TablePageNavButton from "../../components/table_components/table_pageNav_button";

// const DeviceProcurementTable = ({ data }) => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [filteredData, setFilteredData] = useState(data);
//   const [selectedpsu, setSelectedpsu] = useState("");
//   const [sortAsc, setsortAsc] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [exportType, setExportType] = useState("PDF");
//   const recordsPerPage = 10;
//   const selectedProject = "Digital Device Procurement";
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const paginatedData = filteredData.slice(
//     indexOfFirstRecord,
//     indexOfLastRecord
//   );
//   const totalPages = Math.max(
//     1,
//     Math.ceil(filteredData.length / recordsPerPage)
//   );
//   useEffect(() => {
//     filterData();
//   }, [startDate, endDate, selectedpsu, data, sortAsc]);

//   const filterData = () => {
//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;

//     const filtered = data.filter((item) => {
//       const itemDate = new Date(item.delivery_date);
//       return (
//         (!start || itemDate >= start) &&
//         (!end || itemDate <= end) &&
//         (!selectedpsu || item.psu === selectedpsu)
//       );
//     });

//     filtered.sort((a, b) =>
//       sortAsc
//         ? new Date(a.delivery_date) - new Date(b.delivery_date)
//         : new Date(b.delivery_date) - new Date(a.delivery_date)
//     );

//     setFilteredData(filtered);
//   };
//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.text(`${selectedProject?.name || "Procurement"} Report`, 14, 10);

//     const tableColumn = [
//       "ID",
//       "Delivery_Date",
//       "State",
//       "District",
//       "School",
//       "PSU",
//       "Category",
//       "Status",
//       "Cost",
//       "Proof_Image",
//     ];
//     const tableRows = filteredData.map((row) => [
//       row.id,
//       new Date(row.delivery_date).toLocaleDateString(),
//       row.state_name,
//       row.district_name,
//       row.school_name,
//       row.psu ?? "BPCL",
//       row.item_name,
//       row.status,
//       row.cost,
//       row.proof_image_url ? row.proof_image_url : "No Image",
//     ]);

//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//       columnStyles: {
//         9: { cellWidth: 35 }, // Make the Proof_Image column smaller
//       },
//       styles: {
//         fontSize: 8,
//       },
//     });

//     doc.save(`${selectedProject?.name || "Procurement"}Report.pdf`);
//   };

//   const exportToCSV = () => {
//     const headers = [
//       "ID",
//       "Date",
//       "State",
//       "District",
//       "School",
//       "PSU",
//       "Category",
//       "Status",
//       "Cost",
//       "Proof_Image",
//     ];
//     const rows = filteredData.map((row) => [
//       row.id,
//       new Date(row.delivery_date).toLocaleDateString(),
//       row.state_name,
//       row.district_name,
//       row.school_name,
//       row.psu ?? "BPCL",
//       row.item_name,
//       row.status,
//       row.cost,
//       row.proof_image_url ? row.proof_image_url : "No Image",
//     ]);

//     const csvContent =
//       "data:text/csv;charset=utf-8," +
//       [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "DeviceProcurementReport.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleExport = () => {
//     exportType === "PDF" ? exportToPDF() : exportToCSV();
//   };

//   const psuOptions = Array.from(new Set(data.map((item) => item.psu))).sort();

//   return (
//     <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
//       <div className="p-6 border-b border-purple-200 dark:border-gray-700">
//         <HeaderButtons
//           exportType={exportType}
//           setExportType={setExportType}
//           handleExport={handleExport}
//         />

//         <TableFilters
//           startDate={startDate}
//           setStartDate={setStartDate}
//           endDate={endDate}
//           setEndDate={setEndDate}
//           selectedProject={selectedProject}
//           selectedPsu={selectedpsu}
//           setSelectedPsu={setSelectedpsu}
//           psuOptions={psuOptions}
//         />
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="text-purple-800 bg-purple-50 dark:bg-gray-800 dark:text-purple-200">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 ID
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 <div className="flex justify-start items-center">
//                   Delivery Date
//                   <button onClick={() => setsortAsc(!sortAsc)} className="ml-2">
//                     {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
//                   </button>
//                 </div>
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 State
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 District
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 School
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 PSU
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 Category
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 Cost
//               </th>
//               <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
//                 Image
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedData.map((row, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   index % 2 === 0
//                     ? "bg-white dark:bg-gray-900"
//                     : "bg-purple-50/50 dark:bg-gray-800/50"
//                 } hover:bg-purple-100/50 dark:hover:bg-gray-700/50 transition-colors`}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
//                   {row.id}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {new Date(row.delivery_date).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {row.state_name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {row.district_name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {row.school_name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {row.psu ?? "BPCL"}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   {row.item_name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       row.status.toLowerCase() === "shipped"
//                         ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
//                         : row.status.toLowerCase() === "pending"
//                         ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
//                         : row.status.toLowerCase() === "just deployed"
//                         ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
//                         : row.status.toLowerCase() === "arrived"
//                         ? "bg-indigo-100 text-green-800 dark:bg-green-500 dark:text-green-100"
//                         : ""
//                     }`}
//                   >
//                     {row.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   ₹{row.cost}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
//                   <img
//                     src={row.proof_image_url}
//                     alt={row.item_name}
//                     className="w-16 h-16 rounded-lg object-cover"
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <TablePageNavButton
//         totalPages={totalPages}
//         currentPage={currentPage}
//         setCurrentPage={setCurrentPage}
//       />
//     </div>
//   );
// };

// export default DeviceProcurementTable;
