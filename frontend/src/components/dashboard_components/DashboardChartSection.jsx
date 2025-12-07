import { useTheme } from "../../context/ThemeContext";
import { SchoolCard, ImplementationSummary } from "../charts/school_card";
import { BudgetCard, BudgetPSUCard } from "../charts/budget_card";
import CompletionCard from "../charts/completion_card";
import createChartConfig from "../charts/style";
import { StateAffected } from "../charts/state_affected";

const DashboardChartSection = ({
  selectedState,
  selectedPSU,
  hierarchicalData,
  projectsData,
  dashboardBothStatePSUData, // For when both PSU and state are selected
  dashboardOnlyPSUData, // For when only PSU is selected
  chartMetrics, // Chart metrics when no PSU is selected
  isLoading,
}) => {
  const { isDarkMode } = useTheme();

  //------------------------------------DATA TRANSFORMATION------------------------------------------------------------

  // Transform data based on selected PSU/state
  const getBudgetData = () => {
    if (selectedPSU) {
      if (selectedState && dashboardBothStatePSUData) {
        const budget = dashboardBothStatePSUData.budget || {};
        return {
          allocated_budget: budget.allocated_budget || 0,
          total_spent: budget.used_budget || 0,
          budget_utilization_pct: budget.allocated_budget
            ? Number(
                ((budget.used_budget / budget.allocated_budget) * 100).toFixed(
                  2
                )
              )
            : 0,
        };
      } else if (dashboardOnlyPSUData) {
        const budget = dashboardOnlyPSUData.budget || {};
        return {
          allocated_budget: budget.allocated_budget || 0,
          total_spent: budget.used_budget || 0,
          budget_utilization_pct: budget.allocated_budget
            ? Number(
                ((budget.used_budget / budget.allocated_budget) * 100).toFixed(
                  2
                )
              )
            : 0,
        };
      }
    }
    return (
      chartMetrics?.budgetData || {
        total_spent: 0,
        allocated_budget: 0,
        budget_utilization_pct: 0,
      }
    );
  };

  const getStateDataforPie = () => {
    if (selectedPSU && dashboardOnlyPSUData && !selectedState) {
      return (dashboardOnlyPSUData.budget_by_state || []).map((stateItem) => ({
        id: stateItem.state,
        label: stateItem.state,
        value: stateItem.allocated_budget,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      }));
    }
    return [];
  };

  const getDistrictDataforPie = () => {
    if (selectedPSU && selectedState && dashboardBothStatePSUData) {
      if (dashboardBothStatePSUData.district_project_implementation) {
        const districtMap = new Map();
        dashboardBothStatePSUData.district_project_implementation.forEach(
          (item) => {
            if (!districtMap.has(item.district)) {
              districtMap.set(item.district, {
                name: item.district,
                projects: [],
                schoolsTotal: 0,
                schoolsCompleted: 0,
                budget: 0,
                activeProjects: 0,
              });
            }

            const district = districtMap.get(item.district);
            const project = {
              name: item.project_name,
              schoolsTotal: item.total_schools || 0,
              schoolsCompleted: item.completed_schools || 0,
              budget: 123, // Budget not available in district_project_implementation
            };

            district.projects.push(project);
            district.schoolsTotal += item.total_schools || 0;
            district.schoolsCompleted += item.completed_schools || 0;
            district.activeProjects += 1;
          }
        );
        return Array.from(districtMap.values());
      }
    }
    return [];
  };

  const getSchoolImplementationData = () => {
    if (selectedPSU) {
      if (selectedState && dashboardBothStatePSUData?.state_implementation) {
        return {
          total_schools:
            dashboardBothStatePSUData.state_implementation.total_schools || 0,
          completed_schools:
            dashboardBothStatePSUData.state_implementation.completed_schools ||
            0,
          implementation_pct:
            dashboardBothStatePSUData.state_implementation.implementation_pct ||
            0,
        };
      } else if (dashboardOnlyPSUData?.school_implementation) {
        return {
          total_schools:
            dashboardOnlyPSUData.school_implementation.total_schools || 0,
          completed_schools:
            dashboardOnlyPSUData.school_implementation.completed_schools || 0,
          implementation_pct:
            dashboardOnlyPSUData.school_implementation.implementation_pct || 0,
        };
      }
    }
    // When no PSU, we don't show school implementation summary, but we need the rate for the chart
    return {
      total_schools: 0,
      completed_schools: 0,
      implementation_pct: chartMetrics?.implementationRate || 0,
    };
  };

  const budgetData = getBudgetData();
  const stateDataforPie = getStateDataforPie();
  const districDataforPie = getDistrictDataforPie();
  const schoolImplementationData = getSchoolImplementationData();

  // Get rates for chart config
  const completionRate = selectedPSU ? 0 : chartMetrics?.completionRate || 0;
  const budgetUtilization = selectedPSU
    ? budgetData.budget_utilization_pct
    : chartMetrics?.budgetUtilization || 0;
  const implementationRate = selectedPSU
    ? Number(schoolImplementationData.implementation_pct)
    : chartMetrics?.implementationRate || 0;

  const {
    pieChartProps,
    elevatedCardClass,
    chartColors,
    chartTheme,
    pieDataBudget,
    pieDataCompletion,
    pieDataSchool,
  } = createChartConfig({
    isDarkMode,
    completionRate,
    budgetUtilization,
    implementationRate,
  });

  //------------------------------------DATA TRANSFORMATION------------------------------------------------------------

  const formatBudget = (value) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Cr`; // Crore
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} L`; // Lakh
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} K`; // Thousand
    }
    return value.toString(); // Default
  };

  //------------------------------------RENDERING------------------------------------------------------------

  return (
    <>
      {/* Circular Charts Row */}
      <div className="grid grid-cols-1 mb-8 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="h-64 bg-[var(--color-surface-hover)] rounded-xl animate-pulse"></div>
        ) : (
          <div className={`${elevatedCardClass}`}>
            <div className="p-1 pl-6 mt-4 border-l-4 border-[var(--color-primary)]">
              <h3 className="text-lg font-outfit font-medium text-[var(--color-text)]">
                {selectedPSU ? "Total Budget" : "Project Completion Rate"}
              </h3>
            </div>
            {selectedPSU ? (
              <BudgetPSUCard
                StateBudget={budgetData.total_spent}
                totalBudget={budgetData.allocated_budget}
                budgetPercentage={budgetData.budget_utilization_pct}
                formatBudget={formatBudget}
              />
            ) : (
              <CompletionCard
                pieChartProps={pieChartProps}
                pieDataCompletion={pieDataCompletion}
                chartColors={chartColors}
                chartTheme={chartTheme}
                completionRate={completionRate}
              />
            )}
          </div>
        )}

        {isLoading ? (
          <div className="h-64 bg-[var(--color-surface-hover)] rounded-xl animate-pulse"></div>
        ) : (
          <div className={` ${elevatedCardClass} `}>
            <div className="p-1 pl-6 mt-4 border-l-4 border-[var(--color-primary)] ">
              <h3
                className="
                  text-lg font-outfit font-medium text-[var(--color-text)]
                "
              >
                {selectedPSU
                  ? selectedState
                    ? "Districts Affected"
                    : "States Affected"
                  : "Budget Utilization"}
              </h3>
            </div>
            {selectedPSU ? (
              <StateAffected
                selectedState={selectedState}
                formatBudget={formatBudget}
                districtData={districDataforPie}
                stateData={stateDataforPie}
                projectData={projectsData}
              />
            ) : (
              <BudgetCard
                chartTheme={chartTheme}
                pieChartProps={pieChartProps}
                pieDataBudget={pieDataBudget}
              />
            )}
          </div>
        )}

        {isLoading ? (
          <div className="h-64 bg-[var(--color-surface-hover)] rounded-xl animate-pulse col-span-1 sm:col-span-2 lg:col-span-1"></div>
        ) : (
          <div
            className={`col-span-1 sm:col-span-2 lg:col-span-1 ${elevatedCardClass}`}
          >
            <div className="p-1 pl-6 mt-4 border-l-4 border-[var(--color-primary)]">
              <h3 className="text-lg font-outfit font-medium text-[var(--color-text)]">
                School Implementation
              </h3>
            </div>
            {selectedPSU ? (
              <ImplementationSummary
                totalSchools={schoolImplementationData.total_schools}
                completedSchools={schoolImplementationData.completed_schools}
                implementationPct={schoolImplementationData.implementation_pct}
              />
            ) : (
              <SchoolCard
                implementationRate={implementationRate}
                pieDataSchool={pieDataSchool}
                chartTheme={chartTheme}
                chartColors={chartColors}
                pieChartProps={pieChartProps}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardChartSection;
