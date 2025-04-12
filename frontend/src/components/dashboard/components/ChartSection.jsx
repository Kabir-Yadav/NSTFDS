import React from "react";
import { ResponsiveContainer } from "recharts";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  fetchDigitalDeviceProcurementRate,
  fetchBudgetUtilization,
  fetchSchoolImplementationRate,
} from "../../../action/supabase_actions";

const ChartSection = ({ selectedState }) => {
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [implementationRate, setImplementationRate] = useState(0);

  const loadMetrics = async (state) => {
    setLoading(true);
    try {
      // If no state is selected, pass null to fetch overall stats.
      const stateParam = state && state !== "" ? state : null;

      // Fetch Digital Procurement Completion Rate
      const digitalData = await fetchDigitalDeviceProcurementRate(stateParam);
      if (digitalData.length > 0) {
        // Assume digital_completion_rate is returned as a string percentage.
        setCompletionRate(Number(digitalData[0].digital_completion_rate));
      } else {
        setCompletionRate(0);
      }

      // Fetch Budget Utilization Data
      const budgetData = await fetchBudgetUtilization(stateParam);

      if (budgetData.length > 0) {
        setBudgetUtilization(Number(budgetData[0].budget_utilization_percent));
      } else {
        setBudgetUtilization(0);
      }

      // Fetch School Implementation Rate Data
      const implData = await fetchSchoolImplementationRate(stateParam);

      if (implData.length > 0) {
        setImplementationRate(Number(implData[0].implementation_rate));
      } else {
        setImplementationRate(0);
      }
    } catch (err) {
      console.error("Error loading metrics:", err);
    }
    setLoading(false);
  };

  // Load metrics on initial mount (for all states) and when selectedState changes.
  useEffect(() => {
    loadMetrics(selectedState);
  }, [selectedState]);

  // Theme-aware colors
  const chartColors = {
    primary: "var(--color-primary)",
    secondary: isDarkMode ? "#374151" : "#e5e7eb",
    success: "var(--color-success)",
    info: "var(--color-info)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
  };

  const chartTheme = {
    background: "var(--color-surface)",
    textColor: "var(--color-text)",
    fontSize: 12,
    axis: {
      ticks: {
        text: {
          fill: "var(--color-text)",
        },
      },
    },
    labels: {
      text: {
        fontSize: 16,
        fontWeight: 700,
        fill: "var(--color-text)",
        fontFamily: "Red Hat Display",
      },
    },
    grid: {
      line: {
        stroke: isDarkMode ? "#374151" : "#e5e7eb",
      },
    },
  };

  const pieDataCompletion = [
    {
      id: "completed",
      label: "Completed",
      value: completionRate,
      color: "var(--color-success)",
    },
    {
      id: "remaining",
      label: "Remaining",
      value: 100 - completionRate,
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  const pieDataBudget = [
    {
      id: "utilized",
      label: "Utilized",
      value: budgetUtilization,
      color: "var(--color-error)",
    },
    {
      id: "unutilized",
      label: "Unutilized",
      value: 100 - budgetUtilization,
      color: isDarkMode ? "#374151" : "#e5e7eb", // warning yellow
    },
  ];

  const pieDataSchool = [
    {
      id: "done",
      label: "Done",
      value: implementationRate,
      color: "var(--color-warning)",
    },
    {
      id: "pending",
      label: "Pending",
      value: 100 - implementationRate,
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  const pieChartProps = {
    motionConfig: "wobbly",
    animate: true,
    initial: [
      {
        startAngle: 0,
        endAngle: 0,
        value: 0,
        paddingAngle: 0,
      },
    ],
    transitionMode: "middleAngle",
  };

  // Determine chart data based on state selection
  const elevatedCardClass = `
    bg-[var(--color-surface)] 
    p-6 
    rounded-xl 
    transition-all 
    duration-300 
    transform 
    theme-transition
  `;
  return (
    <>
      {/* Circular Charts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="animate-pulse h-64 bg-[var(--color-surface-hover)] rounded-xl"></div>
        ) : (
          <div className={elevatedCardClass}>
            <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
              Project Completion Rate
            </h3>
            {
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ResponsivePie
                    {...pieChartProps}
                    data={pieDataCompletion}
                    margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
                    innerRadius={0.6}
                    padAngle={3}
                    cornerRadius={7}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: "data.color" }}
                    theme={chartTheme}
                    enableArcLinkLabels={false}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsTextColor="white"
                  />
                </ResponsiveContainer>
              </div>
            }
          </div>
        )}

        {loading ? (
          <div className="animate-pulse h-64 bg-[var(--color-surface-hover)] rounded-xl"></div>
        ) : (
          <div className={elevatedCardClass}>
            <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
              Budget Utilization
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ResponsivePie
                  data={pieDataBudget}
                  margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
                  innerRadius={0.1}
                  padAngle={3}
                  cornerRadius={7}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: "data.color" }}
                  theme={chartTheme}
                  enableArcLinkLabels={false}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsTextColor="white"
                  animate={pieChartProps.animate}
                  motionConfig={pieChartProps.motionConfig}
                  transitionMode={pieChartProps.transitionMode}
                />
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse h-64 bg-[var(--color-surface-hover)] rounded-xl col-span-1 sm:col-span-2 lg:col-span-1"></div>
        ) : (
          <div
            className={`${elevatedCardClass} col-span-1 sm:col-span-2 lg:col-span-1`}
          >
            <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
              School Implementation
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ResponsivePie
                  data={pieDataSchool}
                  margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
                  innerRadius={0.7}
                  padAngle={3}
                  cornerRadius={7}
                  colors={{ datum: "data.color" }}
                  theme={chartTheme}
                  enableArcLinkLabels={false}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsTextColor="white"
                  enableArcLabels={false}
                  animate={pieChartProps.animate}
                  motionConfig={pieChartProps.motionConfig}
                  transitionMode={pieChartProps.transitionMode}
                  layers={[
                    "arcs",
                    "arcLabels",
                    "arcLinkLabels",
                    "legends",
                    ({ centerX, centerY, centerRadius }) => (
                      <g>
                        <text
                          x={centerX}
                          y={centerY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: "26px",
                            fontWeight: "bold",
                            fill: chartColors.text,
                          }}
                        >
                          <animate
                            attributeName="opacity"
                            values="0;1"
                            dur="1s"
                            repeatCount="1"
                          />
                          <tspan>{pieDataSchool[0].value}%</tspan>
                        </text>
                      </g>
                    ),
                  ]}
                />
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChartSection;
