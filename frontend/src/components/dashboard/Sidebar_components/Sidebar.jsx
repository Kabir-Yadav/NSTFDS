import React from "react";
import UserProfile from "./UserProfile";
import ProjectList from "./ProjectList";
import ThemeToggle from "../components/ThemeToggle";
import DottedDivider from "../components/dotted_divider";
import PSUList from "./psu_list";

const Sidebar = ({
  user,
  projects,
  psu,
  selectedPsu,
  onPsuSelect,
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
        className={`absolute md:relative flex flex-col bg-[var(--color-background)] transition-all duration-500 ease-in-out z-50
        lg:bg-transparent md:bg-transparent md:border-r-4 border-[var(--color-surface)]
        ${isSidebarOpen ? "w-[280px]" : "w-[0px] md:w-[80px]"} 
        h-screen`}

        style={{
          scrollbarColor: "transparent",
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <img
            src="assets/ministry.png"
            alt="Logo"
            className="w-32 object-cover"
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mt-3">
            <DottedDivider isSidebarOpen={isSidebarOpen} text={"Services"} />
          </div>
          <div className="">
            <PSUList
              projects={psu}
              isOpen={isSidebarOpen}
              selectedPsu={selectedPsu} // Pass selectedPsu
              setIsSidebarOpen={setIsSidebarOpen}
              onProjectSelect={(psu) => {
                onPsuSelect(psu); // Use the PSU select handler
                setIsSidebarOpen(false);
              }}
            />
          </div>

          <div className="mt-2">
            <ProjectList
              projects={projects}
              isOpen={isSidebarOpen}
              selectedProject={selectedProject}
              setIsSidebarOpen={setIsSidebarOpen}
              onProjectSelect={(project) => {
                onProjectSelect(project);
                setIsSidebarOpen(false);
              }}
            />
          </div>

          <div className="mt-3">
            <DottedDivider isSidebarOpen={isSidebarOpen} text={"Navigation"} />
          </div>

          <div className="pr-2 pt-1">
            <li
              onClick={() => {
                onReturnHome();
                setIsSidebarOpen(false);
              }}
              className={`flex items-center rounded-r-full px-4 py-3 transition-all duration-300 ease-in-out cursor-pointer
              ${isSidebarOpen ? "justify-start" : "justify-center"}
              text-[#433c3a] hover:text-[#F84525] hover:bg-[#fdf3f1] dark:text-[#c7bebc] dark:hover:text-[#F84525]`}
            >
              <span
                className={`flex-shrink-0 ${
                  !isSidebarOpen ? "mx-auto" : "mr-3"
                }`}
              >
                🏠
              </span>
              {isSidebarOpen && (
                <span className="text-sm font-sans">Return to Home</span>
              )}
            </li>
          </div>

          {/* Logout Button */}
          <div className="pr-2 pt-1">
            <li
              onClick={() => {
                onLogout();
                setIsSidebarOpen(false);
              }}
              className={`flex items-center rounded-r-full px-4 py-3 transition-all duration-300 ease-in-out cursor-pointer
              ${isSidebarOpen ? "justify-start" : "justify-center"}
              text-[var(--color-error)] hover:bg-[var(--color-error-light)]`}
            >
              <span
                className={`flex-shrink-0 ${
                  !isSidebarOpen ? "mx-auto" : "mr-3"
                }`}
              >
                🚪
              </span>
              {isSidebarOpen && (
                <span className="text-sm font-sans">Logout</span>
              )}
            </li>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
