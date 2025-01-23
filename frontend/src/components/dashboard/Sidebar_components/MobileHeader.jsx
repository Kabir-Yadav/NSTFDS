import React from "react";

const MobileHeader = ({ onToggleSidebar, title }) => (
  <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between theme-transition">
    <button
      onClick={onToggleSidebar}
      className="p-2 rounded-lg text-[var(--color-text)]"
      aria-label="Toggle Menu"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
    <h2 className="text-lg font-outfit font-semibold text-[var(--color-text)]">
      {title}
    </h2>
    <div className="w-8" /> {/* Spacer for balance */}
  </div>
);

export default MobileHeader;
