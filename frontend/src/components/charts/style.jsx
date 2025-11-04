const createChartConfig = ({
  isDarkMode,
  completionRate,
  budgetUtilization,
  implementationRate,
}) => {
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
  const elevatedCardClass = `
    bg-[var(--color-surface)] 
    rounded-xl 
    transition-all 
    duration-300 
    transform 
    theme-transition
  `;

  const chartColors = {
    primary: "var(--color-primary)",
    secondary: isDarkMode ? "#374151" : "#e5e7eb",
    success: "var(--color-success)",
    info: "var(--color-info)",
    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",
  };

  const chartTheme = {
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
      value: completionRate,
      color: "var(--color-success)",
    },
    {
      id: "remaining",
      label: "Remaining",
      value: Number(100 - completionRate).toFixed(2),
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  const pieDataBudget = [
    {
      id: "utilized",
      label: "Utilized",
      value: budgetUtilization,
      color: "var(--color-error)",
    },
    {
      id: "unutilized",
      label: "Unutilized",
      value: Number(100 - budgetUtilization).toFixed(2),
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  const pieDataSchool = [
    {
      id: "done",
      label: "Done",
      value: implementationRate,
      color: "var(--color-warning)",
    },
    {
      id: "pending",
      label: "Pending",
      value: 100 - implementationRate,
      color: isDarkMode ? "#374151" : "#e5e7eb",
    },
  ];

  return {
    pieChartProps,
    elevatedCardClass,
    chartColors,
    chartTheme,
    pieDataCompletion,
    pieDataBudget,
    pieDataSchool,
  };
};

export default createChartConfig;
