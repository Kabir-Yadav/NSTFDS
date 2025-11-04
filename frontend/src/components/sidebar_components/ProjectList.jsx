import React, { useState, useEffect } from "react";

const ProjectList = ({
  projects,
  selectedProject,
  onProjectSelect,
  isOpen,
  setIsSidebarOpen, // Add this prop to control the sidebar state
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded); // Toggle the dropdown
    setIsSidebarOpen(true); // Ensure the sidebar is open
  };
  // Automatically expand the dropdown if a project is selected
  useEffect(() => {
    if (selectedProject) {
      setIsExpanded(true);
    }
  }, [selectedProject]);
  return (
    <nav>
      {/* Projects Toggle Header */}
      <li
        onClick={handleHeaderClick} // Use the new handler
        className={`flex items-center rounded-r-full px-4 py-3 cursor-pointer transition-all duration-300 ease-in-out
          ${isOpen ? "justify-start" : "justify-center border-0"}
          text-[#433c3a] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]
          dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)]
          ${
            selectedProject
              ? `${
                  isOpen ? "border-l-[5px]" : "md:border-l-[5px]"
                } border-[var(--color-primary)]
              bg-[var(--color-primary-hover)] text-[var(--color-primary)] dark:text-[var(--color-primary)]`
              : "border-l-[5px] border-transparent"
          }`}
      >
        <span className={`flex-shrink-0 ${!isOpen ? "mx-auto" : "mr-3"}`}>
          📂
        </span>
        {isOpen && (
          <span className="text-sm font-outfit flex-grow">Projects</span>
        )}
        {isOpen && (
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${
            isExpanded && isOpen
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0"
          } 
        `}
      >
        {projects.map((project) => {
          const isActive = selectedProject?.id === project.id;

          return (
            <li
              key={project.id}
              className={`flex items-center rounded-xl ml-7 mr-2 mt-1 px-3 py-2 transition-all duration-300 ease-in-out cursor-pointer
                ${
                  isActive
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] dark:text-[var(--color-primary)]"
                    : "text-[#433c3a] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                }
                ${isActive ? "font-semibold" : ""}`}
              onClick={() => onProjectSelect(project)}
            >
              <span className="mr-3">{project.icon}</span>
              <span className="text-sm font-outfit">{project.name}</span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ProjectList;
