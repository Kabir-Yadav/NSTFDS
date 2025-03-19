// import React from 'react';

// const GanttChart = () => {
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
//   const tasks = [
//     {
//       id: 1,
//       name: 'Pilot Phase',
//       startMonth: 0,
//       duration: 3,
//       subtasks: 'Develop and test predictive analytics & dynamic pricing'
//     },
//     {
//       id: 2,
//       name: 'Rollout Phase',
//       startMonth: 3,
//       duration: 6,
//       subtasks: 'Implement analytics and pricing strategies'
//     },
//     {
//       id: 3, 
//       name: 'Optimization Phase',
//       startMonth: 9,
//       duration: 3,
//       subtasks: 'Monitor KPIs and collect feedback'
//     }
//   ];

//   return (
//     <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
//       <div className="flex items-center justify-center mb-8 space-x-4">
//         <img 
//           src="https://thehardcopy.co/wp-content/uploads/Zepto-Featured-Image-Option-2-1920x1288.png" 
//           alt="Zepto Logo" 
//           className="h-12 w-auto" 
//         />
//         <h2 className="text-xl font-semibold text-gray-900">
//           Implementation Plan for Zepto's Strategic Changes
//         </h2>
//       </div>
      
//       <div className="relative">
//         <div className="flex border-b border-gray-200 mb-4">
//           <div className="w-48"></div>
//           {months.map((month) => (
//             <div key={month} className="flex-1 text-center text-sm text-gray-600 font-medium">
//               {month}
//             </div>
//           ))}
//         </div>

//         <div className="space-y-12">
//           {tasks.map((task) => (
//             <div key={task.id}>
//               <div className="flex items-center mb-2">
//                 <div className="w-48 pr-4 text-sm font-medium text-gray-700">
//                   {task.name}
//                 </div>
//                 <div className="flex-1 relative h-8">
//                   <div 
//                     className="absolute h-full rounded-md"
//                     style={{
//                       left: `${(task.startMonth / 12) * 100}%`,
//                       width: `${(task.duration / 12) * 100}%`,
//                       backgroundColor: '#FF5C83'
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className="ml-48 text-sm text-gray-600">
//                 <p>{task.subtasks}</p>
//                 <p className="text-gray-500 mt-1">Duration: {task.duration} months</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="absolute top-0 left-48 right-0 bottom-0 flex pointer-events-none">
//           {months.map((_, index) => (
//             <div 
//               key={index}
//               className="flex-1 border-l border-gray-100"
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GanttChart;

import React from 'react';

const GanttChart = () => {
  const phases = [
    { 
      id: 1,
      name: 'Planning and Requirement Analysis',
      start: 1,
      duration: 2,
      months: '(1-2)'
    },
    {
      id: 2,
      name: 'Prototype Development and Pilot Testing',
      start: 3,
      duration: 6,
      months: '(3-8)'
    },
    {
      id: 3,
      name: 'System Integration and Full-Scale Deployment',
      start: 9,
      duration: 4,
      months: '(9-12)'
    },
    {
      id: 4,
      name: 'Optimization And Market Expansion',
      start: 13,
      duration: 6,
      months: '(13-18)'
    },
    {
      id: 5,
      name: 'Long-Term Sustainability and Innovation',
      start: 19,
      duration: 6,
      months: '(19-24)'
    }
  ];

  const months = Array.from({ length: 24 }, (_, i) => `Month ${i + 1}`);

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-bold mb-4">Enhanced Implementation Plan Timeline</h2>
      
      <div className="flex mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-sky-300 mr-2"></div>
          <span>Implementation Phase</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="relative">
        <div className="flex">
          {/* Phase labels column */}
          <div className="w-48 flex-shrink-0">
            <div className="h-8 font-semibold">Phases</div>
            {phases.map(phase => (
              <div key={phase.id} className="h-12 flex items-center">
                Phase {phase.id}
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="flex-grow">
            <div className="flex flex-col">
              {/* Month headers */}
              <div className="flex border-b">
                {months.map((month, index) => (
                  <div
                    key={month}
                    className="flex-1 h-8 text-sm text-center transform -rotate-30 origin-left"
                    style={{
                      minWidth: `${100 / months.length}%`, // Dynamically distribute space
                      marginTop: '20px'
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              {/* Grid rows with bars */}
              {phases.map(phase => (
                <div key={phase.id} className="flex h-12 relative">
                  {/* Phase name */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-sm">
                    {phase.name} {phase.months}
                  </div>

                  {/* Grid columns */}
                  {months.map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 h-full border-r border-gray-200"
                    >
                      {index === phase.start - 1 && (
                        <div
                          className="h-8 bg-sky-300 rounded"
                          style={{
                            position: 'absolute',
                            left: `calc(${(phase.start - 1) * (100 / months.length)}%)`,
                            width: `calc(${phase.duration * (100 / months.length)}%)`, // Dynamically scale bars
                            marginTop: '8px'
                          }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;




