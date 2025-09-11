import { ResponsivePie } from "@nivo/pie";
import { ResponsiveContainer } from "recharts";

const CompletionCard = ({
  pieChartProps,
  pieDataCompletion,
  chartTheme,
  chartColors,
  completionRate,
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
      <ResponsiveContainer width="100%" height="100%" className="animate-fade-up">
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
          layers={[
            "arcs",
            "arcLabels",
            "arcLinkLabels",
            "legends",
            ({ centerX, centerY }) => (
              <g>
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "22px",
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
                  <tspan>{Number(completionRate).toFixed(2)}%</tspan>
                </text>
                <text
                  x={centerX}
                  y={centerY + 22}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "12px",
                    fill: chartColors.textSecondary,
                  }}
                >
                  COMPLETED
                </text>
              </g>
            ),
          ]}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionCard;
