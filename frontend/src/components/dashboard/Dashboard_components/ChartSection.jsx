import React from "react";
import {

  ResponsiveContainer,

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
      { district: "Mumbai", progress: 93 },
      { district: "Pune", progress: 88 },
      { district: "Nagpur", progress: 82 },
      { district: "Thane", progress: 86 },
      { district: "Nashik", progress: 79 },
      { district: "Aurangabad", progress: 74 },
      { district: "Solapur", progress: 71 },
      { district: "Kolhapur", progress: 77 },
      { district: "Amravati", progress: 69 }
    ],
    Gujarat: [
      { district: "Ahmedabad", progress: 85 },
      { district: "Surat", progress: 81 },
      { district: "Vadodara", progress: 77 },
      { district: "Rajkot", progress: 73 },
      { district: "Bhavnagar", progress: 68 },
      { district: "Jamnagar", progress: 71 },
      { district: "Gandhinagar", progress: 79 },
      { district: "Junagadh", progress: 65 },
      { district: "Kutch", progress: 62 }
    ],
    Karnataka: [
      { district: "Bangalore Urban", progress: 96 },
      { district: "Mysore", progress: 89 },
      { district: "Mangalore", progress: 87 },
      { district: "Hubli-Dharwad", progress: 83 },
      { district: "Belgaum", progress: 79 },
      { district: "Gulbarga", progress: 75 },
      { district: "Shimoga", progress: 81 },
      { district: "Tumkur", progress: 77 },
      { district: "Hassan", progress: 73 }
    ],
    "Tamil Nadu": [
      { district: "Chennai", progress: 91 },
      { district: "Coimbatore", progress: 87 },
      { district: "Madurai", progress: 84 },
      { district: "Salem", progress: 79 },
      { district: "Trichy", progress: 82 },
      { district: "Tirunelveli", progress: 75 },
      { district: "Vellore", progress: 77 },
      { district: "Erode", progress: 80 },
      { district: "Thanjavur", progress: 73 }
    ],
    Rajasthan: [
      { district: "Jaipur", progress: 79 },
      { district: "Jodhpur", progress: 71 },
      { district: "Udaipur", progress: 68 },
      { district: "Kota", progress: 74 },
      { district: "Ajmer", progress: 66 },
      { district: "Bikaner", progress: 63 },
      { district: "Alwar", progress: 69 },
      { district: "Bharatpur", progress: 61 },
      { district: "Sikar", progress: 58 }
    ],
    MP: [
      { district: "Bhopal", progress: 73 },
      { district: "Indore", progress: 71 },
      { district: "Jabalpur", progress: 64 },
      { district: "Gwalior", progress: 67 },
      { district: "Ujjain", progress: 59 },
      { district: "Sagar", progress: 55 },
      { district: "Rewa", progress: 52 },
      { district: "Satna", progress: 57 },
      { district: "Dewas", progress: 61 }
    ],
    UP: [
      { district: "Lucknow", progress: 76 },
      { district: "Kanpur", progress: 71 },
      { district: "Varanasi", progress: 73 },
      { district: "Agra", progress: 67 },
      { district: "Prayagraj", progress: 69 },
      { district: "Meerut", progress: 65 },
      { district: "Gorakhpur", progress: 61 },
      { district: "Aligarh", progress: 58 },
      { district: "Moradabad", progress: 63 }
    ],
    Bihar: [
      { district: "Patna", progress: 67 },
      { district: "Gaya", progress: 59 },
      { district: "Muzaffarpur", progress: 57 },
      { district: "Bhagalpur", progress: 55 },
      { district: "Darbhanga", progress: 52 },
      { district: "Purnia", progress: 48 },
      { district: "Begusarai", progress: 54 },
      { district: "Nalanda", progress: 58 },
      { district: "Samastipur", progress: 51 }
    ]
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
      value: 75,
      color: 'var(--color-success)',
    },
    {
      id: "remaining",
      label: "Remaining",
      value: 25,
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  const pieDataBudget = [
    {
      id: "utilized",
      label: "Utilized",
      value: 60,
      color: 'var(--color-error)',
    },
    {
      id: "unutilized",
      label: "Unutilized",
      value: 40,
      color: isDarkMode ? "#374151" : "#e5e7eb", // warning yellow
    },
  ];

  const pieDataSchool = [
    {
      id: "done",
      label: "Done",
      value: 40,
      color: 'var(--color-warning)',
    },
    {
      id: "pending",
      label: "Pending",
      value: 60,
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
    transition-all 
    duration-300 
    transform 
    theme-transition
  `;
  return (
    <>
      {/* Circular Charts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className={elevatedCardClass}>
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            Project Completion Rate
          </h3>
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
        </div>

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

        <div className={`${elevatedCardClass} col-span-1 sm:col-span-2 lg:col-span-1`}>
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
               bg-white dark:bg-gray-800 z-0
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
