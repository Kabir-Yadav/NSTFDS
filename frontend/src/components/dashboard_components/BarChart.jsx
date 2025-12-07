import React, { useEffect, useState, useRef } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const BarChartSection = ({
  stateList,
  selectedState,
  selectedPsu,
  barChartData, // Data passed from parent: { data: [], keys: [] }
  isLoading,
}) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState(["progress"]);
  const chartContainerRef = useRef(null);
  const outerContainerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(600);

  //------------------------------------RESPONSIVE CHECKS------------------------------------------------------------

  // Responsive check with more detailed breakpoints
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
      updateChartWidth();
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Update chart width based on container and data
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // Create an observer that calls updateChartWidth() on ANY size change
    const observer = new ResizeObserver(() => {
      updateChartWidth();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [chartContainerRef.current, data, isMobile]);

  // 3. Ensure updateChartWidth always reads container width:
  const updateChartWidth = () => {
    const container = chartContainerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    if (isMobile) {
      // match flex container exactly
      setChartWidth(containerWidth);
    } else {
      // keep your existing logic for desktop
      const minItemWidth = 60;
      const desiredWidth = Math.max(
        data.length * minItemWidth,
        containerWidth,
        600
      );
      setChartWidth(desiredWidth);
    }
  };

  useEffect(() => {
    updateChartWidth();
  }, [data]);

  //------------------------------------DATA LOADING------------------------------------------------------------

  // Use data from props only - no fallback API calls
  useEffect(() => {
    // Use data from props if available
    if (barChartData && barChartData.data && barChartData.data.length > 0) {
      setData(barChartData.data);
      setKeys(barChartData.keys || ["progress"]);
      setLoading(false);
    } else {
      // No data available - log error and show empty state
      if (selectedState && selectedPsu) {
        console.error(
          `Error: Bar chart data not available for PSU: ${selectedPsu}, State: ${selectedState}`
        );
      } else if (selectedPsu) {
        console.error(
          `Error: Bar chart data not available for PSU: ${selectedPsu}`
        );
      } else if (selectedState) {
        console.error(
          `Error: Bar chart data not available for State: ${selectedState}`
        );
      } else {
        console.error("Error: Bar chart data not available");
      }
      setData([]);
      setKeys(barChartData?.keys || ["progress"]);
      setLoading(false);
    }
  }, [barChartData, selectedState, selectedPsu]);

  // Sync loading state with parent
  useEffect(() => {
    if (isLoading !== undefined) {
      setLoading(isLoading);
    }
  }, [isLoading]);

  //------------------------------------DATA TRANSFORMATION------------------------------------------------------------

  // Determine index field
  const getIndexBy = () => {
    if (selectedState && selectedPsu) return "project";
    if (selectedState) return "district";
    return "state";
  };

  // Compose title
  const getTitle = () => {
    if (selectedState && selectedPsu)
      return `${selectedPsu} Projects in ${selectedState}`;
    if (selectedState) return `${selectedState} Progress`;
    if (selectedPsu) return `${selectedPsu} Budget Allocation`;
    return "State-wise Progress";
  };

  // Group mode for bar chart
  const groupMode = keys.length > 1 ? "grouped" : "stacked";

  // Format label for x-axis
  const formatAxisLabel = (value) => {
    if (!value) return "";
    if (value.toString().length > 10) {
      return `${value.toString().slice(0, 8)}...`;
    }
    return value;
  };

  const formatNumber = (value) => {
    if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
    if (value >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return `${value}`;
  };

  //------------------------------------VARIABLES------------------------------------------------------------

  // Add these variables below your breakpoints (isMobile, isSmallMobile):
  const mobileBarHeight = isSmallMobile ? 40 : 50;
  const mobileMaxHeight = 600; // Maximum height before scroll
  const chartHeight = isMobile
    ? Math.min(data.length * mobileBarHeight, mobileMaxHeight)
    : 450; // Fixed height on desktop

  //------------------------------------RENDERING------------------------------------------------------------

  return (
    <div className="bg-[var(--color-surface)] rounded-xl transition-all duration-300">
      <div className=" pt-6">
        <h3
          className={`${
            isMobile ? "text-lg" : "text-xl"
          } font-outfit font-medium mb-4 border-l-4 border-[var(--color-primary)] pl-4 text-[var(--color-text)]`}
        >
          {getTitle()}
        </h3>
      </div>
      <div
        className={`${
          isMobile ? "p-3" : "p-2"
        } bg-[var(--color-surface-secondary)] rounded-br-xl rounded-bl-xl relative`}
        ref={outerContainerRef}
      >
        {/* Loading overlay positioned relative to outer container */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] rounded-xl z-10"
            >
              <div className="flex flex-col items-center">
                <svg
                  className={`animate-spin ${
                    isSmallMobile ? "h-8 w-8" : "h-12 w-12"
                  } text-[var(--color-primary)]`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span
                  className={`mt-2 ${
                    isSmallMobile ? "text-xs" : "text-sm"
                  } text-[var(--color-text)]`}
                >
                  {isSmallMobile ? "Loading..." : "Loading data..."}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={chartContainerRef}
          className={`${
            isMobile
              ? "overflow-y-auto overflow-x-hidden" // only vertical scroll on mobile
              : "overflow-x-auto overflow-y-hidden" // only horizontal on desktop
          }`}
        >
          <div
            style={{
              width: `${chartWidth}px`,
              height: data.length > 0 ? chartHeight : "200px",
              position: "relative",
              minHeight: "100px",
            }}
            className="inline-block"
          >
            {data.length > 0 ? (
              <AnimatePresence mode="wait">
                {!loading && (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full"
                  >
                    <ResponsiveBar
                      data={data}
                      keys={keys}
                      indexBy={getIndexBy()}
                      margin={{
                        top: 30,
                        right: isSmallMobile ? 15 : 20,
                        bottom: isSmallMobile ? 50 : isMobile ? 30 : 70,
                        left: isSmallMobile ? 60 : isMobile ? 80 : 75,
                      }}
                      padding={data.length <= 3 ? 0.6 : isMobile ? 0.15 : 0.3}
                      layout={isMobile ? "horizontal" : "vertical"}
                      groupMode={groupMode}
                      colors={({ id }) =>
                        id === "progress"
                          ? "var(--color-primary)"
                          : id === "allocatedBudget"
                          ? "var(--color-primary)"
                          : "var(--color-secondary)"
                      }
                      animate={true}
                      motionConfig="gentle"
                      enableLabel={false} // Disable bar labels to reduce clutter when showing all data
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        // Removed axis rotation in small mobile
                        format: formatAxisLabel,
                        // On mobile with lots of data, limit the number of ticks shown
                        tickValues:
                          isMobile && data.length > 8
                            ? Math.min(8, data.length)
                            : undefined,

                        renderTick: (tick) => {
                          // For mobile with many items, show fewer ticks for clarity
                          return (
                            <g transform={`translate(${tick.x},${tick.y})`}>
                              <line
                                stroke="var(--color-text)"
                                strokeWidth={1.5}
                                y2={6}
                              />
                              <text
                                textAnchor={isMobile ? "middle" : "end"}
                                dominantBaseline="text-before-edge"
                                transform={`translate(0,${
                                  isMobile ? 8 : 8
                                }) rotate(${isMobile ? -30 : -35})`}
                                style={{
                                  fontSize: isSmallMobile ? 10 : 12,
                                  fill: "var(--color-text)",
                                }}
                              >
                                {/* Check if value is numerical and format accordingly */}
                                {isNaN(tick.value)
                                  ? isMobile
                                    ? tick.value?.toString().length > 10
                                      ? tick.value.toString().slice(0, 8) +
                                        "..."
                                      : tick.value
                                    : formatAxisLabel(tick.value)
                                  : formatNumber(tick.value)}
                              </text>
                            </g>
                          );
                        },
                      }}
                      axisLeft={{
                        // Remove legend in mobile
                        legend: isMobile
                          ? ""
                          : keys.length > 1
                          ? "Budget (₹)"
                          : "Progress (%)",
                        legendPosition: "middle",
                        legendOffset: -55,
                        tickValues: isSmallMobile ? 5 : undefined,
                        renderTick: (tick) => {
                          return (
                            <g transform={`translate(${tick.x},${tick.y})`}>
                              <line
                                stroke="var(--color-text)"
                                strokeWidth={1.5}
                                x2={-6}
                              />
                              <text
                                textAnchor="end"
                                dominantBaseline="middle"
                                transform={`translate(-10,0)`} // Adjusted for left axis
                                style={{
                                  fontSize: isSmallMobile ? 10 : 12,
                                  fill: "var(--color-text)",
                                }}
                              >
                                {/* Check if value is numerical and format accordingly */}
                                {isNaN(tick.value)
                                  ? formatAxisLabel(tick.value)
                                  : formatNumber(tick.value)}
                              </text>
                            </g>
                          );
                        },
                      }}
                      enableGridY={true}
                      enableGridX={false}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: "color",
                        modifiers: [["darker", 2.5]],
                      }}
                      borderRadius={3}
                      innerPadding={data.length <= 3 ? 8 : isMobile ? 1 : 4}
                      // More responsive tooltip
                      tooltip={({ id, value, color, indexValue }) => (
                        <div
                          className={`bg-[var(--color-surface)] shadow-lg ${
                            isSmallMobile ? "p-2" : "p-3"
                          } rounded-md border border-[var(--color-border)]`}
                        >
                          <strong
                            className={`block text-[var(--color-text)] ${
                              isSmallMobile ? "text-xs" : ""
                            }`}
                          >
                            {indexValue}
                          </strong>
                          <div className="flex items-center mt-1">
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span
                              className={`text-[var(--color-text)] ${
                                isSmallMobile ? "text-xs" : ""
                              }`}
                            >
                              {id === "progress"
                                ? `${value}%`
                                : id === "allocatedBudget"
                                ? `${isMobile ? "₹" : "Allocated: ₹"}${
                                    isMobile
                                      ? value >= 1e6
                                        ? (value / 1e6).toFixed(1) + "M"
                                        : value >= 1e3
                                        ? (value / 1e3).toFixed(0) + "K"
                                        : value
                                      : value.toLocaleString()
                                  }`
                                : `${isMobile ? "₹" : "Used: ₹"}${
                                    isMobile
                                      ? value >= 1e6
                                        ? (value / 1e6).toFixed(1) + "M"
                                        : value >= 1e3
                                        ? (value / 1e3).toFixed(0) + "K"
                                        : value
                                      : value.toLocaleString()
                                  }`}
                            </span>
                          </div>
                        </div>
                      )}
                      // Simplified legend on mobile
                      legends={
                        keys.length > 1
                          ? [
                              {
                                dataFrom: "keys",
                                anchor: "top", // ← move legend to top
                                direction: "row",
                                // push it down from the very top a bit:
                                translateY: isSmallMobile
                                  ? -10
                                  : isMobile
                                  ? -28
                                  : -30,
                                itemsSpacing: isSmallMobile
                                  ? 50
                                  : isMobile
                                  ? 40
                                  : 15,
                                itemWidth: isSmallMobile
                                  ? 60
                                  : isMobile
                                  ? 80
                                  : 100,
                                itemHeight: isSmallMobile ? 16 : 20,
                                symbolSize: isSmallMobile ? 8 : 12,
                                symbolShape: "circle",
                                itemTextColor: "var(--color-text)",
                                itemDirection: "left-to-right",
                                itemOpacity: ".7",

                                effects: [
                                  {
                                    on: "hover",
                                    style: {
                                      itemTextColor: "var(--color-primary)",
                                    },
                                  },
                                ],
                              },
                            ]
                          : []
                      }
                      theme={{
                        axis: {
                          ticks: {
                            text: {
                              fill: "var(--color-text)",
                              fontSize: isSmallMobile ? 10 : 12,
                              fontWeight: isMobile ? 500 : 400,
                              fontFamily: "outfit",
                            },
                          },
                          legend: {
                            text: {
                              fill: "var(--color-text)",
                              fontSize: isMobile ? 12 : 14,
                              fontWeight: 500,
                              fontFamily: "redhat",
                            },
                          },
                        },
                        grid: {
                          // Reduce grid lines on mobile for cleaner look
                          line: {
                            stroke: isDarkMode
                              ? `rgba(55, 65, 81, ${isMobile ? 0.4 : 0.6})`
                              : `rgba(229, 231, 235, ${isMobile ? 0.6 : 0.8})`,
                            strokeDasharray: isMobile ? "2 4" : "4 4",
                          },
                        },
                        tooltip: {
                          container: {
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            fontSize: isSmallMobile ? 10 : 12,
                            // Reduce padding on mobile
                            padding: isSmallMobile ? "6px" : "12px",
                          },
                        },
                        // Reduce label sizes on mobile
                        labels: {
                          text: {
                            fontSize: isSmallMobile ? 9 : isMobile ? 10 : 11,
                            fontWeight: isMobile ? 600 : 500,
                          },
                        },
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="flex items-center justify-center h-full">
                <h3 className="text-center text-gray-500 dark:text-gray-400">
                  No data available
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { BarChartSection };
