import React from "react";

const SummaryCards = ({ stats, loading, selectedState }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {selectedState ===
      '' &&(
        <SummaryCard
          title="Total States"
          value={stats.totalStates}
          icon="🏛️"
          color="bg-[var(--color-info)]"
          loading={loading}
        />
      )}
    <SummaryCard
      title="Total Districts"
      value={stats.totalDistricts}
      icon="📍"
      color="bg-[var(--color-primary)]"
      loading={loading}
    />
    <SummaryCard
      title="Total Schools"
      value={stats.totalSchools}
      icon="🏫"
      color="bg-[var(--color-success)]"
      loading={loading}
    />
    <SummaryCard
      title="Active Projects"
      value={stats.activeProjects}
      icon="📊"
      color="bg-[var(--color-warning)]"
      loading={loading}
    />
  </div>
);

const SummaryCard = ({ title, value, icon, color, loading }) => (
  <div
    className={`rounded-xl p-6 flex items-center theme-transition shadow-xl  
              bg-gradient-to-br from-[var(--color-surface)] to-[rgba(255,255,255,0.02)] 
              backdrop-blur-[2px] border border-[rgba(255,255,255,0.05)] transition-all`}
  >
    <div
      className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mr-4 opacity-80`}
    >
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex-1">
      <h3 className="text-[var(--color-text-secondary)] font-redhat text-sm mb-1">
        {title}
      </h3>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      ) : (
        <p className="text-2xl font-outfit font-semibold text-[var(--color-text)]">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  </div>
);

export default SummaryCards;
