import React from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  LabelList,
} from "recharts";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";

const ChartSection = () => {
  const { isDarkMode } = useTheme();
  const [selectedState, setSelectedState] = useState("");

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
  };
  const isMobile = useIsMobile();

  // Theme-aware colors
  const chartColors = {
    primary: "var(--color-primary)",
    secondary: isDarkMode ? "#374151" : "#e5e7eb",
    success: "var(--color-success)",
    info: "var(--color-info)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
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

  const districtData = {
    Maharashtra: [
      { district: "Mumbai", progress: 90 },
      { district: "Pune", progress: 85 },
      { district: "Nagpur", progress: 75 },
    ],
    Gujarat: [
      { district: "Ahmedabad", progress: 82 },
      { district: "Surat", progress: 75 },
      { district: "Vadodara", progress: 80 },
    ],
    // Add more district data for other states
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
    grid: {
      line: {
        stroke: isDarkMode ? "#374151" : "#e5e7eb",
      },
    },
  };

  const pieData = [
    {
      id: "completed",
      label: "Completed",
      value: 75,
      color: "var(--color-primary)",
    },
    {
      id: "remaining",
      label: "Remaining",
      value: 25,
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
  const chartData = selectedState
    ? districtData[selectedState] || statesData
    : statesData;
  const elevatedCardClass = `
    bg-[var(--color-surface)] 
    p-6 
    rounded-xl 
    ${
      isDarkMode
        ? "shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
        : "shadow-2xl hover:shadow-3xl"
    } 
    transition-all 
    duration-300 
    transform 
    theme-transition
  `;
  return (
    <>
      {/* Circular Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={elevatedCardClass}>
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            Project Completion Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ResponsivePie
                {...pieChartProps}
                data={pieData}
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
        </div>

        <div className={elevatedCardClass}>
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            Budget Utilization
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ResponsivePie
                data={pieData}
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

        <div className={elevatedCardClass}>
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            School Implementation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ResponsivePie
                data={pieData}
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
                        <tspan>{pieData[0].value}%</tspan>
                      </text>
                    </g>
                  ),
                ]}
              />
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Bar Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-outfit font-medium text-[var(--color-text)]">
            Filters
          </h3>
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
      </div>

      <div className={elevatedCardClass}>
        <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
          {selectedState ? `${selectedState} Progress` : "State-wise Progress"}
        </h3>
        <div className="h-96">
          <div style={{ height: isMobile ? "100%" : "100%" }}>
            <ResponsiveBar
              data={chartData}
              keys={["progress"]}
              indexBy={selectedState ? "district" : "state"}
              margin={{
                top: 20,
                right: 20,
                bottom: isMobile ? 30 : 70,
                left: isMobile ? 70 : 60,
              }}
              padding={0.3}
              layout={isMobile ? "horizontal" : "vertical"}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={["var(--color-primary)"]}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: isMobile ? 0 : -45,
                legend: isMobile ? "Progress (%)" : "",
                legendPosition: "middle",
                legendOffset: 40,
                truncateTickAt: 0,
              }}
              enableGridY={true}
              enableGridX={false}
              gridYValues={5}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: "var(--color-text)",
                      fontSize: 12,
                      fontFamily: "Red Hat Display",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: isDarkMode ? "#374151" : "#e5e7eb",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartSection;
