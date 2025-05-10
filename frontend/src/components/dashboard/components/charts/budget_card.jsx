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
      <ResponsiveContainer width="100%" height="100%" className="animate-fade-up">
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

export default BudgetCard;
