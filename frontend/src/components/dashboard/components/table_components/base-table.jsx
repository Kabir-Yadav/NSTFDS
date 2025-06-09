// import React, { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { SortAscIcon, SortDescIcon } from "lucide-react";
// import HeaderButtons from "./header_buttons";
// import TableFilters from "./table_filters";
// import TablePageNavButton from "./table_pageNav_button";

// const BaseTable = ({
//   data,
//   columns,
//   filterConfig,
//   exportConfig,
//   selectedProject,
//   isAdmin = false,
//   onAddData,
// }) => {
//   const [sortAsc, setSortAsc] = useState(true);
//   const [exportType, setExportType] = useState("csv");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [selectedState, setSelectedState] = useState(null);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [selectedSchool, setSelectedSchool] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedpsu, setSelectedpsu] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   useEffect(() => {
//     // ...existing code for data fetching and pagination...
//   }, [data, currentPage, pageSize, sortAsc, startDate, endDate, selectedState, selectedDistrict, selectedSchool, selectedCategory, selectedpsu]);

//   const handleExport = () => {
//     // ...existing code for export functionality...
//   };

//   return (
//     <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
//       <div className="p-6 border-b border-purple-200 dark:border-gray-700">
//         <HeaderButtons
//           exportType={exportType}
//           setExportType={setExportType}
//           handleExport={handleExport}
//           isAdmin={isAdmin}
//           setShowAddDataModal={onAddData}
//         />

//         <TableFilters
//           isAdmin={isAdmin}
//           startDate={startDate}
//           setStartDate={setStartDate}
//           endDate={endDate}
//           setEndDate={setEndDate}
//           selectedState={selectedState}
//           setSelectedState={setSelectedState}
//           selectedDistrict={selectedDistrict}
//           setSelectedDistrict={setSelectedDistrict}
//           selectedSchool={selectedSchool}
//           setSelectedSchool={setSelectedSchool}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           stateOptions={filterConfig.stateOptions}
//           districtOptions={filterConfig.districtOptions}
//           schoolOptions={filterConfig.schoolOptions}
//           categories={filterConfig.categories}
//           selectedProject={selectedProject}
//           selectedPsu={selectedpsu}
//           setSelectedPsu={setSelectedpsu}
//           psuOptions={filterConfig.psuOptions}
//         />
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="text-purple-800 bg-purple-50 dark:bg-gray-800 dark:text-purple-200">
//             <tr>
//               {columns.map((column, index) => (
//                 <th
//                   key={index}
//                   className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
//                 >
//                   <div className="flex justify-start items-center">
//                     {column.header}
//                     {column.sortable && (
//                       <button
//                         onClick={() => setSortAsc(!sortAsc)}
//                         className="ml-2"
//                       >
//                         {sortAsc ? <SortAscIcon /> : <SortDescIcon />}
//                       </button>
//                     )}
//                   </div>
//                 </th>
//               ))}
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
//                 {columns.map((column, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
//                   >
//                     {column.render ? column.render(row[column.field], row) : column.accessor(row)}
//                   </td>
//                 ))}
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

// export default BaseTable;