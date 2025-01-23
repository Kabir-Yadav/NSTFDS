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
import { useTheme } from "../../../context/ThemeContext";

const ChartSection = () => {
  const { isDarkMode } = useTheme();

  // Theme-aware colors
  const chartColors = {
    primary: "var(--color-primary)",
    secondary: isDarkMode ? "#374151" : "#e5e7eb",
    success: "var(--color-success)",
    info: "var(--color-info)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
  };

  return (
    <>
      {/* Circular Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm theme-transition">
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            Project Completion Rate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Completed", value: 75, fill: chartColors.primary },
                    {
                      name: "Remaining",
                      value: 25,
                      fill: chartColors.secondary,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Label
                    value="75%"
                    position="center"
                    fill={chartColors.text}
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      fontFamily: "Outfit",
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm theme-transition">
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            Budget Utilization
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Used", value: 82, fill: chartColors.success },
                    {
                      name: "Available",
                      value: 18,
                      fill: chartColors.secondary,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Label
                    value="82%"
                    position="center"
                    fill={chartColors.text}
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      fontFamily: "Outfit",
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm theme-transition">
          <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
            School Implementation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Implemented", value: 68, fill: chartColors.info },
                    { name: "Pending", value: 32, fill: chartColors.secondary },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Label
                    value="68%"
                    position="center"
                    fill={chartColors.text}
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      fontFamily: "Outfit",
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-sm mb-8 theme-transition">
        <h3 className="text-lg font-outfit font-medium mb-4 text-[var(--color-text)]">
          State-wise Progress
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { state: "Maharashtra", progress: 85 },
                { state: "Gujarat", progress: 78 },
                { state: "Karnataka", progress: 92 },
                { state: "Tamil Nadu", progress: 88 },
                { state: "Rajasthan", progress: 72 },
                { state: "Madhya Pradesh", progress: 65 },
                { state: "Uttar Pradesh", progress: 70 },
                { state: "Bihar", progress: 60 },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.secondary}
              />
              <XAxis
                dataKey="state"
                tick={{ fontFamily: "Red Hat Display", fill: chartColors.text }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontFamily: "Red Hat Display", fill: chartColors.text }}
                label={{
                  value: "Progress (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    fontFamily: "Red Hat Display",
                    fill: chartColors.text,
                  },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontFamily: "Red Hat Display",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="progress"
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="progress"
                  position="top"
                  formatter={(value) => `${value}%`}
                  style={{
                    fontFamily: "Red Hat Display",
                    fill: chartColors.textSecondary,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default ChartSection;
