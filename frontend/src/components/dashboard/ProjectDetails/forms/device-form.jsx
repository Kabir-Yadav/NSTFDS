// import React, { useEffect, useState } from "react";
// import {
//   insertDigitalProcurement,
//   isDigitalProcurementActive,
//   uploadProofImage,
// } from "../../../../action/supabase_actions";

// const DeviceForm = ({
//   isOpen,
//   hierarchicalData,
//   onClose,
//   categories,
//   status,
// }) => {
//   const [formDate, setFormDate] = useState("");
//   const [formDeviceCategory, setFormDeviceCategory] = useState("");
//   const [formStatus, setFormStatus] = useState("");
//   const [formCost, setFormCost] = useState("");
//   const [formPhoto, setFormPhoto] = useState(null);
//   const [selectedPsu, setSelectedPsu] = useState("");
//   const [selectedState, setSelectedState] = useState("");
//   const [selectedDistrict, setSelectedDistrict] = useState("");
//   const [selectedSchool, setSelectedSchool] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [loading, setLoading] = useState(false); // Added loading state

//   const handleClose = () => {
//     setFormDate("");
//     setSelectedPsu("");
//     setSelectedState("");
//     setSelectedDistrict("");
//     setSelectedSchool("");
//     setFormDeviceCategory("");
//     setFormStatus("");
//     setFormCost("");
//     setFormPhoto(null);
//     setErrorMessage("");
//     setLoading(false); // Reset loading state
//     onClose();
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formDate ||
//       !selectedPsu ||
//       !selectedState ||
//       !selectedDistrict ||
//       !selectedSchool ||
//       !formDeviceCategory ||
//       !formStatus ||
//       !formCost ||
//       !formPhoto
//     ) {
//       setErrorMessage("Please fill in all fields.");
//       return;
//     }

//     setErrorMessage("");
//     setLoading(true); // Set loading to true

//     try {
//       // ⬆️ Upload image to bucket
//       const uploadedUrl = await uploadProofImage({
//         file: formPhoto,
//         device: true,
//       });
//       if (!uploadedUrl) {
//         setErrorMessage("Image upload failed.");
//         setLoading(false); // Reset loading state
//         return;
//       }

//       // 📤 Insert into digital_device_procurement
//       const formData = {
//         state_name: selectedState,
//         district_name: selectedDistrict,
//         school_name: selectedSchool,
//         item_name: formDeviceCategory,
//         cost: Number(formCost),
//         status: formStatus,
//         delivery_date: formDate,
//         proof_image_url: uploadedUrl,
//       };

//       const result = await insertDigitalProcurement(formData);
//       if (result.success) {
//         // Reset form
//         handleClose();
//       } else {
//         setErrorMessage("Error saving data to database.");
//       }
//     } catch (error) {
//       setErrorMessage("An unexpected error occurred.");
//     } finally {
//       setLoading(false); // Reset loading state
//     }
//   };
//   const stateOptions = hierarchicalData
//     ? [...new Set(hierarchicalData.map((item) => item.state_name))]
//     : [];

//   const districtOptions =
//     (selectedState &&
//       hierarchicalData
//         .find((item) => item.state_name === selectedState)
//         ?.districts.map((d) => d.district_name)) ||
//     [];
//   const schoolOptions =
//     (selectedState &&
//       selectedDistrict &&
//       hierarchicalData
//         .find((item) => item.state_name === selectedState)
//         ?.districts.find((d) => d.district_name === selectedDistrict)
//         ?.schools) ||
//     [];

//   if (!isOpen) return null;
//   console.log(status);
//   const renderSelect = ({
//     label,
//     value,
//     options,
//     onChange,
//     placeholder,
//     disabled = false,
//   }) => (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         {label}
//       </label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full border px-3 py-2 rounded-lg dark:disabled:bg-[var(--color-text-secondary)] 
//           disabled:bg-[var(--color-text-disabled)] bg-white"
//         disabled={disabled}
//         required
//       >
//         <option value="">{placeholder}</option>
//         {options.map((option) => (
//           <option key={option} value={option}>
//             {option}
//           </option>
//         ))}
//       </select>
//     </div>
//   );

//   return (
//     <div className="min-h-screen fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
//       <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl relative">
//         <div className="max-h-full overflow-y-auto w-full p-7">
//           <h2 className="text-3xl font-display font-semibold text-gray-900 mb-6">
//             Add Digital Device Data
//           </h2>
//           {errorMessage && (
//             <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
//               {errorMessage}
//             </div>
//           )}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Delivery Date
//               </label>
//               <input
//                 type="date"
//                 value={formDate}
//                 onChange={(e) => setFormDate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               {renderSelect({
//                 label: "State",
//                 value: selectedState,
//                 options: stateOptions,
//                 onChange: setSelectedState,
//                 placeholder: "Select a state",
//               })}
//               {renderSelect({
//                 label: "District",
//                 value: selectedDistrict,
//                 options: districtOptions,
//                 onChange: setSelectedDistrict,
//                 placeholder: "Select a district",
//                 disabled: !selectedState,
//               })}
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               {renderSelect({
//                 label: "School",
//                 value: selectedSchool,
//                 options: schoolOptions,
//                 onChange: setSelectedSchool,
//                 placeholder: "Select a school",
//                 disabled: !selectedDistrict,
//               })}
//               {renderSelect({
//                 label: "Categories",
//                 value: formDeviceCategory,
//                 options: categories,
//                 onChange: setFormDeviceCategory,
//                 placeholder: "Select a category",
//               })}
//             </div>

//             <div>
//               {renderSelect({
//                 label: "Status",
//                 value: formStatus,
//                 options: status,
//                 onChange: setFormStatus,
//                 placeholder: "Select status",
//               })}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
//                   Cost
//                 </label>
//                 <input
//                   type="number"
//                   value={formCost}
//                   onChange={(e) => setFormCost(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
//                   Proof Photo
//                 </label>
//                 <input
//                   type="file"
//                   onChange={(e) => setFormPhoto(e.target.files[0])}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   accept="image/*"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={handleClose}
//                 className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
//                   loading
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-purple-600 hover:bg-purple-700 text-white"
//                 }`}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <svg
//                     className="animate-spin h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                     ></path>
//                   </svg>
//                 ) : (
//                   "Submit"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeviceForm;
