import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_components/Sidebar";
import SummaryCards from "./components/Summary";
import ChartSection from "./components/ChartSection";
import SelectionForm from "./ProjectDetails/SelectionForm2";
import {
  fetchHierarchicalData,
  useStatsWithStateFilter,
} from "../../action/supabase_actions";
import { BarChartSection } from "./components/BarChart";
import {
  DashboardBackground1,
  DashboardBackground2,
} from "./components/background";

const UserDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [data, setData] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const { stats, loading, statesList, selectedState, setSelectedState } =
    useStatsWithStateFilter();
  // Dummy user profile
  const user = {
    name: "Arun Kumar",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmnWamWQaGg46q1S3u0uMMgK3SZDBh1nBk-Q&s",
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHierarchicalData();
      setData(data);
    };
    fetchData();
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedState(null);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleReturnHome = () => {
    setSelectedProject(null);
    setSelectedState(null);
    // Optionally close sidebar on mobile
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)] transition-all duration-500 ease-in-out">
      <DashboardBackground1 />
      <DashboardBackground2 />
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

      <div className=" relative flex-1 overflow-y-auto transition-all duration-500 ease-in-out px-4 md:px-6 lg:px-8 mt-24 md:mt-10">
        <div className="mb-6 md:mb-8 md:block">
          <div
            className="hidden md:flex mb-4 p-1 bg-[var(--color-secondary)] dark:bg-[var(--color-accent)] rounded-full w-12 h-12 items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
        {!selectedProject ? (
          <div className="flex items-center justify-between mb-4">
            <select
              onChange={(e) => setSelectedState(e.target.value)}
              value={selectedState}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg z-0 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-white dark:bg-gray-800">
                All States
              </option>
              {statesList.map((state) => (
                <option
                  key={state}
                  value={state}
                  className="bg-white dark:bg-gray-800"
                >
                  {state}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <></>
        )}
        <div className="theme-transition space-y-5 md:space-y-6 z-20 mb-10 md:mb-12">
          {!selectedProject ? (
            <>
              <div className="mb-4 md:mb-6">
                <SummaryCards stats={stats} loading={loading} selectedState={selectedState} />
              </div>
              <div className="mb-4 md:mb-6 ">
                <ChartSection
                  selectedState={selectedState}
                />
                <BarChartSection stateList={statesList} />
              </div>
            </>
          ) : (
            <div className="mt-4 md:mt-0 ">
              <SelectionForm
                key={selectedProject.id}
                selectedProject={selectedProject}
                data={data}
                categories={selectedProject.categories}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
