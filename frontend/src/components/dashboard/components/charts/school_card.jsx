import { ResponsivePie } from "@nivo/pie";
import { ResponsiveContainer } from "recharts";

const SchoolCard = ({pieDataSchool,chartTheme,implementationRate,pieChartProps,chartColors}) => {
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
                  <tspan>{implementationRate}%</tspan>
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
                  COMPLETE
                </text>
              </g>
            ),
          ]}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default SchoolCard;