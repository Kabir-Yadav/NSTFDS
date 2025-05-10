import React, { useState, useEffect } from "react";

const PSUList = ({
  projects,
  selectedPsu,
  onProjectSelect,
  isOpen,
  setIsSidebarOpen,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
    setIsSidebarOpen(true);
  };

  useEffect(() => {
    if (selectedPsu) {
      setIsExpanded(true);
    }
  }, [selectedPsu]);

  return (
    <nav>
      {/* PSU Toggle Header */}
      <li
        onClick={handleHeaderClick}
        className={`
          flex
          px-4 py-3
          text-[#433c3a]
          rounded-r-full
          cursor-pointer transition-all
          items-center duration-300 ease-in-out hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)]
          ${isOpen ? "justify-start" : "justify-center"}
          ${
            selectedPsu
              ? `${isOpen?'border-l-[5px]':'md:border-l-[5px]'} border-[var(--color-primary)]
                bg-[var(--color-primary-hover)] text-[var(--color-primary)] dark:text-[var(--color-primary)]`
              : "border-transparent"
          }
        `}
      >
        <span
          className={`
            flex-shrink-0
            ${!isOpen ? "mx-auto" : "mr-3"}
          `}
        >
          🏛️
        </span>
        {isOpen && (
          <span
            className="
            flex-grow
            text-sm font-outfit
          "
          >
            PSUs
          </span>
        )}
        {isOpen && (
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`
              w-4 h-4
              transition-transform
              duration-300
              ${isExpanded ? "rotate-90" : ""}
            `}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </li>

      {/* Dropdown Tree */}
      <ul
        className={`
          overflow-hidden
          transition-all
          duration-300 ease-in-out
          ${
            isExpanded && isOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        {projects.map((project) => {
          const isActive = selectedPsu?.id === project.id;

          return (
            <li
              key={project.id}
              onClick={() => onProjectSelect(project)}
              className={`
                flex
                ml-11 mr-2 mt-1 px-3 py-2
                rounded-xl
                transition-all cursor-pointer
                items-center duration-300 ease-in-out
                ${
                  isActive
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                    : "text-[#433c3a] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                }
                ${isActive ? "font-semibold" : ""}
              `}
            >
              <span
                className="
                  text-sm font-outfit
                "
              >
                {project.name}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PSUList;
