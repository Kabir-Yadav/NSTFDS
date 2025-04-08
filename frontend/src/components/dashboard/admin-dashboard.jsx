import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_components/Sidebar";
import SummaryCards from "./Dashboard_components/Summary";
import ChartSection from "./Dashboard_components/ChartSection";
import AdminSelectionForm from "./ProjectDetails/admin-SelectionForm";

const AdminDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // New states for Add Data form
  const [showAddDataForm, setShowAddDataForm] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formDeviceCategory, setFormDeviceCategory] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formSerialId, setFormSerialId] = useState("");
  const [formPhoto, setFormPhoto] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleAddDataSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("date", formDate);
    formData.append("device_category", formDeviceCategory);
    formData.append("status", formStatus);
    formData.append("serial_id", formSerialId);
    if (formPhoto) {
      formData.append("photo", formPhoto);
    }

    try {
      const response = await fetch("http://localhost:8000/digital-procurements/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
      const data = await response.json();
      console.log("Data submitted:", data);
      // Reset form fields
      setFormDate("");
      setFormDeviceCategory("");
      setFormStatus("");
      setFormSerialId("");
      setFormPhoto(null);
      setShowAddDataForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePhotoChange = (e) => {
    setFormPhoto(e.target.files[0]);
  };
  const statesData = [
    { state: "Maharashtra", progress: 85 },
    { state: "Gujarat", progress: 78 },
    { state: "Karnataka", progress: 92 },
    { state: "Tamil Nadu", progress: 88 },
    { state: "Rajasthan", progress: 72 },
    { state: "MP", progress: 65 },
    { state: "UP", progress: 70 },
    { state: "Bihar", progress: 60 },
  ];
  // Dummy user profile
  const user = {
    name: "Arun Kumar",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmnWamWQaGg46q1S3u0uMMgK3SZDBh1nBk-Q&s",
  };
  const summaryStats = {
    totalStates: 28,
    totalDistricts: 156,
    totalSchools: 892,
    activeProjects: 5,
  };

  // Mock data - In a real application, this would come from an API
  const projects = [
    {
      id: 1,
      name: "Mentorship & Career Counselling",
      icon: "👥",
      categories: [
        "Career Guidance",
        "Academic Counselling",
        "Mental Health Support",
      ],
    },
    {
      id: 2,
      name: "Residential Training Project for EMRS Teachers",
      icon: "👨‍🏫",
      categories: [
        "Training Modules",
        "Teaching Resources",
        "Assessment Tools",
      ],
    },
    {
      id: 3,
      name: "Entrepreneurship Bootcamp for High School Students",
      icon: "💼",
      categories: [
        "Business Planning",
        "Market Research",
        "Financial Literacy",
      ],
    },
    {
      id: 4,
      name: "Digital Device Procurement",
      icon: "💻",
      categories: ["Laptops", "Tablets", "Interactive Boards"],
    },
    {
      id: 5,
      name: "Sanitary Pad Devices Procurement",
      icon: "📦",
      categories: ["Dispensers", "Disposal Units", "Hygiene Products"],
    },
  ];

  const states = ["Maharashtra", "Gujarat", "Karnataka"];
  const districts = ["District 1", "District 2", "District 3"];
  const schools = ["School 1", "School 2", "School 3"];

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedSchool(null);
    setSelectedCategory(null);
    // Close sidebar on mobile after selecting a project
    setIsSidebarOpen(false);
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedDistrict(null);
    setSelectedSchool(null);
    setSelectedCategory(null);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleReturnHome = () => {
    setSelectedProject(null);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedSchool(null);
    setSelectedCategory(null);
    // Optionally close sidebar on mobile
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)] transition-all duration-500 ease-in-out">
      <Sidebar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onReturnHome={handleReturnHome}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />


      {/* Main content area - Updated padding/margin for mobile */}
      <div className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out px-4 md:px-6 lg:px-8 mt-24 md:mt-10">
        <div
          style={{
            zindex: "-99",
            top: "auto",
            bottom: "10%",
            width: "300px",
            height: "300px",
            right: "auto",
            WebkitFilter: "blur(200px)",
            filter: "blur(200px)",
            backgroundColor: "rgba(var(--color-primary-rgb), 0.3)",
            position: "absolute",
          }}
        />
        <div
          style={{
            zindex: "-99",
            top: "13%",
            bottom: "auto",
            left: "auto",
            right: "0%",
            width: "300px",
            height: "300px",
            WebkitFilter: "blur(200px)",
            filter: "blur(200px)",
            backgroundColor: "rgba(var(--color-primary-rgb), 0.3)",
            position: "absolute",
          }}
        />

        {/* Desktop Header */}
        <div className="mb-6 md:mb-8 md:block">
          <div
            className="hidden md:flex mb-4 p-1 bg-[var(--color-secondary)] dark:bg-[var(--color-accent)] rounded-full w-12 h-12 items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} // Toggle sidebar state
          >
            <div className="space-y-1">
              <div className="bg-gray-300 dark:bg-gray-500 rounded-sm w-5 h-[3px]" />
              <div className="bg-gray-400 dark:bg-gray-600 rounded-sm w-7 h-[3px]" />
              <div className="bg-gray-300 dark:bg-gray-500 rounded-sm w-4 h-[3px]" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl hidden md:block md:text-2xl font-outfit font-semibold text-[var(--color-text)]">
                {selectedProject
                  ? selectedProject.name
                  : "Welcome to NSTFDS Dashboard"}
              </h2>
              <p className="font-redhat text-[var(--color-text-secondary)] mt-1">
                {selectedProject
                  ? "Select the following details to view data"
                  : "Select a project to get started"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Added spacing for mobile */}
        {!selectedProject ?
          (
            <div className="flex items-center justify-between mb-4">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  All States
                </option>
                {statesData.map((state) => (
                  <option
                    key={state.state}
                    value={state.state}
                    className="bg-white dark:bg-gray-800"
                  >
                    {state.state}
                  </option>
                ))}
              </select>
            </div>
          ) :
          <></>
        }
        <div className="theme-transition space-y-5 z-0 md:space-y-6 mb-10 md:mb-12">
          {!selectedProject ? (
            <>
              <div className="mb-4 md:mb-6">
                <SummaryCards stats={summaryStats} />
              </div>
              <div className="mb-4 md:mb-6">
                <ChartSection />
              </div>
            </>
          ) : (
            <div className="mt-4 md:mt-0">
              <AdminSelectionForm
                selectedProject={selectedProject} // Make sure this is passed
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                selectedSchool={selectedSchool}
                selectedCategory={selectedCategory}
                states={states}
                districts={districts}
                schools={schools}
                categories={selectedProject.categories}
                onStateSelect={setSelectedState}
                onDistrictSelect={setSelectedDistrict}
                onSchoolSelect={setSelectedSchool}
                onCategorySelect={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;




