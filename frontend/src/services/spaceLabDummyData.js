// // Dummy data service for Space Lab project
// // Replace these functions with actual database calls once backend is ready

// import {
//     Dispatch,
//     DispatchComponent,
//     DELIVERY_STATUS_OPTIONS,
//     INSTALLATION_STATUS_OPTIONS
// } from "../models/dispatchModels";

// // Components are now fetched from database - no hardcoded fallback
// // Re-export empty array for backward compatibility
// export const SPACE_LAB_COMPONENTS = [];

// export { DELIVERY_STATUS_OPTIONS, INSTALLATION_STATUS_OPTIONS };

// // Helper function to create dispatch with components using models
// const createDispatch = ({
//     id,
//     school_id,
//     components,
//     dispatch_date,
//     delivery_status = "Pending",
//     installation_status = "Not Started",
//     delivery_proof_url = null,
//     installation_proof_url = null,
//     is_installed = false,
//     tracking_number = null,
//     vendor_name = null,
//     purchase_order = null,
//     invoice_number = null,
//     warranty_period = null,
//     installation_date = null,
//     technician_name = null,
//     contact_person = null,
//     contact_phone = null,
//     remarks = null,
// }) => {
//     const dispatchComponents = components.map(comp =>
//         new DispatchComponent({
//             id: `${id}_${comp.component_name.replace(/\s+/g, '_')}`,
//             component_name: comp.component_name,
//             quantity: comp.quantity,
//             unit_cost: comp.unit_cost,
//             expected_delivery_date: comp.expected_delivery_date,
//             remarks: comp.remarks || null,
//         })
//     );

//     const dispatch = new Dispatch({
//         id,
//         school_id,
//         components: dispatchComponents,
//         dispatch_date,
//         delivery_status,
//         installation_status,
//         delivery_proof_url,
//         installation_proof_url,
//         is_installed,
//         tracking_number,
//         vendor_name,
//         purchase_order,
//         invoice_number,
//         warranty_period,
//         installation_date,
//         technician_name,
//         contact_person,
//         contact_phone,
//         remarks,
//     });

//     return dispatch.toJSON();
// };

// // Helper function to randomly select components ensuring no duplicates
// const selectRandomComponents = (availableComponents, count, excludeSet = new Set()) => {
//     const available = availableComponents.filter(comp => !excludeSet.has(comp));
//     const shuffled = [...available].sort(() => Math.random() - 0.5);
//     return shuffled.slice(0, Math.min(count, available.length));
// };

