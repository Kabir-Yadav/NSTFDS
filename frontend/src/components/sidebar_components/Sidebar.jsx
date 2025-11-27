import React from "react";
import ProjectList from "./ProjectList";
import DottedDivider from "../ui/dotted_divider";
import PSUList from "./psu_list";

const Sidebar = ({
  projects,
  psu,
  selectedPsu,
  selectedProject,
  selectedpsuProject,
  onPsuProjectSelect,
  onPsuSelect,
  onProjectSelect,
  onReturnHome,
  onLogout,
  isSidebarOpen,
  setIsSidebarOpen,
  setNavpsu,
  isAdmin = false,
  isPsuUser = false,
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
          {!isPsuUser && isAdmin && (
            <div className="">
              <PSUList
                psu={psu}
                isOpen={isSidebarOpen}
                onPsuProjectSelect={(project) => {
                  onPsuProjectSelect(project);
                }}
                selectedPsuProject={selectedpsuProject}
                setIsSidebarOpen={setIsSidebarOpen}
                setSelectedPsu={setNavpsu}
                isPsuUser={isPsuUser}
              />
            </div>
          )}

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

          <div className="pt-1">
            <li
              onClick={() => {
                onReturnHome();
                setIsSidebarOpen(false);
              }}
              className={`flex items-center rounded-r-full px-4 py-3 transition-all duration-300 ease-in-out cursor-pointer
              ${isSidebarOpen ? "justify-start" : "justify-center"}
              text-[#433c3a] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] dark:text-[#c7bebc] dark:hover:text-[var(--color-primary)]`}
            >
              <span
                className={`flex-shrink-0 ${
                  !isSidebarOpen ? "mx-auto" : "mr-3"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19"
                  />
                </svg>
              </span>
              {isSidebarOpen && (
                <span className="text-sm font-sans">Return to Home</span>
              )}
            </li>
          </div>

          {/* Logout Button */}
          <div className="pt-1">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M20.5 19.53h-1.917V5.665c0-1.51-1.251-2.695-2.75-2.695h-1.161a1.75 1.75 0 0 0-1.85-1.211l-.2.032l-6.611 1.44a.75.75 0 0 0-.591.733V5.61l-.003.058V19.53H3.5a.75.75 0 0 0 0 1.5H7l.077-.004q.03-.003.062-.01l5.483 1.193l.2.032a1.75 1.75 0 0 0 1.85-1.21H20.5l.077-.005a.75.75 0 0 0 0-1.492zM17.083 5.665V19.53H14.75V4.47h1.083c.71 0 1.25.553 1.25 1.195m-6.833 5.36a.75.75 0 0 1 1.5 0v1.95a.75.75 0 0 1-1.5 0z"
                  />
                </svg>
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
