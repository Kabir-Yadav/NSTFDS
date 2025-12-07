import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
import StatesPieChart from "./states_piechart";

const DistrictDropdownView = ({ districtData, formatBudget, projectData }) => {
  console.log("districtData", districtData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const getSchoolsTotal = (district) => {
    return (
      district?.projects?.reduce((sum, project) => {
        return sum + (project.schoolsTotal || 0);
      }, 0) || 0
    );
  };

  // Use projects from district data
  const getDistrictProjects = (district) => {
    return district?.projects || [];
  };

  // Reset and set the first district when districtData changes
  useEffect(() => {
    // Reset all filter states when districtData changes
    setSearchTerm("");
    setSelectedProject(null);
    setIsDropdownOpen(false);
    setIsProjectDropdownOpen(false);

    // Set the first district as default when districtData changes
    if (districtData && districtData.length > 0) {
      setSelectedDistrict(districtData[0]);
    } else {
      setSelectedDistrict(null);
    }
    setFilteredDistricts(districtData || []);
  }, [districtData]);

  // Filter districts and projects based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDistricts(districtData);
      setFilteredProjects(
        selectedDistrict ? getDistrictProjects(selectedDistrict) : []
      );
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      if (isDropdownOpen) {
        const filtered = districtData.filter((district) =>
          district.name.toLowerCase().includes(searchTermLower)
        );
        setFilteredDistricts(filtered);
      } else if (isProjectDropdownOpen && selectedDistrict) {
        const filtered = getDistrictProjects(selectedDistrict).filter(
          (project) => project.name.toLowerCase().includes(searchTermLower)
        );
        setFilteredProjects(filtered);
      }
    }
  }, [
    searchTerm,
    districtData,
    selectedDistrict,
    isDropdownOpen,
    isProjectDropdownOpen,
  ]);

  // Handle district selection
  const selectDistrict = (district) => {
    setSelectedDistrict(district);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Calculate cumulative project status
  const calculateCumulativeStatus = (district) => {
    const projects = getDistrictProjects(district);
    if (!projects.length) return 0;
    const totalStatus = projects.reduce(
      (sum, project) => sum + project.status,
      0
    );
    return Math.round(totalStatus / projects.length);
  };

  // Get status color based on project completion percentage
  const getStatusColor = (percentage) => {
    if (percentage > 75) return "var(--color-success)";
    if (percentage > 40) return "var(--color-warning)";
    return "var(--color-error)";
  };

  return (
    <div className="relative h-full overflow-y-auto mt-3 bg-[var(--color-surface-secondary)] rounded-br-xl rounded-bl-xl">
      {/* Sticky Dropdown and Search */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface-secondary)] p-3 border-b border-gray-200 dark:border-gray-700 max-w-full">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3 w-full">
          {/* District Selector Dropdown */}
          <div className="relative flex-1 min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="flex-1 min-w-0 flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsProjectDropdownOpen(false);
                }}
              >
                <span className="truncate text-gray-700 dark:text-gray-200 font-medium max-w-full">
                  {selectedDistrict ? selectedDistrict.name : "Select District"}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Project Selector */}

              <button
                className="flex-1 min-w-0 flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  setIsProjectDropdownOpen(!isProjectDropdownOpen);
                  setIsDropdownOpen(false);
                }}
              >
                <span className="truncate text-gray-700 dark:text-gray-200 font-medium max-w-full">
                  {selectedProject
                    ? selectedProject.name
                    : `Projects (${
                        selectedDistrict
                          ? getDistrictProjects(selectedDistrict).length
                          : 0
                      })`}
                </span>
                <div className="flex items-center gap-1">
                  {selectedProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(null);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </button>
                  )}
                  {isProjectDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>
            </div>

            {/* District Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-44 rounded-md overflow-auto focus:outline-none">
                {/* Search input */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="pl-8 pr-4 py-1 w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search districts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* District options */}
                <ul className="py-1">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map((district, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                        onClick={() => selectDistrict(district)}
                      >
                        {district.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                      No districts found
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Project Dropdown Menu */}
            {isProjectDropdownOpen && selectedDistrict && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-44 rounded-md overflow-auto focus:outline-none">
                {/* Search input for projects */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="pl-8 pr-4 py-1 w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ul className="py-1">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsProjectDropdownOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span>{project.name}</span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Schools: {project.schoolsCompleted}/
                              {project.schoolsTotal}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ color: getStatusColor(project.status) }}
                            >
                              {project.status}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ₹{formatBudget(project.budget)}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                      No projects found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District Data Content - No Card Wrapper */}
      {selectedDistrict && (
        <div className="p-4 w-full">
          {/* Basic Info Row */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className=" p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Budget Allocation
                </div>
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  ₹{formatBudget(selectedDistrict.budget)}
                </div>
              </div>

              <div className="bg-[var(--color-surface-hover)] justify-center flex flex-col p-3 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedProject ? "Project Status" : "Active Projects"}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(
                          calculateCumulativeStatus(selectedDistrict)
                        ),
                      }}
                    />
                    <div
                      className="text-xl font-bold"
                      style={{
                        color: getStatusColor(
                          calculateCumulativeStatus(selectedDistrict)
                        ),
                      }}
                    >
                      {selectedProject
                        ? `${selectedProject.status}`
                        : `${selectedDistrict.activeProjects}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School Implementation Row */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--color-success)] mr-2"></span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                School Implementation
              </span>
            </div>

            <div className="bg-[var(--color-surface-hover)] p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {selectedDistrict.schoolsCompleted}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Schools Completed
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {selectedDistrict.schoolsTotal}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Schools
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div
                    className="h-2 rounded-full bg-[var(--color-success)]"
                    style={{
                      width: `${
                        (selectedDistrict.schoolsCompleted /
                          getSchoolsTotal(selectedDistrict)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                  {" "}
                  {Math.round(
                    (selectedDistrict.schoolsCompleted /
                      getSchoolsTotal(selectedDistrict)) *
                      100
                  )}
                  % Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StateAffected = ({
  selectedState,
  formatBudget,
  districtData,
  stateData,
  projectData,
}) => {
  return (
    <div
      className="
          h-64
          mt-3
          bg-[var(--color-surface-secondary)]
          rounded-br-xl rounded-bl-xl
        "
    >
      {!selectedState ? (
        // Show pie chart of state budgets when only PSU is selected
        <StatesPieChart
          stateBudgetData={stateData}
          formatBudget={formatBudget}
        />
      ) : (
        // Show district detail cards when both PSU and state are selected
        <DistrictDropdownView
          districtData={districtData}
          formatBudget={formatBudget}
          projectData={projectData}
        />
      )}
    </div>
  );
};

export { DistrictDropdownView, StateAffected };
