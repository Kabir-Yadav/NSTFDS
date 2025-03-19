import React from 'react';

const RiskTable_ = () => {
  const risks = [
    { id: 1, description: 'Low Program Adoption', probability: 4, impact: 5, score: 20, priority: 'High' },
    { id: 2, description: 'Budget Overruns', probability: 3, impact: 4, score: 12, priority: 'Medium' },
    { id: 3, description: 'Technical Issues with CRM Integration', probability: 3, impact: 5, score: 15, priority: 'High' },
    { id: 4, description: 'Data Privacy and Security Compliance Issues', probability: 2, impact: 5, score: 10, priority: 'High' },
    { id: 5, description: 'Negative Customer Feedback', probability: 3, impact: 3, score: 9, priority: 'Medium' },
    { id: 6, description: 'High Operational Costs', probability: 2, impact: 4, score: 8, priority: 'Medium' },
    { id: 7, description: 'Competitor Response (Enhanced Loyalty Programs)', probability: 3, impact: 4, score: 12, priority: 'Medium' },
    { id: 8, description: 'Inadequate Staff Training', probability: 2, impact: 3, score: 6, priority: 'Low' },
    { id: 9, description: 'Ineffective Communication Strategy', probability: 3, impact: 3, score: 9, priority: 'Medium' },
    { id: 10, description: 'Low Engagement in Loyalty Activities', probability: 3, impact: 4, score: 12, priority: 'High' }
  ];

  const ScaleInfo = ({ title, items }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">{item.level}:</span> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-left text-gray-700">Risk Description</th>
              <th className="p-4 text-center text-gray-700">Probability (1-5)</th>
              <th className="p-4 text-center text-gray-700">Impact (1-5)</th>
              <th className="p-4 text-center text-gray-700">Risk Score (P × I)</th>
              <th className="p-4 text-center text-gray-700">Priority</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk, index) => (
              <tr key={risk.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="p-4 text-gray-800">{risk.id}. {risk.description}</td>
                <td className="p-4 text-center text-gray-800">{risk.probability}</td>
                <td className="p-4 text-center text-gray-800">{risk.impact}</td>
                <td className="p-4 text-center text-gray-800">{risk.score}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-sm 
                    ${risk.priority === 'High' ? 'bg-red-100 text-red-700' : 
                    risk.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'}`}>
                    {risk.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8 p-6 bg-gray-50 rounded-lg">
        <ScaleInfo
          title="Scoring Scales"
          items={[
            { level: "Probability (1-5)", description: "1: Very Low, 2: Low, 3: Medium, 4: High, 5: Very High" },
            { level: "Impact (1-5)", description: "1: Negligible, 2: Minor, 3: Moderate, 4: Major, 5: Catastrophic" }
          ]}
        />
        <ScaleInfo
          title="Priority Levels"
          items={[
            { level: "High (16-25)", description: "Immediate attention and robust mitigation strategies required" },
            { level: "Medium (9-15)", description: "Monitor closely and prepare mitigation strategies" },
            { level: "Low (1-8)", description: "Manage with standard procedures" }
          ]}
        />
      </div>
    </div>
  );
};

export default RiskTable_;