import { ResponsivePie } from "@nivo/pie";
import { ResponsiveContainer } from "recharts";

const BudgetCard = ({ pieDataBudget, pieChartProps, chartTheme }) => {
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
  );
};

const BudgetPSUCard = ({
  StateBudget,
  totalBudget,
  budgetPercentage,
  formatBudget,
}) => {
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
};
export { BudgetCard, BudgetPSUCard };
