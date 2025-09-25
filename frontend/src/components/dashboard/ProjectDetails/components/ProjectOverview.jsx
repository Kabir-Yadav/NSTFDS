import {
  Building2,
  Users,
  IndianRupee,
  School,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { formatIndianCurrency } from "../../../../utils/currencyFormatter";

const ProjectOverview = ({ data, projectName, statusList }) => {
  // Calculate comprehensive statistics
  const totalPSUs = new Set(
    data.filter((item) => item.psu_name).map((item) => item.psu_name)
  ).size;
  const totalSchools = new Set(
    data.filter((item) => item.school_name).map((item) => item.school_name)
  ).size;
  const totalSpent = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_cost) || 0),
    0
  );
  const totalRecords = data.length;

  // More accurate completion detection
  const completedDeliveries = data.filter((item) => {
    const status = item.status?.toLowerCase() || "";
    return status === statusList[statusList.length - 1]?.toLowerCase();
  }).length;

  const completionRate =
    totalRecords > 0
      ? ((completedDeliveries / totalRecords) * 100).toFixed(1)
      : 0;

  const stats = [
    {
      title: "Total Records",
      value: totalRecords.toLocaleString(),
      icon: TrendingUp,
      color: "bg-slate-50 text-slate-700 border-slate-200",
      darkColor:
        "dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800",
      iconBg: "bg-slate-100 dark:bg-slate-800/30",
    },
    {
      title: "Participating PSUs",
      value: totalPSUs.toLocaleString(),
      icon: Building2,
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
      darkColor: "dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800",
      iconBg: "bg-cyan-100 dark:bg-cyan-800/30",
    },
    {
      title: "Schools Covered",
      value: totalSchools.toLocaleString(),
      icon: School,
      color: "bg-teal-50 text-teal-700 border-teal-200",
      darkColor: "dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
      iconBg: "bg-teal-100 dark:bg-teal-800/30",
    },
    {
      title: "Total Investment",
      value: formatIndianCurrency(totalSpent),
      fullValue: `₹${totalSpent.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      darkColor:
        "dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-800/30",
      hasTooltip: true,
    },
    {
      title: "Completed Deliveries",
      value: completedDeliveries.toLocaleString(),
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      darkColor:
        "dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
      subtitle: `${completionRate}% completion rate`,
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              relative overflow-hidden rounded-xl border transition-all duration-200 
              hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 
              dark:hover:shadow-gray-900/20 group
              ${stat.color} ${stat.darkColor}
            `}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {stat.value}
                  </h3>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`
                  rounded-lg p-2.5 transition-all duration-200 group-hover:scale-110
                  ${stat.iconBg}
                `}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Project Summary */}
      {totalRecords > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Project Summary
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {projectName} encompasses <strong>{totalRecords}</strong> total
            records across <strong>{totalPSUs}</strong> participating PSUs and{" "}
            <strong>{totalSchools}</strong> schools, with a total investment of{" "}
            <strong>₹{totalSpent.toLocaleString()}</strong>. Current completion
            rate stands at <strong>{completionRate}%</strong> with{" "}
            <strong>{completedDeliveries}</strong> deliveries completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
