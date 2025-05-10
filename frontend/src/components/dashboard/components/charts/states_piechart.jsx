import { ResponsivePie } from '@nivo/pie';

const StatesPieChart = ({ stateBudgetData, formatBudget }) => {
    // Function to shorten state names
    const shortenStateName = (name) => {
        // Common abbreviations for Indian states
        const stateAbbreviations = {
            "Andhra Pradesh": "AP",
            "Arunachal Pradesh": "AR",
            "Assam": "AS",
            "Bihar": "BR",
            "Chhattisgarh": "CG",
            "Goa": "GA",
            "Gujarat": "GJ",
            "Haryana": "HR",
            "Himachal Pradesh": "HP",
            "Jharkhand": "JH",
            "Karnataka": "KA",
            "Kerala": "KL",
            "Madhya Pradesh": "MP",
            "Maharashtra": "MH",
            "Manipur": "MN",
            "Meghalaya": "ML",
            "Mizoram": "MZ",
            "Nagaland": "NL",
            "Odisha": "OD",
            "Punjab": "PB",
            "Rajasthan": "RJ",
            "Sikkim": "SK",
            "Tamil Nadu": "TN",
            "Telangana": "TS",
            "Tripura": "TR",
            "Uttar Pradesh": "UP",
            "Uttarakhand": "UK",
            "West Bengal": "WB",
            "Delhi": "DL"
        };

        return stateAbbreviations[name] || name.substring(0, 2);
    };

    // Process data to include shortened labels
    const processedData = stateBudgetData.map(state => ({
        ...state,
        shortLabel: shortenStateName(state.label),
        fullLabel: state.label // Preserve the full name for tooltips
    }));

    return (
        <div className="h-full animate-fade-down">
            <ResponsivePie
                data={processedData}
                margin={{ top: 40, right: 40, bottom: 40, left: 25 }}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                // Reduce the label distance from the pie
                arcLinkLabelsOffset={2}
                // Shorten the link lines
                arcLinkLabelsSkipAngle={15}
                arcLinkLabelsDiagonalLength={10}
                arcLinkLabelsStraightLength={10}
                // Use shortened state codes for labels
                arcLinkLabel={d => d.data.shortLabel}
                // Styling for the link lines
                arcLinkLabelsThickness={1.5}
                arcLinkLabelsColor={{ from: "color" }}
                arcLinkLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                // Text label properties
                arcLabelsSkipAngle={30}
                arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
                // Enable labels but make them smaller
                enableArcLabels={false}
                arcLabelsRadiusOffset={0.7}
                // Enhanced tooltip
                tooltip={({ datum }) => (
                    <div className="bg-[var(--color-surface)] p-2 shadow-lg rounded-md border border-[var(--color-border)]">
                        <strong className="block text-[var(--color-text)]">
                            {datum.data.fullLabel}
                        </strong>
                        <div className="flex items-center mt-1">
                            <span
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: datum.color }}
                            ></span>
                            <span className="text-[var(--color-text)]">
                                Budget: ₹{formatBudget(datum.value)}
                            </span>
                        </div>
                    </div>
                )}
                defs={[
                    {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true
                    },
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        rotation: -45,
                        lineWidth: 6,
                        spacing: 10
                    }
                ]}
                // Optional: Add some pattern fills to make the chart more visually distinct
                fill={[
                    { match: (d) => d.index % 3 === 0, id: 'dots' },
                    { match: (d) => d.index % 3 === 1, id: 'lines' }
                ]}
                motionConfig="gentle"
                transitionMode="pushIn"
            />
        </div>
    );
};

export default StatesPieChart;