// // In-memory storage (replace with actual database)
// let schoolsData = [
//     {
//         id: 1,
//         state: "Tamil Nadu",
//         district: "Chennai",
//         school_name: "Government High School, Anna Nagar",
//         psu_name: "IOCL",
//         is_ready: false,
//         certificate_url: null,
//         certificate_uploaded_date: null,
//         dispatches: []
//     },
//     {
//         id: 2,
//         state: "Tamil Nadu",
//         district: "Chennai",
//         school_name: "Corporation School, T Nagar",
//         psu_name: "BPCL",
//         is_ready: true,
//         certificate_url: "https://example.com/cert1.pdf",
//         certificate_uploaded_date: "2024-01-15",
//         dispatches: [
//             // Dispatch 1: Multiple components (3)
//             createDispatch({
//                 id: 1,
//                 school_id: 2,
//                 components: [
//                     {
//                         component_name: "LVM3 Launch Vehicle Demo Model",
//                         quantity: 1,
//                         unit_cost: 50000,
//                         expected_delivery_date: "2024-02-15",
//                         remarks: "Handle with care. Fragile components."
//                     },
//                     {
//                         component_name: "EO Satellite Demo Model",
//                         quantity: 1,
//                         unit_cost: 45000,
//                         expected_delivery_date: "2024-02-20",
//                         remarks: "Satellite model with solar panels."
//                     },
//                     {
//                         component_name: "Static Launch Vehicle Models",
//                         quantity: 2,
//                         unit_cost: 15000,
//                         expected_delivery_date: "2024-02-18",
//                         remarks: "Two static models for display."
//                     }
//                 ],
//                 dispatch_date: "2024-01-20",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_lvm3.jpg",
//                 installation_status: "In Progress",
//                 tracking_number: "TRK123456789",
//                 vendor_name: "Space Components Ltd.",
//                 purchase_order: "PO-2024-001",
//                 invoice_number: "INV-2024-001",
//                 warranty_period: "2 Years",
//                 technician_name: "Ravi Kumar",
//                 contact_person: "Rajesh Kumar",
//                 contact_phone: "+91 98765 43210",
//                 remarks: "Multiple components in single dispatch."
//             }),
//             // Dispatch 2: Single component
//             createDispatch({
//                 id: 2,
//                 school_id: 2,
//                 components: [
//                     {
//                         component_name: "Table-Top Demo Models",
//                         quantity: 5,
//                         unit_cost: 8000,
//                         expected_delivery_date: "2024-02-12",
//                         remarks: "Installed in multiple classrooms."
//                     }
//                 ],
//                 dispatch_date: "2024-01-22",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_tabletop.jpg",
//                 installation_status: "Completed",
//                 tracking_number: "TRK123456792",
//                 vendor_name: "Educational Supplies Co.",
//                 purchase_order: "PO-2024-004",
//                 invoice_number: "INV-2024-004",
//                 warranty_period: "1 Year",
//                 installation_date: "2024-02-14",
//                 technician_name: "Amit Sharma",
//                 contact_person: "Priya Patel",
//                 contact_phone: "+91 98765 11111",
//             }),
//             // Dispatch 3: Multiple components (2)
//             createDispatch({
//                 id: 3,
//                 school_id: 2,
//                 components: [
//                     {
//                         component_name: "ISRO Programme Posters",
//                         quantity: 10,
//                         unit_cost: 500,
//                         expected_delivery_date: "2024-02-10",
//                         remarks: "Successfully installed in science lab."
//                     },
//                     {
//                         component_name: "ISRO Space Books",
//                         quantity: 50,
//                         unit_cost: 400,
//                         expected_delivery_date: "2024-02-08",
//                         remarks: "Books cataloged and placed in school library."
//                     }
//                 ],
//                 dispatch_date: "2024-01-18",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_posters.jpg",
//                 installation_status: "Installed",
//                 is_installed: true,
//                 installation_proof_url: "https://example.com/install_posters.jpg",
//                 tracking_number: "TRK987654321",
//                 vendor_name: "Educational Supplies Co.",
//                 purchase_order: "PO-2024-005",
//                 invoice_number: "INV-2024-005",
//                 warranty_period: "1 Year",
//                 installation_date: "2024-02-12",
//                 technician_name: "Amit Sharma",
//                 contact_person: "Priya Patel",
//                 contact_phone: "+91 98765 11111",
//             }),
//             // Dispatch 4: Single component
//             createDispatch({
//                 id: 4,
//                 school_id: 2,
//                 components: [
//                     {
//                         component_name: "Startracker Telescope + Accessories",
//                         quantity: 1,
//                         unit_cost: 75000,
//                         expected_delivery_date: "2024-02-25",
//                         remarks: "Includes telescope, mount, and accessories. Requires clear sky access."
//                     }
//                 ],
//                 dispatch_date: "2024-02-01",
//                 delivery_status: "Dispatched",
//                 tracking_number: "TRK123456793",
//                 vendor_name: "Astronomical Instruments Pvt. Ltd.",
//                 purchase_order: "PO-2024-006",
//                 invoice_number: "INV-2024-006",
//                 warranty_period: "3 Years",
//                 contact_person: "Vikram Singh",
//                 contact_phone: "+91 98765 43212",
//             })
//         ]
//     },
//     {
//         id: 3,
//         state: "Karnataka",
//         district: "Bangalore",
//         school_name: "Government School, Whitefield",
//         psu_name: "IOCL",
//         is_ready: true,
//         certificate_url: "https://example.com/cert2.pdf",
//         certificate_uploaded_date: "2024-01-10",
//         dispatches: [
//             // Dispatch 1: Multiple components (2)
//             createDispatch({
//                 id: 11,
//                 school_id: 3,
//                 components: [
//                     {
//                         component_name: "LVM3 Launch Vehicle Demo Model",
//                         quantity: 1,
//                         unit_cost: 50000,
//                         expected_delivery_date: "2024-02-18",
//                         remarks: "Successfully installed in main hall."
//                     },
//                     {
//                         component_name: "EO Satellite Demo Model",
//                         quantity: 1,
//                         unit_cost: 45000,
//                         expected_delivery_date: "2024-02-22",
//                         remarks: "Satellite model installation in progress."
//                     }
//                 ],
//                 dispatch_date: "2024-01-25",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_lvm3_2.jpg",
//                 installation_status: "Installed",
//                 is_installed: true,
//                 installation_proof_url: "https://example.com/install_lvm3.jpg",
//                 tracking_number: "TRK223456789",
//                 vendor_name: "Space Components Ltd.",
//                 purchase_order: "PO-2024-101",
//                 invoice_number: "INV-2024-101",
//                 warranty_period: "2 Years",
//                 installation_date: "2024-02-20",
//                 technician_name: "Suresh Kumar",
//                 contact_person: "Arun Kumar",
//                 contact_phone: "+91 98765 54321",
//             }),
//             // Dispatch 2: Single component
//             createDispatch({
//                 id: 12,
//                 school_id: 3,
//                 components: [
//                     {
//                         component_name: "Static Launch Vehicle Models",
//                         quantity: 2,
//                         unit_cost: 15000,
//                         expected_delivery_date: "2024-02-20",
//                         remarks: "Models displayed in corridor."
//                     }
//                 ],
//                 dispatch_date: "2024-02-01",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_static_2.jpg",
//                 installation_status: "Installed",
//                 is_installed: true,
//                 installation_proof_url: "https://example.com/install_static.jpg",
//                 tracking_number: "TRK223456791",
//                 vendor_name: "Model Makers India",
//                 purchase_order: "PO-2024-103",
//                 invoice_number: "INV-2024-103",
//                 warranty_period: "1 Year",
//                 installation_date: "2024-02-21",
//                 technician_name: "Rajesh Nair",
//                 contact_person: "Suresh Menon",
//                 contact_phone: "+91 98765 54322",
//             }),
//             // Dispatch 3: Multiple components (3)
//             createDispatch({
//                 id: 13,
//                 school_id: 3,
//                 components: [
//                     {
//                         component_name: "ISRO Programme Posters",
//                         quantity: 10,
//                         unit_cost: 500,
//                         expected_delivery_date: "2024-02-12",
//                         remarks: "Posters installed in all classrooms."
//                     },
//                     {
//                         component_name: "ISRO Space Books",
//                         quantity: 50,
//                         unit_cost: 400,
//                         expected_delivery_date: "2024-02-10",
//                         remarks: "Books organized in library catalog."
//                     },
//                     {
//                         component_name: "Space/Science/Math TLM Kits",
//                         quantity: 15,
//                         unit_cost: 3000,
//                         expected_delivery_date: "2024-02-18",
//                         remarks: "TLM kits for multiple subjects."
//                     }
//                 ],
//                 dispatch_date: "2024-01-20",
//                 delivery_status: "Delivered",
//                 delivery_proof_url: "https://example.com/delivery_posters_2.jpg",
//                 installation_status: "Installed",
//                 is_installed: true,
//                 installation_proof_url: "https://example.com/install_posters_2.jpg",
//                 tracking_number: "TRK223456793",
//                 vendor_name: "Educational Supplies Co.",
//                 purchase_order: "PO-2024-105",
//                 invoice_number: "INV-2024-105",
//                 warranty_period: "1 Year",
//                 installation_date: "2024-02-13",
//                 technician_name: "Mohan Das",
//                 contact_person: "Priya Patel",
//                 contact_phone: "+91 98765 11111",
//             }),
//             // Dispatch 4: Single component
//             createDispatch({
//                 id: 14,
//                 school_id: 3,
//                 components: [
//                     {
//                         component_name: "Startracker Telescope + Accessories",
//                         quantity: 1,
//                         unit_cost: 75000,
//                         expected_delivery_date: "2024-02-28",
//                         remarks: "Telescope requires rooftop installation."
//                     }
//                 ],
//                 dispatch_date: "2024-02-08",
//                 delivery_status: "Dispatched",
//                 tracking_number: "TRK223456794",
//                 vendor_name: "Astronomical Instruments Pvt. Ltd.",
//                 purchase_order: "PO-2024-106",
//                 invoice_number: "INV-2024-106",
//                 warranty_period: "3 Years",
//                 contact_person: "Vikram Singh",
//                 contact_phone: "+91 98765 43212",
//             }),
//             // Dispatch 5: Multiple components (2)
//             createDispatch({
//                 id: 15,
//                 school_id: 3,
//                 components: [
//                     {
//                         component_name: "CanSat Working Model",
//                         quantity: 2,
//                         unit_cost: 25000,
//                         expected_delivery_date: "2024-02-25",
//                         remarks: "Waiting for vendor confirmation."
//                     },
//                     {
//                         component_name: "ISRO Timeline Exhibit",
//                         quantity: 1,
//                         unit_cost: 35000,
//                         expected_delivery_date: "2024-03-05",
//                         remarks: "Timeline exhibit to be installed in main auditorium."
//                     }
//                 ],
//                 dispatch_date: "2024-02-10",
//                 delivery_status: "Pending",
//                 tracking_number: null,
//                 vendor_name: "Tech Innovations Pvt. Ltd.",
//                 purchase_order: "PO-2024-107",
//                 invoice_number: "INV-2024-107",
//                 warranty_period: "2 Years",
//                 contact_person: "Anil Kumar",
//                 contact_phone: "+91 98765 43213",
//             })
//         ]
//     },
//     {
//         id: 4,
//         state: "Maharashtra",
//         district: "Mumbai",
//         school_name: "Municipal School, Andheri",
//         psu_name: "BPCL",
//         is_ready: false,
//         certificate_url: null,
//         certificate_uploaded_date: null,
//         dispatches: []
//     },
//     {
//         id: 5,
//         state: "Kerala",
//         district: "Thiruvananthapuram",
//         school_name: "Government High School, Kovalam",
//         psu_name: "IOCL",
//         is_ready: true,
//         certificate_url: "https://example.com/cert3.pdf",
//         certificate_uploaded_date: "2024-01-12",
//         dispatches: [
//             // Dispatch 1: Multiple components (2)
//             createDispatch({
//                 id: 21,
//                 school_id: 5,
//                 components: [
//                     {
//                         component_name: "LVM3 Launch Vehicle Demo Model",
//                         quantity: 1,
//                         unit_cost: 50000,
//                         expected_delivery_date: "2024-02-25",
//                         remarks: "Awaiting dispatch confirmation."
//                     },
//                     {
//                         component_name: "EO Satellite Demo Model",
//                         quantity: 1,
//                         unit_cost: 45000,
//                         expected_delivery_date: "2024-02-28",
//                         remarks: "Order placed, awaiting processing."
//                     }
//                 ],
//                 dispatch_date: "2024-02-07",
//                 delivery_status: "Pending",
//                 tracking_number: null,
//                 vendor_name: "Space Components Ltd.",
//                 purchase_order: "PO-2024-201",
//                 invoice_number: "INV-2024-201",
//                 warranty_period: "2 Years",
//                 contact_person: "Kiran Nair",
//                 contact_phone: "+91 98765 65432",
//             }),
//             // Dispatch 2: Single component
//             createDispatch({
//                 id: 22,
//                 school_id: 5,
//                 components: [
//                     {
//                         component_name: "Static Launch Vehicle Models",
//                         quantity: 2,
//                         unit_cost: 15000,
//                         expected_delivery_date: "2024-02-22",
//                         remarks: "Models dispatched recently."
//                     }
//                 ],
//                 dispatch_date: "2024-02-02",
//                 delivery_status: "Dispatched",
//                 tracking_number: "TRK333444555",
//                 vendor_name: "Model Makers India",
//                 purchase_order: "PO-2024-203",
//                 invoice_number: "INV-2024-203",
//                 warranty_period: "1 Year",
//                 contact_person: "Suresh Menon",
//                 contact_phone: "+91 98765 43211",
//             })
//         ]
//     }
// ];

