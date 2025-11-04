import React, { useState, useEffect } from "react";

const PSUList = ({
  psu,
  selectedPsuProject,
  onPsuProjectSelect,
  isOpen,
  setIsSidebarOpen,
  setSelectedPsu,
  isPsuUser = false,
}) => {
  const [expandedPsu, setExpandedPsu] = useState(null);
  const [isMainExpanded, setIsMainExpanded] = useState(true);
  useEffect(() => {
    if (selectedPsuProject) {
      const parentPsu = psu.find((p) =>
        p.projects?.some((proj) => proj === selectedPsuProject)
      );
      if (parentPsu) {
        setExpandedPsu(parentPsu.name);
        setSelectedPsu(parentPsu.name);
        setIsMainExpanded(true);
      }
    }
  }, [selectedPsuProject, psu]);

  // Auto-expand PSU for PSU users
  useEffect(() => {
    if (isPsuUser && psu.length > 0) {
      const userPsu = psu[0]; // Since we filtered to only show user's PSU
      if (userPsu) {
        setExpandedPsu(userPsu.name);
        setSelectedPsu(userPsu.name);
        setIsMainExpanded(true);
      }
    }
  }, [isPsuUser, psu]);

  const handleHeaderClick = () => {
    setIsMainExpanded(!isMainExpanded);
    setIsSidebarOpen(true);
  };

  const handlePsuClick = (psuName) => {
    setExpandedPsu(expandedPsu === psuName ? null : psuName);
    setIsSidebarOpen(true);
  };

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
            selectedPsuProject
              ? `${
                  isOpen ? "border-l-[5px]" : "md:border-l-[5px]"
                } border-[var(--color-primary)]
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
              ${isMainExpanded ? "rotate-90" : ""}
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
            isMainExpanded && isOpen
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }
        `}
      >
        {psu.map((psu) => {
          return (
            <div key={psu.name}>
              <li
                onClick={() => {
                  handlePsuClick(psu.name);
                }}
                className={`
                  flex
                  ml-11 mr-2 mt-1 px-3 py-2
                  rounded-xl
                  transition-all cursor-pointer
                  items-center duration-300 ease-in-out
                  ${
                    selectedPsuProject &&
                    psu.projects?.some((proj) => proj === selectedPsuProject)
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                      : "text-[#433c3a] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                  }
                `}
              >
                <span className="text-sm font-outfit flex-grow">
                  {psu.name}
                </span>
                {psu.projects && (
                  <svg
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className={`
                      w-4 h-4
                      transition-transform
                      duration-300
                      ${expandedPsu === psu.name ? "rotate-90" : ""}
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

              {/* Projects Dropdown */}
              {psu.projects && (
                <ul
                  className={`
                    overflow-hidden
                    transition-all
                    duration-300 ease-in-out
                    ${
                      expandedPsu === psu.name
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  {psu.projects.map((project) => {
                    const isProjectActive = selectedPsuProject === project;

                    return (
                      <li
                        key={project}
                        onClick={() => onPsuProjectSelect(project)}
                        className={`
                          flex
                          ml-16 mr-2 mt-1 px-3 py-2
                          rounded-xl
                          transition-all cursor-pointer
                          items-center duration-300 ease-in-out
                          ${
                            isProjectActive
                              ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                              : "text-[#433c3a] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                          }
                          ${isProjectActive ? "font-semibold" : ""}
                        `}
                      >
                        <span className="text-sm font-outfit">{project}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </ul>
    </nav>
  );
};

export default PSUList;
