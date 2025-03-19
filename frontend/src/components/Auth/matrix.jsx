import React from 'react';

const RiskMatrix = () => {
  const risks = [
    { id: 1, name: 'Low Program Adoption', impact: 5, probability: 3 },
    { id: 2, name: 'Budget Overruns', impact: 4, probability: 2 },
    { id: 3, name: 'Technical Issues with CRM Integration', impact: 4, probability: 3 },
    { id: 4, name: 'Poor Data Privacy Compliance', impact: 5, probability: 2 },
    { id: 5, name: 'Negative Customer Feedback', impact: 3, probability: 3 },
    { id: 6, name: 'High Operational Costs', impact: 4, probability: 2 },
    { id: 7, name: 'Competitor Response', impact: 3, probability: 3 },
    { id: 8, name: 'Inadequate Staff Training', impact: 3, probability: 2 },
    { id: 9, name: 'Ineffective Communication Strategy', impact: 3, probability: 3 },
    { id: 10, name: 'Low Engagement in Loyalty Activities', impact: 4, probability: 3 }
  ];

  const GridCell = ({impact, probability, text, color}) => {
    const cellRisks = risks.filter(r => r.impact === impact && r.probability === probability);
    return (
      <div className={`${color} h-24 border border-white relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{text}</span>
        </div>
        <div className="absolute top-1 left-1 flex flex-wrap gap-1">
          {cellRisks.map(risk => (
            <div
              key={risk.id}
              className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs"
            >
              {risk.id}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HeaderCell = ({ children }) => (
    <div className="text-center text-sm py-2 px-1 font-medium text-gray-700">{children}</div>
  );

  const ImpactLabel = ({ children }) => (
    <div className="text-sm py-2 px-2 font-medium text-gray-700">{children}</div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-8 text-center">
        Risk Assessment Matrix - Stay Vista's Loyalty Program
      </h2>
      
      <div className="grid" style={{gridTemplateColumns: '200px repeat(5, 1fr)', gap: '1px'}}>
        <HeaderCell>Impact \ Likelihood</HeaderCell>
        <HeaderCell>Very unlikely<br/>to happen</HeaderCell>
        <HeaderCell>Unlikely<br/>to happen</HeaderCell>
        <HeaderCell>Possibly could<br/>happen</HeaderCell>
        <HeaderCell>Likely<br/>to happen</HeaderCell>
        <HeaderCell>Very likely<br/>to happen</HeaderCell>

        <ImpactLabel>Catastrophic consequences</ImpactLabel>
        <GridCell impact={5} probability={1} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={5} probability={2} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={5} probability={3} text="High" color="bg-pink-200" />
        <GridCell impact={5} probability={4} text="Critical" color="bg-pink-600 text-white" />
        <GridCell impact={5} probability={5} text="Critical" color="bg-pink-600 text-white" />

        <ImpactLabel>Significant consequences</ImpactLabel>
        <GridCell impact={4} probability={1} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={4} probability={2} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={4} probability={3} text="High" color="bg-pink-200" />
        <GridCell impact={4} probability={4} text="Critical" color="bg-pink-600 text-white" />
        <GridCell impact={4} probability={5} text="Critical" color="bg-pink-600 text-white" />

        <ImpactLabel>Moderate consequences</ImpactLabel>
        <GridCell impact={3} probability={1} text="Low" color="bg-emerald-200" />
        <GridCell impact={3} probability={2} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={3} probability={3} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={3} probability={4} text="High" color="bg-pink-200" />
        <GridCell impact={3} probability={5} text="High" color="bg-pink-200" />

        <ImpactLabel>Low consequences</ImpactLabel>
        <GridCell impact={2} probability={1} text="Very Low" color="bg-emerald-200" />
        <GridCell impact={2} probability={2} text="Low" color="bg-emerald-200" />
        <GridCell impact={2} probability={3} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={2} probability={4} text="Moderate" color="bg-yellow-200" />
        <GridCell impact={2} probability={5} text="Moderate" color="bg-yellow-200" />

        <ImpactLabel>Negligible consequences</ImpactLabel>
        <GridCell impact={1} probability={1} text="Very Low" color="bg-emerald-200" />
        <GridCell impact={1} probability={2} text="Very Low" color="bg-emerald-200" />
        <GridCell impact={1} probability={3} text="Very Low" color="bg-emerald-200" />
        <GridCell impact={1} probability={4} text="Very Low" color="bg-emerald-200" />
        <GridCell impact={1} probability={5} text="Very Low" color="bg-emerald-200" />
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <h3 className="font-medium mb-4">Risk Items:</h3>
          <div className="space-y-2">
            {risks.map(risk => (
              <div key={risk.id} className="flex items-start">
                <span className="w-6 text-right mr-2">{risk.id}.</span>
                <span className="flex-1">{risk.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Risk Levels:</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-pink-600 mr-2" />
              <span>Critical</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-pink-200 mr-2" />
              <span>High</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-200 mr-2" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-emerald-200 mr-2" />
              <span>Low/Very Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;