// // Fetch all schools data for Space Lab project
// export const fetchSpaceLabSchools = async () => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));
//     return { data: [...schoolsData], error: null };
// };

// // Toggle school ready status
// export const toggleSchoolReady = async (schoolId, isReady) => {
//     await new Promise(resolve => setTimeout(resolve, 300));

//     const school = schoolsData.find(s => s.id === schoolId);
//     if (!school) {
//         return { data: null, error: "School not found" };
//     }

//     // If toggling to false, also clear certificate
//     if (!isReady) {
//         school.is_ready = false;
//         school.certificate_url = null;
//         school.certificate_uploaded_date = null;
//     } else {
//         school.is_ready = true;
//     }

//     return { data: school, error: null };
// };

// // Upload certificate for a school
// export const uploadCertificate = async (schoolId, file) => {
//     await new Promise(resolve => setTimeout(resolve, 800));

//     const school = schoolsData.find(s => s.id === schoolId);
//     if (!school) {
//         return { data: null, error: "School not found" };
//     }

//     if (!school.is_ready) {
//         return { data: null, error: "School must be marked as ready first" };
//     }

//     // Simulate file upload and generate URL
//     const mockUrl = `https://example.com/certificates/${schoolId}_${Date.now()}.pdf`;
//     school.certificate_url = mockUrl;
//     school.certificate_uploaded_date = new Date().toISOString().split('T')[0];

