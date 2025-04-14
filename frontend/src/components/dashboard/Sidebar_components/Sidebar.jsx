import React from "react";
import UserProfile from "./UserProfile";
import ProjectList from "./ProjectList";
import ThemeToggle from "../components/ThemeToggle";
import MobileHeader from "./MobileHeader";

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
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`absolute md:relative h-full bg-[var(--color-surface)] shadow-lg transition-all duration-500 ease-in-out z-50
          lg:bg-transparent md:bg-transparent
    ${isSidebarOpen ? "w-[280px]" : "w-[0px] md:w-[80px]"} overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--color-border)] relative flex items-center justify-between">
          <img
            src="assets/ministry.png"
            alt="Logo"
            className="w-32 object-cover"
          />
          {isSidebarOpen && <ThemeToggle />}
        </div>

        {/* Scrollable Content Area */}
        <div className="h-full overflow-hidden">
          <UserProfile user={user} isOpen={isSidebarOpen} />
          <div className="mt-2">
            <ProjectList
              projects={projects}
              isOpen={isSidebarOpen}
              selectedProject={selectedProject}
              onProjectSelect={(project) => {
                onProjectSelect(project);
                setIsSidebarOpen(false);
              }}
            />
          </div>

          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => {
                onReturnHome();
                setIsSidebarOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-[var(--color-text-secondary)] 
                hover:bg-[var(--color-accent)] dark:hover:text-[var(--color-primary-dark)] rounded-lg flex items-center 
                transition-colors active:scale-95 transform"
            >
              <span className="mr-2">🏠</span>
              {isSidebarOpen && (
                <span className="font-redhat">Return to Home</span>
              )}
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
                hover:bg-[var(--color-error-light)] rounded-lg flex items-center 
                transition-colors active:scale-95 transform"
            >
              <span className="mr-2">🚪</span>
              {isSidebarOpen && <span className="font-redhat">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
