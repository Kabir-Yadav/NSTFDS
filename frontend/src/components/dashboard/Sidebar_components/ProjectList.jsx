import React from "react";

const ProjectList = ({ projects, selectedProject, onProjectSelect, isOpen }) => (
  <nav>
    {projects.map((project) => (
      <button
        key={project.id}
        onClick={() => onProjectSelect(project)}
        className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center transition-all duration-300 ease-in-out rounded-r-full
          ${selectedProject?.id === project.id
            ? "dark:bg-[var(--color-accent-dark)] dark:text-[var(--color-primary-dark)] text-white bg-[var(--color-secondary)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] dark:hover:bg-[var(--color-accent-light)] hover:bg-[var(--color-secondary-light)]"
          }`}
      >
        <span className={`mr-3 ${!isOpen ? "mx-auto" : ""}`}>{project.icon}</span>
        {isOpen && (<span className="font-redhat text-sm">{project.name}</span>)}
      </button>
    ))}
  </nav>
);

export default ProjectList;
