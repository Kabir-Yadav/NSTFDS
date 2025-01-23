import React from "react";

const ProjectList = ({ projects, selectedProject, onProjectSelect }) => (
  <nav className="p-4">
    {projects.map((project) => (
      <button
        key={project.id}
        onClick={() => onProjectSelect(project)}
        className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center transition-colors
          ${
            selectedProject?.id === project.id
              ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background)]"
          }`}
      >
        <span className="mr-3">{project.icon}</span>
        <span className="font-redhat text-sm">{project.name}</span>
      </button>
    ))}
  </nav>
);

export default ProjectList;
