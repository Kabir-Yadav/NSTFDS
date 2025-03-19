import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const CostDistributionChart = () => {
  const data = [
    { name: 'Marketing Strategy Setup', value: 10000, percentage: 44.4 },
    { name: 'CRM Integration & Management', value: 5000, percentage: 22.2 },
    { name: 'Discounts for Frequent Patrons', value: 5000, percentage: 22.2 },
    { name: 'Marketing & Promotion Campaigns', value: 2500, percentage: 11.1 },
  ];

  const COLORS = ['#4ade80', '#60a5fa', '#fb923c', '#f87171'];

  const FixedTooltip = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 40; // Position tooltip outside the pie chart
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <foreignObject
          x={x - 50}
          y={y - 30}
          width={100}
          height={60}
        >
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              textAlign: 'center',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 'bold' }}>{data[index].name}</p>
            <p style={{ margin: 0 }}>${data[index].value.toLocaleString()}</p>
            <p style={{ margin: 0 }}>{data[index].percentage.toFixed(1)}%</p>
          </div>
        </foreignObject>
      </g>
    );
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20; // Adjusted for better positioning
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm fill-gray-600"
      >
        {`${data[index].percentage.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold text-center mb-8">
        Cost Distribution for Tiered Loyalty Program
      </h2>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine
              label={<CustomLabel />}
              outerRadius={180}
              innerRadius={120}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              {data.map((entry, index) => (
                <FixedTooltip
                  key={`tooltip-${index}`}
                  cx={250}
                  cy={250}
                  midAngle={(360 / data.length) * index}
                  innerRadius={120}
                  outerRadius={180}
                  value={entry.value}
                  index={index}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(value, entry) => (
                <span className="text-gray-700">
                  {value} (${entry.payload.value.toLocaleString()})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 text-center text-gray-600">
        Total Cost: ${(data.reduce((sum, item) => sum + item.value, 0)).toLocaleString()}
      </div>
    </div>
  );
};

export default CostDistributionChart;