//     return { data: school, error: null };
// };

// // Add a dispatch for a school
// export const addDispatch = async (schoolId, dispatchData) => {
//     await new Promise(resolve => setTimeout(resolve, 500));

//     const school = schoolsData.find(s => s.id === schoolId);
//     if (!school) {
//         return { data: null, error: "School not found" };
//     }

//     if (!school.is_ready || !school.certificate_url) {
//         return { data: null, error: "School must be ready and have certificate uploaded" };
//     }

//     // Support both new format (components array) and legacy format (single component)
//     let components = [];
//     if (dispatchData.components && Array.isArray(dispatchData.components)) {
//         // New format - multiple components
//         components = dispatchData.components.map(comp =>
//             new DispatchComponent({
//                 id: Date.now() + Math.random(), // Generate unique ID
//                 component_name: comp.component_name,
//                 quantity: comp.quantity,
//                 unit_cost: comp.unit_cost,
//                 expected_delivery_date: comp.expected_delivery_date,
//                 remarks: comp.remarks || null,
//             })
//         );
//     } else {
//         // Legacy format - single component
//         components = [
//             new DispatchComponent({
//                 id: Date.now() + Math.random(),
//                 component_name: dispatchData.component,
//                 quantity: dispatchData.quantity,
//                 unit_cost: dispatchData.unit_cost,
//                 expected_delivery_date: dispatchData.expected_delivery_date,
//                 remarks: null,
//             })
//         ];
//     }

