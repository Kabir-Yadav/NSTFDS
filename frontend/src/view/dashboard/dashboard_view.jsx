import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/sidebar_components/Sidebar";
import SummaryCards from "../../components/dashboard_components/SummaryCards";
import DashboardChartSection from "../../components/dashboard_components/DashboardChartSection";
import {
  fetchHierarchicalData,
  fetchProjectsAndPsu,
  useStatsWithStateFilter,
  fetchDashboardOnlyPSUData,
  fetchDashboardBothStatePSUData,
  fetchBudgetUtilization,
  fetchProjectCompletionRate,
  fetchSchoolImplementationRate,
  fetchDistrictCompletionRate,
} from "../../action/supabase_actions";
import { BarChartSection } from "../../components/dashboard_components/BarChart";
import {
  DashboardBackground1,
  DashboardBackground2,
} from "../../components/ui/background";

import ThemeToggle from "../../components/ui/ThemeToggle";
import UserProfile from "../../components/sidebar_components/UserProfile";
import ProjectSelectionForm from "../project_form/projectSelectionForm";
import PsuSelectionForm from "../psu_form/psu_Selection_form";
import { useAuth } from "../../context/AuthContext";

const DashboardView = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPsuProject, setSelectedPsuProject] = useState(null);
  const [selectedNavPsu, setSelectedNavPsu] = useState("");
  const [psu, setPsu] = useState("");
  const [hierarchicalData, setHierarchicalData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [psuNavList, setPsuNavList] = useState([]);
  const [psuOptions, setPsuOptions] = useState([]);

  //------------------------------------USER AUTHENTICATION------------------------------------------------------------
  const {
    isAuthenticated,
    loading: authLoading,
    role,
    psu: userPsu,
    org: userOrg,
    logout,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const isAdmin = role === "admin";
  const isPsuUser = role === "psu_viewer";

  //------------------------------------PROJECT FILTERING------------------------------------------------------------

  // Filter projects based on user's PSU
  const getFilteredProjects = () => {
    if (!isPsuUser || !userPsu) {
      return projects;
    }

    // Find the PSU data for the current user
    const userPsuData = psuNavList.find((psu) => psu.name === userPsu);
    if (!userPsuData) {
      return projects;
    }

    // Filter projects to only include those belonging to the user's PSU
    return projects.filter((project) =>
      userPsuData.projects.includes(project.name)
    );
  };

  //------------------------------------SCROLLING------------------------------------------------------------

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

  //------------------------------------DATA FETCHING------------------------------------------------------------

  const { stats, loading, statesList, selectedState, setSelectedState } =
    useStatsWithStateFilter();
  const [psuStats, setPsuStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardOnlyPSUData, setDashboardOnlyPSUData] = useState(null);
  const [dashboardBothStatePSUData, setDashboardBothStatePSUData] =
    useState(null);
  const [filteredStatesList, setFilteredStatesList] = useState([]);

  // Chart metrics data (for when no PSU is selected)
  const [chartMetrics, setChartMetrics] = useState({
    completionRate: 0,
    budgetUtilization: 0,
    implementationRate: 0,
    budgetData: {
      total_spent: 0,
      allocated_budget: 0,
      budget_utilization_pct: 0,
    },
  });

  // Bar chart data
  const [barChartData, setBarChartData] = useState({
    data: [],
    keys: ["progress"],
  });

  // Fetch all dashboard data (PSU stats, chart metrics, bar chart data)
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch when on main dashboard (no project selected)
      if (selectedProject || selectedPsuProject) {
        setPsuStats(null);
        setDashboardOnlyPSUData(null);
        setDashboardBothStatePSUData(null);
        setFilteredStatesList([]);
        setChartMetrics({
          completionRate: 0,
          budgetUtilization: 0,
          implementationRate: 0,
          budgetData: {
            total_spent: 0,
            allocated_budget: 0,
            budget_utilization_pct: 0,
          },
        });
        setBarChartData({ data: [], keys: ["progress"] });
        return;
      }

      setDashboardLoading(true);
      try {
        // When PSU is selected
        if (psu) {
          if (selectedState && selectedState !== "") {
            // Both PSU and state selected
            const data = await fetchDashboardBothStatePSUData(
              psu,
              selectedState
            );
            setDashboardBothStatePSUData(data);
            setDashboardOnlyPSUData(null);

            if (data && data.top_stats) {
              setPsuStats({
                totalStates: 1,
                totalDistricts: data.top_stats.total_districts || 0,
                totalSchools: data.top_stats.total_schools || 0,
                totalPSUs: 1,
                activeProjects: data.top_stats.active_projects || 0,
              });
            } else {
              setPsuStats(null);
            }

            // Set bar chart data from budget_by_project
            if (data && data.budget_by_project) {
              setBarChartData({
                data: data.budget_by_project.map(
                  ({ project_name, allocated_budget, used_budget }) => ({
                    project: project_name,
                    allocatedBudget: allocated_budget,
                    usedBudget: used_budget,
                  })
                ),
                keys: ["allocatedBudget", "usedBudget"],
              });
            } else {
              console.error(
                `Error: budget_by_project data not available for PSU: ${psu}, State: ${selectedState}`
              );
              setBarChartData({
                data: [],
                keys: ["allocatedBudget", "usedBudget"],
              });
            }
          } else {
            // Only PSU selected
            const data = await fetchDashboardOnlyPSUData(psu);
            setDashboardOnlyPSUData(data);
            setDashboardBothStatePSUData(null);

            if (data && data.top_stats) {
              setPsuStats({
                totalStates: data.top_stats.total_states || 0,
                totalDistricts: data.top_stats.total_districts || 0,
                totalSchools: data.top_stats.total_schools || 0,
                totalPSUs: 1,
                activeProjects: data.top_stats.active_projects || 0,
              });

              // Extract states from budget_by_state to filter the state dropdown
              if (data.budget_by_state && Array.isArray(data.budget_by_state)) {
                const psuStates = data.budget_by_state.map(
                  (item) => item.state
                );
                setFilteredStatesList(psuStates);

                if (selectedState && !psuStates.includes(selectedState)) {
                  setSelectedState("");
                }
              } else {
                setFilteredStatesList([]);
              }

              // Set bar chart data from budget_by_state
              if (data.budget_by_state) {
                setBarChartData({
                  data: data.budget_by_state.map(
                    ({ state, allocated_budget, used_budget }) => ({
                      state: state,
                      allocatedBudget: allocated_budget,
                      usedBudget: used_budget,
                    })
                  ),
                  keys: ["allocatedBudget", "usedBudget"],
                });
              }
            } else {
              setPsuStats(null);
              setDashboardOnlyPSUData(null);
              setFilteredStatesList([]);
              setBarChartData({
                data: [],
                keys: ["allocatedBudget", "usedBudget"],
              });
            }
          }
        } else {
          // No PSU selected - fetch chart metrics and bar chart data
          const stateParam =
            selectedState && selectedState !== "" ? selectedState : null;

          // Fetch chart metrics
          const [completionData, budgetData, implData] = await Promise.all([
            fetchProjectCompletionRate(stateParam),
            fetchBudgetUtilization(stateParam),
            fetchSchoolImplementationRate(stateParam),
          ]);

          // Process completion rate
          let completionRate = 0;
          if (completionData.length > 0) {
            if (stateParam) {
              completionRate = Number(completionData[0].completion_rate);
            } else {
              const totalRate = completionData.reduce(
                (sum, state) => sum + Number(state.completion_rate),
                0
              );
              completionRate = Number(
                (totalRate / completionData.length).toFixed(2)
              );
            }
          }

          // Process budget data
          const budgetUtilization = budgetData[0]
            ? Number(budgetData[0].budget_utilization_pct)
            : 0;
          const budgetDataFormatted = budgetData[0]
            ? {
                total_spent: budgetData[0].total_spent || 0,
                allocated_budget: budgetData[0].allocated_budget || 0,
                budget_utilization_pct: budgetUtilization,
              }
            : {
                total_spent: 0,
                allocated_budget: 0,
                budget_utilization_pct: 0,
              };

          // Process implementation rate
          const implementationRate = implData[0]
            ? Number(implData[0].implementation_rate)
            : 0;

          setChartMetrics({
            completionRate,
            budgetUtilization,
            implementationRate,
            budgetData: budgetDataFormatted,
          });

          // Fetch bar chart data
          if (stateParam) {
            // State selected - fetch district completion rates
            const districtData = await fetchDistrictCompletionRate(stateParam);
            setBarChartData({
              data: districtData.map(({ district_name, completion_rate }) => ({
                district: district_name,
                progress: completion_rate,
              })),
              keys: ["progress"],
            });
          } else {
            // No state selected - use completion data for states
            setBarChartData({
              data: completionData.map(({ state_name, completion_rate }) => ({
                state: state_name,
                progress: completion_rate,
              })),
              keys: ["progress"],
            });
          }

          // Clear PSU-related data
          setPsuStats(null);
          setDashboardOnlyPSUData(null);
          setDashboardBothStatePSUData(null);
          setFilteredStatesList([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setPsuStats(null);
        setDashboardOnlyPSUData(null);
        setDashboardBothStatePSUData(null);
        setFilteredStatesList([]);
        setChartMetrics({
          completionRate: 0,
          budgetUtilization: 0,
          implementationRate: 0,
          budgetData: {
            total_spent: 0,
            allocated_budget: 0,
            budget_utilization_pct: 0,
          },
        });
        setBarChartData({ data: [], keys: ["progress"] });
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [psu, selectedState, selectedProject, selectedPsuProject]);

  // Reset filtered states when PSU is cleared
  useEffect(() => {
    if (!psu) {
      setFilteredStatesList([]);
    }
  }, [psu]);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [hierarchicalData, navData] = await Promise.all([
          fetchHierarchicalData(),
          fetchProjectsAndPsu(),
        ]);

        if (!isMounted) return;

        setHierarchicalData(hierarchicalData);

        // Transform psuProjects object into the required format
        const transformedPsuList = Object.entries(navData.psuProjects).map(
          ([psuName, projects]) => ({
            name: psuName,
            projects: projects.map((p) => p.project_name),
          })
        );

        setPsuNavList(transformedPsuList);
        setProjects(navData.projects);
        setPsuOptions(transformedPsuList.map((p) => p.name));

        // Set PSU for PSU users
        if (isPsuUser && userPsu) {
          setPsu(userPsu);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [isPsuUser, userPsu]); // Add dependencies for PSU user initialization

  //------------------------------------URL ⇄ STATE SYNC------------------------------------------------------------

  // Sync selected project / PSU project with URL search params (?project= / ?psuProject=)
  useEffect(() => {
    const projectName = searchParams.get("project");
    const psuProjectName = searchParams.get("psuProject");

    if (projectName) {
      // Prefer filtered projects (respect PSU restrictions), fall back to all
      const allProjects = getFilteredProjects();
      const projectFromFiltered =
        allProjects.find((p) => p.name === projectName) ||
        projects.find((p) => p.name === projectName);

      setSelectedProject(projectFromFiltered || null);
      setSelectedPsuProject(null);
      return;
    }

    if (psuProjectName) {
      setSelectedPsuProject(psuProjectName);
      setSelectedProject(null);
      return;
    }

    // No params – show main dashboard
    setSelectedProject(null);
    setSelectedPsuProject(null);
  }, [searchParams, projects]);

  //------------------------------------HANDLERS------------------------------------------------------------

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedState(null);
    setSelectedPsuProject(null);
    // Update URL: /dashboard?project=Project%20Name
    setSearchParams({ project: project.name });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handlePsuProjectSelect = (psuProject) => {
    setSelectedPsuProject(psuProject);
    setSelectedProject(null);
    setIsSidebarOpen(false);
    // Update URL: /dashboard?psuProject=Project%20Name
    setSearchParams({ psuProject });
  };

  const handleReturnHome = () => {
    setSelectedProject(null);
    setSelectedState("");
    setSelectedPsuProject(null);
    setIsSidebarOpen(false);
    // Clear any project-related URL params
    setSearchParams({});
  };

  //------------------------------------RENDERING------------------------------------------------------------

  return (
    <div
      className="flex h-screen w-screen dark:bg-[var(--color-background)] bg-[var(--color-background)] 
      overflow-hidden transition-all duration-500 ease-in-out"
    >
      <DashboardBackground1 />
      <DashboardBackground2 />
      <Sidebar
        isAdmin={isAdmin}
        projects={getFilteredProjects()}
        psu={
          isPsuUser
            ? psuNavList.filter((psu) => psu.name === userPsu)
            : psuNavList
        }
        selectedpsuProject={selectedPsuProject}
        onPsuProjectSelect={handlePsuProjectSelect}
        selectedProject={selectedProject}
        onProjectSelect={handleProjectSelect}
        onReturnHome={handleReturnHome}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setNavpsu={setSelectedNavPsu}
        isPsuUser={isPsuUser}
      />
      {/* Main content area */}
      <div
        ref={scrollRef}
        key={"main"}
        className="relative flex-1 overflow-y-auto overflow-x-hidden
        transition-all duration-500 ease-in-out"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-surface-dark) transparent",
        }}
      >
        {/* Sticky Header */}
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
            style={{ aspectRatio: "1 / 1" }}
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
          {!selectedProject && !selectedPsuProject ? (
            <div className="flex flex-row space-x-1 ml-4 mr-4">
              <select
                onChange={(e) => setSelectedState(e.target.value)}
                value={selectedState}
                className="px-3 py-2 md:mr-4 w-full md:w-[calc(100%-2rem)] border border-gray-300 dark:border-gray-600 rounded-lg z-0 
             bg-white dark:bg-gray-800
             text-gray-900 dark:text-gray-100
             focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  All States
                </option>
                {(filteredStatesList.length > 0
                  ? filteredStatesList
                  : statesList
                ).map((state) => (
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
                  if (!isPsuUser) {
                    const selectedPsuName = e.target.value;
                    const selectedPsu = psuNavList.find(
                      (psu) => psu.name === selectedPsuName
                    );
                    if (selectedPsu) {
                      setPsu(selectedPsu.name);
                    } else {
                      setPsu("");
                      // Clear selected state when PSU is cleared
                      setSelectedState("");
                    }
                  }
                }}
                value={isPsuUser ? userPsu : psu || ""}
                disabled={isPsuUser}
                className={`px-3 py-2 w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-lg z-0 
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${
                  isPsuUser
                    ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="" className="bg-white dark:bg-gray-800">
                  All PSUs
                </option>{" "}
                {psuOptions.map((psuName) => (
                  <option
                    key={psuName}
                    value={psuName}
                    className="bg-white dark:bg-gray-800"
                  >
                    {psuName}
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
          <UserProfile
            isOpen={isSidebarOpen}
            isPsuUser={isPsuUser}
            userPsu={userPsu}
            userOrg={userOrg}
          />
        </div>
        <div className="px-4 md:px-6 lg:px-8">
          <div>
            <h2 className="text-xl md:text-2xl font-outfit font-semibold text-[var(--color-text)]">
              {selectedProject
                ? selectedProject.name
                : selectedPsuProject
                ? selectedPsuProject
                : "Welcome to NSTFDC Dashboard"}
            </h2>
            <p className="font-redhat text-[var(--color-text-secondary)] mt-1 mb-1">
              {selectedProject || selectedPsuProject
                ? "Select the following details to view data"
                : "Select a project to get started"}
            </p>
          </div>
          {/* Main Content - Added spacing for mobile */}

          <div className="theme-transition space-y-5 md:space-y-6 z-20 mb-10 md:mb-12">
            {!selectedProject && !selectedPsuProject ? (
              <>
                <div className="mb-4 md:mb-6 mt-2">
                  <SummaryCards
                    stats={psu ? psuStats || stats : stats}
                    loading={dashboardLoading || loading}
                    selectedState={selectedState}
                  />
                </div>
                <div className="mb-4 md:mb-6 ">
                  <DashboardChartSection
                    selectedState={selectedState}
                    selectedPSU={psu}
                    hierarchicalData={hierarchicalData}
                    projectsData={projects}
                    dashboardBothStatePSUData={dashboardBothStatePSUData}
                    dashboardOnlyPSUData={dashboardOnlyPSUData}
                    chartMetrics={chartMetrics}
                    isLoading={dashboardLoading}
                  />
                  <BarChartSection
                    stateList={statesList}
                    selectedState={selectedState}
                    selectedPsu={psu}
                    barChartData={barChartData}
                    isLoading={dashboardLoading}
                  />
                </div>
              </>
            ) : (
              <div className="mt-4 md:mt-0">
                {selectedProject && (
                  <ProjectSelectionForm
                    key={selectedProject?.id}
                    isAdmin={isAdmin && !isPsuUser}
                    selectedProject={selectedProject}
                    projectdata={getFilteredProjects().find(
                      (p) => p.name === selectedProject?.name
                    )}
                  />
                )}
                {selectedPsuProject && (
                  <PsuSelectionForm
                    key={selectedPsuProject?.id}
                    selectedPsuProject={selectedPsuProject}
                    hierarchicalData={hierarchicalData}
                    projectList={projects}
                    projectdata={getFilteredProjects().find(
                      (p) => p.name === selectedPsuProject
                    )}
                    psulist={psuOptions}
                    psuName={selectedNavPsu}
                    isAdmin={isAdmin && !isPsuUser}
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

export default DashboardView;
