import { useState, useEffect, useCallback, memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchBudgetUtilization,
  fetchSchoolImplementationRate,
  fetchProjectCompletionRate,
  fetchPsuProjectBudgets,
  fetchPsuStateBudgets,
  fetchPsuProjectBudgetsByState,
  fetchPsuStateDistrictStats,
} from "../../action/supabase_actions";
import { SchoolCard, ImplementationSummary } from "../charts/school_card";
import { BudgetCard, BudgetPSUCard } from "../charts/budget_card";
import CompletionCard from "../charts/completion_card";
import createChartConfig from "../charts/style";
import { StateAffected } from "../charts/district_card";

const DashboardChartSection = ({
  selectedState,
  selectedPSU,
  hierarchicalData,
  projectsData,
}) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [implementationRate, setImplementationRate] = useState(0);
  const [psuBudgetData, setPsuBudgetData] = useState([
    {
      total_spent: 0,
      allocated_budget: 0,
      budget_utilization_pct: 0,
    },
  ]);
  const [stateDataforPie, setStateDataforPie] = useState([]);
  const [districDataforPie, setDistricDataforPie] = useState([]);

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

  //------------------------------------API CALLS------------------------------------------------------------

  const loadMetrics = async (state, psu) => {
    setLoading(true);
    try {
      if (psu) {
        const budgetData = await fetchPsuStateBudgets(psu);
        if (budgetData.length > 0) {
          if (state) {
            // If state is selected, show state-specific budget data
            let data = budgetData.find((item) => item.state_name === state);
            if (data) {
              setPsuBudgetData([
                {
                  allocated_budget: data.allocated_budget,
                  total_spent: data.used_budget,
                  budget_utilization_pct: Number(
                    ((data.used_budget / data.allocated_budget) * 100).toFixed(
                      2
                    )
                  ),
                },
              ]);
            }
            const districtdata = await fetchPsuStateDistrictStats(psu, state);
            setDistricDataforPie(districtdata);
          } else {
            // If no state is selected, calculate total budget statistics for the PSU
            const totalAllocated = budgetData.reduce(
              (sum, state) => sum + state.allocated_budget,
              0
            );
            const totalUsed = budgetData.reduce(
              (sum, state) => sum + state.used_budget,
              0
            );
            setPsuBudgetData([
              {
                allocated_budget: totalAllocated,
                total_spent: totalUsed,
                budget_utilization_pct: Number(
                  ((totalUsed / totalAllocated) * 100).toFixed(2)
                ),
              },
            ]);

            setStateDataforPie(
              budgetData.map((state) => ({
                id: state.state_name,
                label: state.state_name,
                value: state.allocated_budget,
                color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
              }))
            );
          }
        }
      }
      // If no state is selected, pass null to fetch overall stats.
      const stateParam = state && state !== "" ? state : null;
      const digitalData = await fetchProjectCompletionRate(stateParam);
      console.log(digitalData, "digitalData");
      if (digitalData.length > 0) {
        if (stateParam) {
          // If a state is selected, show that state's completion rate
          setCompletionRate(Number(digitalData[0].completion_rate));
        } else {
          // If no state is selected, calculate cumulative completion rate
          const totalRate = digitalData.reduce(
            (sum, state) => sum + Number(state.completion_rate),
            0
          );
          const averageRate = Number(
            (totalRate / digitalData.length).toFixed(2)
          );
          setCompletionRate(averageRate);
        }
      } else {
        setCompletionRate(0);
      }
      // Fetch Budget Utilization Data
      if (!psu) {
        const budgetData = await fetchBudgetUtilization(stateParam);
        console.log(budgetData, "budgetData");
        setBudgetUtilization(Number(budgetData[0].budget_utilization_pct));
      }

      // Fetch School Implementation Rate Data
      const implData = await fetchSchoolImplementationRate(stateParam);
      setImplementationRate(Number(implData[0].implementation_rate));
    } catch (err) {
      console.error("Error loading metrics:", err);
    }
    setLoading(false);
  };
  // Load metrics on initial mount (for all states) and when selectedState changes.
  useEffect(() => {
    loadMetrics(selectedState, selectedPSU);
  }, [selectedState, selectedPSU]);

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
        {loading ? (
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
                StateBudget={psuBudgetData[0].total_spent}
                totalBudget={psuBudgetData[0].allocated_budget}
                budgetPercentage={psuBudgetData[0].budget_utilization_pct}
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

        {loading ? (
          <div className="h-64 bg-[var(--color-surface-hover)] rounded-xl animate-pulse"></div>
        ) : (
          <div className={` ${elevatedCardClass} `}>
            <div className="p-1 pl-6 mt-4 border-l-4 border-[var(--color-primary)] ">
              <h3
                className="
                  text-lg font-outfit font-medium text-[var(--color-text)]
                "
              >
                {selectedPSU ? "States Affected" : "Budget Utilization"}
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

        {loading ? (
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
              <ImplementationSummary implementationRate={implementationRate} />
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
