import React from "react";

const SummaryCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <SummaryCard
      title="Total States"
      value={stats.totalStates}
      icon="🏛️"
      color="bg-[var(--color-info)]"
    />
    <SummaryCard
      title="Total Districts"
      value={stats.totalDistricts}
      icon="📍"
      color="bg-[var(--color-primary)]"
    />
    <SummaryCard
      title="Total Schools"
      value={stats.totalSchools}
      icon="🏫"
      color="bg-[var(--color-success)]"
    />
    <SummaryCard
      title="Active Projects"
      value={stats.activeProjects}
      icon="📊"
      color="bg-[var(--color-warning)]"
    />
  </div>
);

const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-[var(--color-surface)] rounded-xl shadow-sm p-6 flex items-center theme-transition">
    <div
      className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mr-4 opacity-80`}
    >
      <span className="text-2xl">{icon}</span>
    </div>
    <div>
      <h3 className="text-[var(--color-text-secondary)] font-redhat text-sm mb-1">
        {title}
      </h3>
      <p className="text-2xl font-outfit font-semibold text-[var(--color-text)]">
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

export default SummaryCards;
