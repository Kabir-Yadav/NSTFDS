import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_components/Sidebar";
import SummaryCards from "./components/Summary";
import ChartSection from "./components/ChartSection";
import {
  fetchHierarchicalData,
  useStatsWithStateFilter,
} from "../../action/supabase_actions";
import { BarChartSection } from "./components/BarChart";
import {
  DashboardBackground1,
  DashboardBackground2,
} from "./components/background";

import AdminProjectSelectionForm from "./ProjectDetails/admin_ProjectSelectionForm";
import projects from "./components/navItems/projects";
import ThemeToggle from "./components/ThemeToggle";
import UserProfile from "./Sidebar_components/UserProfile";
import psuNavList from "./components/navItems/psu_nav_list";
import AdminPsuSelectionForm from "./ProjectDetails/admin-psuSelectionForm";

const AdminDashboard = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPsu, setSelectedPsu] = useState(null); // New state for PSU
  const [psu, setPsu] = useState("");
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const psuOptions = [];
  const { stats, loading, statesList, selectedState, setSelectedState } =
    useStatsWithStateFilter();

  const scrollRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrolled(scrollRef.current.scrollTop > 10);
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const user = {
    name: "Arun Kumar",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmnWamWQaGg46q1S3u0uMMgK3SZDBh1nBk-Q&s",
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHierarchicalData();
      setData(data);
    };
    const psuNames = psuNavList.map((p) => p.name);
    psuOptions.push(...psuNames);
    fetchData();
  }, []);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedState(null);
    setSelectedPsu(null); // Clear PSU selection when a project is selected
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handlePsuSelect = (psu) => {
    setSelectedPsu(psu);
    setSelectedProject(null); // Clear project selection when a PSU is selected
    setIsSidebarOpen(false);
  };

  const handleReturnHome = () => {
    setSelectedProject(null);
    setSelectedState("");
    setSelectedPsu(null); // Clear PSU selection when a project is selected
    setIsSidebarOpen(false);
  };

  return (
    <div
      className="flex h-screen w-screen dark:bg-[var(--color-background)] bg-[var(--color-background)] 
      overflow-hidden transition-all duration-500 ease-in-out"
    >
      <DashboardBackground1 />
      <DashboardBackground2 />
      <Sidebar
        user={user}
        projects={projects}
        psu={psuNavList}
        selectedProject={selectedProject}
        selectedPsu={selectedPsu} // Pass selectedPsu to Sidebar
        onPsuSelect={handlePsuSelect} // Pass PSU select handler
        onProjectSelect={handleProjectSelect}
        onReturnHome={handleReturnHome}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* Main content area - Updated padding/margin for mobile */}
      <div
        ref={scrollRef}
        key={"main"}
        className="relative flex-1 overflow-y-auto 
        transition-all duration-500 ease-in-out"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-surface-dark) transparent",
        }}
      >
        {/* {Sticky Header} */}
        <div
          className={`sticky top-0 z-20 py-4 px-4 flex justify-between transition-all duration-300 ${
            scrolled
              ? "bg-gray-300/40 dark:bg-gray-700/10 backdrop-blur-md drop-shadow-lg"
              : "bg-transparent"
          }`}
        >
          <div
            className="flex bg-[var(--color-primary)] rounded-full w-10 h-10 
                items-center justify-center shadow-md cursor-pointer
                hover:shadow-lg transition-all"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ aspectRatio: "1 / 1" }} // Ensures it remains a circle
          >
            <div className="space-y-1">
              <div className="flex">
                <div
                  className="rounded-sm h-[2px] transition-[width] duration-300 ease-in-out"
                  style={{ width: isSidebarOpen ? "100%" : "0px" }}
                />
                <div className="bg-white rounded-sm w-3 h-[2px]" />
              </div>
              <div className="flex">
                <div
                  className="rounded-sm h-[2px] transition-[width] duration-300 ease-in-out"
                  style={{ width: isSidebarOpen ? "10%" : "0px" }}
                />
                <div className="bg-white rounded-sm w-7 h-[2px]" />
              </div>
              <div className="flex">
                <div
                  className="rounded-sm h-[2px] transition-[width] duration-300 ease-in-out"
                  style={{ width: isSidebarOpen ? "30%" : "0px" }}
                />
                <div className="bg-white rounded-sm w-5 h-[3px]" />
              </div>
            </div>
          </div>
          {!selectedProject && !selectedPsu ? (
            <div className="flex flex-row space-x-1 ml-4 mr-4">
              <select
                onChange={(e) => setSelectedState(e.target.value)}
                value={selectedState}
                className="px-3 py-2 md:mr-4 w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg z-0 
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
              <select
                onChange={(e) => {
                  const selectedPsuName = e.target.value;
                  const selectedPsu = psuNavList.find(
                    (psu) => psu.name === selectedPsuName
                  );
                  if (selectedPsu) {
                    setPsu(selectedPsu.name);
                  } else {
                    setPsu("");
                  }
                }}
                value={psu || ""}
                className="px-3 py-2 w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg z-0 
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  All PSUs
                </option>
                {psuNavList.map((psu) => (
                  <option
                    key={psu.name}
                    value={psu.name}
                    className="bg-white dark:bg-gray-800"
                  >
                    {psu.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <></>
          )}
          <div className="flex-1" /> {/* Spacer */}
          <ThemeToggle />
          <span className="pr-2" />
          <UserProfile user={user} isOpen={isSidebarOpen} />
        </div>
        <div className="px-4 md:px-6 lg:px-8">
          <div>
            <h2 className="text-xl md:text-2xl font-outfit font-semibold text-[var(--color-text)]">
              {selectedProject
                ? selectedProject.name
                : selectedPsu
                ? selectedPsu.name
                : "Welcome to NSTFDS Dashboard"}
            </h2>
            <p className="font-redhat text-[var(--color-text-secondary)] mt-1">
              {selectedProject || selectedPsu
                ? "Select the following details to view data"
                : "Select a project to get started"}
            </p>
          </div>
          {/* Main Content - Added spacing for mobile */}

          <div className="theme-transition space-y-5 md:space-y-6 z-20 mb-10 md:mb-12">
            {!selectedProject && !selectedPsu ? (
              <>
                <div className="mb-4 md:mb-6 mt-2">
                  <SummaryCards
                    stats={stats}
                    loading={loading}
                    selectedState={selectedState}
                  />
                </div>
                <div className="mb-4 md:mb-6 ">
                  <ChartSection
                    selectedState={selectedState}
                    selectedPSU={psu}
                  />
                  <BarChartSection
                    stateList={statesList}
                    selectedState={selectedState}
                    selectedPsu={psu}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 md:mt-0">
                {selectedProject && (
                  <AdminProjectSelectionForm
                    key={selectedProject.id}
                    selectedProject={selectedProject}
                    data={data}
                    categories={selectedProject.categories}
                  />
                )}
                {selectedPsu && (
                  <AdminPsuSelectionForm
                    selectedPsu={selectedPsu}
                    data={data} // Pass the data for PSU
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
