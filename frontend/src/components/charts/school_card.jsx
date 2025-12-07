import { ResponsivePie } from "@nivo/pie";
import { ResponsiveContainer } from "recharts";

const SchoolCard = ({
  pieDataSchool,
  chartTheme,
  implementationRate,
  pieChartProps,
  chartColors,
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
      <ResponsiveContainer
        width="100%"
        height="100%"
        className="animate-fade-up"
      >
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

const ImplementationSummary = ({
  totalSchools = 0,
  completedSchools = 0,
  implementationPct = 0,
}) => {
  const remainingSchools = totalSchools - completedSchools;
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
          {implementationPct.toFixed(1)}%
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
              of {totalSchools} schools
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

export { SchoolCard, ImplementationSummary };