//     const newDispatch = new Dispatch({
//         id: Date.now(),
//         school_id: schoolId,
//         components: components,
//         dispatch_date: new Date().toISOString().split('T')[0],
//         delivery_status: "Pending",
//         installation_status: "Not Started",
//     });

//     // Convert to JSON for storage (models handle serialization)
//     school.dispatches.push(newDispatch.toJSON());

//     return { data: newDispatch.toJSON(), error: null };
// };

// // Update dispatch details (delivery proof, installation status, etc.)
// export const updateDispatch = async (schoolId, dispatchId, updates) => {
//     await new Promise(resolve => setTimeout(resolve, 500));

//     const school = schoolsData.find(s => s.id === schoolId);
//     if (!school) {
//         return { data: null, error: "School not found" };
//     }

//     const dispatch = school.dispatches.find(d => d.id === dispatchId);
//     if (!dispatch) {
//         return { data: null, error: "Dispatch not found" };
//     }

//     Object.assign(dispatch, updates);

//     return { data: dispatch, error: null };
// };

// // Upload delivery proof
// export const uploadDeliveryProof = async (schoolId, dispatchId, file) => {
//     await new Promise(resolve => setTimeout(resolve, 800));

//     const mockUrl = `https://example.com/delivery/${schoolId}_${dispatchId}_${Date.now()}.jpg`;

//     return updateDispatch(schoolId, dispatchId, {
//         delivery_proof_url: mockUrl
//     });
// };

// // Upload installation proof
// export const uploadInstallationProof = async (schoolId, dispatchId, file) => {
//     await new Promise(resolve => setTimeout(resolve, 800));

//     const mockUrl = `https://example.com/installation/${schoolId}_${dispatchId}_${Date.now()}.jpg`;

//     return updateDispatch(schoolId, dispatchId, {
//         installation_proof_url: mockUrl,
//         is_installed: true
//     });
// };

// // Get statistics for a school
// // Status options are now imported from dispatchModels.js

// // Update dispatch status
// export const updateDispatchStatus = async (schoolId, dispatchId, updates) => {
//     await new Promise(resolve => setTimeout(resolve, 300));

//     const school = schoolsData.find(s => s.id === schoolId);
//     if (!school) {
//         return { data: null, error: "School not found" };
//     }

//     const dispatch = school.dispatches.find(d => d.id === dispatchId);
//     if (!dispatch) {
//         return { data: null, error: "Dispatch not found" };
//     }

//     // Update the dispatch with new status values
//     Object.assign(dispatch, updates);

//     // Auto-update is_installed if installation status is "Installed"
//     if (updates.installation_status === "Installed") {
//         dispatch.is_installed = true;
//     } else if (updates.installation_status && updates.installation_status !== "Installed") {
//         dispatch.is_installed = false;
//     }

//     return { data: dispatch, error: null };
// };

// export const getSchoolStats = (school) => {
//     // Note: totalComponents should be fetched from database (project category_list)
//     // For now, calculate from dispatched components
//     const dispatchedComponents = new Set(school.dispatches.map(d => d.component)).size;
//     const installedComponents = school.dispatches.filter(d => d.is_installed).length;

//     return {
//         totalComponents: 0, // Should be fetched from database
//         dispatchedComponents,
//         installedComponents,
//         pendingComponents: 0 // Should be calculated from database components
//     };
// };

