import React from "react";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  fetchDigitalDeviceProcurementRate,
  fetchBudgetUtilization,
  fetchSchoolImplementationRate,
  fetchProjectCompletionRate,
} from "../../../action/supabase_actions";
import SchoolCard from "./charts/school_card";
import BudgetCard from "./charts/budget_card";
import CompletionCard from "./charts/completion_card";
import StatesPieChart from "./charts/states_piechart";
import createChartConfig from "./charts/style";
import DistrictDropdownView from "./charts/district_card";

const ChartSection = ({ selectedState, selectedPSU }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [implementationRate, setImplementationRate] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0); // New state for total budget

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
  const loadMetrics = async (state) => {
    setLoading(true);
    try {
      // If no state is selected, pass null to fetch overall stats.
      const stateParam = state && state !== "" ? state : null;

      const digitalData = await fetchProjectCompletionRate(stateParam);
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
      const budgetData = await fetchBudgetUtilization(stateParam);
      console.log(budgetData);
      setBudgetUtilization(Number(budgetData[0].budget_utilization_pct));

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
    loadMetrics(selectedState);
  }, [selectedState]);

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

  const StateBudget = Math.floor(Math.random() * totalBudget);
  const budgetPercentage = ((StateBudget / totalBudget) * 100).toFixed(2);

  // Generate fake state budget data for PSU view
  const generateStateData = () => {
    const states = [
      "Andhra Pradesh",
      "Gujarat",
      "Karnataka",
      "Tamil Nadu",
      "Maharashtra",
      "Delhi",
      "Uttar Pradesh",
      "West Bengal",
      "Rajasthan",
      "Madhya Pradesh",
      "Kerala",
      "Punjab",
    ];

    return states.map((state) => ({
      id: state,
      label: state,
      value: Math.floor(Math.random() * 900000) + 100000,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
    }));
  };

  // Generate district data with realistic constraints
  const getDistrictData = () => {
    const districts = [
      "North District",
      "South District",
      "East District",
      "West District",
      "Central District",
    ];

    const projectTypes = [
      "Digital Infrastructure",
      "Smart Classrooms",
      "Computer Labs",
      "Teacher Training",
      "Educational Software",
    ];

    return districts.map((district) => {
      // Base budget between 1 to 5 crores
      const districtBudget = Math.floor(Math.random() * 40000000) + 10000000;
      const districtSchoolsTotal = Math.floor(Math.random() * 20) + 10; // 10-30 schools
      // Ensure completed schools don't exceed total schools
      const maxCompletedSchools = Math.min(
        districtSchoolsTotal,
        Math.floor(districtSchoolsTotal * 0.8)
      );
      const districtSchoolsCompleted = Math.floor(
        Math.random() * maxCompletedSchools
      );

      // Generate projects with realistic constraints
      const projects = projectTypes.map((projectName) => {
        // Allocate 10-30% of district budget to each project
        const projectBudget = Math.floor(
          districtBudget * (0.1 + Math.random() * 0.2)
        );
        // Allocate schools proportionally
        const projectSchoolsTotal = Math.floor(
          districtSchoolsTotal * (0.3 + Math.random() * 0.4)
        );
        const maxProjectCompleted = Math.min(
          projectSchoolsTotal,
          districtSchoolsCompleted
        );
        const projectSchoolsCompleted = Math.floor(
          Math.random() * maxProjectCompleted
        );
        // Calculate status based on schools completion
        const status = Math.floor(
          (projectSchoolsCompleted / projectSchoolsTotal) * 100
        );

        return {
          name: projectName,
          budget: projectBudget,
          schoolsTotal: projectSchoolsTotal,
          schoolsCompleted: projectSchoolsCompleted,
          status: status,
        };
      });

      return {
        name: district,
        budget: districtBudget,
        schoolsTotal: districtSchoolsTotal,
        schoolsCompleted: districtSchoolsCompleted,
        activeProjects: Math.min(
          projectTypes.length,
          Math.floor(Math.random() * 4) + 2
        ), // 2-5 active projects
        projects: projects,
      };
    });
  };

  // ImplementationSummary Component
  const ImplementationSummary = ({ implementationRate }) => {
    const completedSchools = Math.round((implementationRate * 38) / 100);
    const remainingSchools = Math.round(
      ((100 - implementationRate) * 38) / 100
    );

    return (
      <div
        className="
          flex flex-col
          h-64
          mt-3
          bg-[var(--color-surface-secondary)]
          rounded-br-xl rounded-bl-xl
          justify-center items-center
        "
      >
        <div
          className="
            mb-6
            text-center
            animate-fade-down
          "
        >
          <div
            className="
              text-5xl font-bold text-[var(--color-warning)]
            "
          >
            {implementationRate}%
          </div>
          <div
            className="
              mt-2
              text-xl font-medium text-[var(--color-text)]
            "
          >
            Implementation Complete
          </div>
        </div>

        <div
          className="
            w-full max-w-xs
            animate-fade-down
          "
        >
          <div
            className="
              grid grid-cols-2
              text-center
              gap-4
            "
          >
            <div
              className="
                p-3
                bg-[var(--color-warning)] bg-opacity-20
                rounded-lg
              "
            >
              <div
                className="
                  font-semibold
                "
              >
                Schools Completed
              </div>
              <div
                className="
                  text-2xl font-bold
                "
              >
                {completedSchools}
              </div>
              <div
                className="
                  text-sm text-[var(--color-text)]
                "
              >
                of 38 schools
              </div>
            </div>
            <div
              className="
                p-3
                text-[var(--color-text)]
                bg-[var(--color-surface-hover)]
                rounded-lg
              "
            >
              <div
                className="
                  font-semibold
                "
              >
                Remaining
              </div>
              <div
                className="
                  text-2xl font-bold
                "
              >
                {remainingSchools}
              </div>
              <div
                className="
                  text-sm text-[var(--color-text-secondary)]
                "
              >
                schools pending
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // BudgetDisplay Component
  const BudgetDisplay = ({
    StateBudget,
    totalBudget,
    budgetPercentage,
    formatBudget,
  }) => (
    <div
      className="
        flex flex-col
        h-64
        mt-3
        bg-[var(--color-surface-secondary)]
        rounded-br-xl rounded-bl-xl
        justify-center items-center
      "
    >
      <div
        className="
          mb-4
          text-center
          animate-fade-down
        "
      >
        <span
          className="
            text-2xl font-semibold text-[var(--color-text-secondary)]
          "
        >
          Allocated
        </span>
      </div>

      <div
        className="
          flex flex-col
          space-y-2
          animate-fade-down
          items-center
        "
      >
        <div
          className="
            text-5xl font-extrabold text-[var(--color-primary)]
          "
        >
          {formatBudget(StateBudget)}
        </div>

        <div
          className="
            text-xl text-[var(--color-text-secondary)]
          "
        >
          of {formatBudget(totalBudget)}
        </div>

        <div
          className="
            flex
            mt-4
            items-center
          "
        >
          <div
            className="
              w-full h-3
              bg-gray-200
              rounded-full
              dark:bg-gray-700
            "
          >
            <div
              style={{ width: `${budgetPercentage}%` }}
              className="
                h-3
                bg-[var(--color-primary)]
                rounded-full
              "
            ></div>
          </div>
        </div>

        <div
          className="
            text-lg font-medium text-[var(--color-text)]
          "
        >
          {budgetPercentage}% of total budget
        </div>
      </div>
    </div>
  );

  const StateAffected = ({ selectedState, selectedPSU }) => {
    const districtData = getDistrictData();

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
            stateBudgetData={generateStateData()}
            formatBudget={formatBudget}
          />
        ) : (
          // Show district detail cards when both PSU and state are selected
          <DistrictDropdownView
            districtData={districtData}
            formatBudget={formatBudget}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {/* Circular Charts Row */}
      <div
        className="
          grid grid-cols-1
          mb-8
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {loading ? (
          <div
            className="
              h-64
              bg-[var(--color-surface-hover)]
              rounded-xl
              animate-pulse
            "
          ></div>
        ) : (
          <div
            className={`
              ${elevatedCardClass}
            `}
          >
            <div
              className="
                p-1 pl-6 mt-4
                border-l-4 border-[var(--color-primary)]
              "
            >
              <h3
                className="
                  text-lg font-outfit font-medium text-[var(--color-text)]
                "
              >
                {selectedPSU ? "Total Budget" : "Project Completion Rate"}
              </h3>
            </div>
            {selectedPSU ? (
              <BudgetDisplay
                StateBudget={StateBudget}
                totalBudget={totalBudget}
                budgetPercentage={budgetPercentage}
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
          <div
            className="
              h-64
              bg-[var(--color-surface-hover)]
              rounded-xl
              animate-pulse
            "
          ></div>
        ) : (
          <div
            className={`
              ${elevatedCardClass}
            `}
          >
            <div
              className="
                p-1 pl-6 mt-4
                border-l-4 border-[var(--color-primary)]
              "
            >
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
                selectedPSU={selectedPSU}
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
          <div
            className="
              h-64
              bg-[var(--color-surface-hover)]
              rounded-xl
              animate-pulse
              col-span-1
              sm:col-span-2
              lg:col-span-1
            "
          ></div>
        ) : (
          <div
            className={`
              col-span-1
              sm:col-span-2
              lg:col-span-1
              ${elevatedCardClass}
            `}
          >
            <div
              className="
                p-1 pl-6 mt-4
                border-l-4 border-[var(--color-primary)]
              "
            >
              <h3
                className="
                  text-lg font-outfit font-medium text-[var(--color-text)]
                "
              >
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

export default ChartSection;
