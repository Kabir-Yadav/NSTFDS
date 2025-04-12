import React, { useEffect, useState } from "react";
import {
  fetchDistrictProgressByState,
  fetchStateProgress,
} from "../../../action/supabase_actions";
import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "../../../context/ThemeContext";

const BarChartSection = ({ stateList }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("");
  const [districtProgressData, setDistrictProgressData] = useState([]);

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

  useEffect(() => {
    async function loadDistrictProgress() {
      setLoading(true);
      const progressData = await fetchDistrictProgressByState(selectedState, {
        onLoadingStart: () => setLoading(true),
        onLoadingEnd: () => setLoading(false),
      });

      setDistrictProgressData(progressData);
      setLoading(false);
    }
    async function loadStateProgress() {
      setLoading(true);
      const progress = await fetchStateProgress({
        onLoadingStart: () => setLoading(true),
        onLoadingEnd: () => setLoading(false),
      });
      setDistrictProgressData(progress);
      setLoading(false);
    }
    if (selectedState) {
      loadDistrictProgress();
    } else {
      loadStateProgress();
    }
  }, [selectedState]);

  const chartData = districtProgressData;

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
          {stateList.map((state) => (
            <option
              key={state}
              value={state}
              className="bg-white dark:bg-gray-800"
            >
              {state}
            </option>
          ))}
        </select>
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
    </div>
  );
};
export { BarChartSection };
