import React from "react";
import UserProfile from "../Sidebar_components/UserProfile";
import ProjectList from "../Sidebar_components/ProjectList";
import ThemeToggle from "../Dashboard_components/ThemeToggle";
import MobileHeader from "../Sidebar_components/MobileHeader";

const Sidebar = ({
  user,
  projects,
  selectedProject,
  onProjectSelect,
  onReturnHome,
  onLogout,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        title={selectedProject ? selectedProject.name : "Dashboard"}
      />

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-[var(--color-surface)] shadow-lg 
          transform transition-transform duration-300 ease-in-out theme-transition
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:w-64
          ${isSidebarOpen ? "touch-none" : ""} md:touch-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--color-border)] relative flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--color-primary)]">
            NSTFDS
          </h1>
          <ThemeToggle />
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
          <UserProfile user={user} />

          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onProjectSelect={(project) => {
              onProjectSelect(project);
              setIsSidebarOpen(false);
            }}
          />

          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => {
                onReturnHome();
                setIsSidebarOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-[var(--color-text-secondary)] 
                hover:bg-[var(--color-background)] rounded-lg flex items-center 
                transition-colors active:scale-95 transform"
            >
              <span className="mr-2">🏠</span>
              <span className="font-redhat">Return to Home</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => {
                onLogout();
                setIsSidebarOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-[var(--color-error)] 
                hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg flex items-center 
                transition-colors active:scale-95 transform"
            >
              <span className="mr-2">🚪</span>
              <span className="font-redhat">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
