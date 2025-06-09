const HeaderButtons = ({
  exportType,
  setExportType,
  handleExport,
  setShowAddDataModal,
  isAdmin = false,
}) => {
  return (
    <div
      className="
        flex
        mb-4 space-y-4
        justify-between items-center
        md:space-y-0
      "
    >
      {/* Add New Entry Button */}
      {isAdmin && (
        <button
          onClick={() => setShowAddDataModal(true)}
          className="
            px-6 py-2
            text-white
            bg-green-600
            rounded-lg
            transition-colors shadow-md
            hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600
          "
        >
          + Add New Entry
        </button>
      )}

      <div
        className="
            flex flex-col
            space-y-2 space-x-2
            items-center
            sm:flex-row sm:space-y-0
          "
      >
        {!isAdmin && (
          <button
            onClick={handleExport}
            className="
                w-full
                ml-0 px-6 py-2
                text-white font-medium
                bg-[var(--color-primary)]
                rounded-lg
                transition-colors shadow-md
                dark:bg-[var(--color-secondary)] hover:bg-[var(--color-primary-dark)] dark:hover:bg-[var(--color-secondary-dark)] dark:text-[var(--color-primary-light)]
                md:w-auto
              "
          >
            Export to {exportType}
          </button>
        )}
        {/* Segmented Control for Export Type */}
        <div
          className="
                inline-flex
                p-1 ml-2
                bg-gray-200
                rounded-full
                dark:bg-gray-700
              "
        >
          {["PDF", "CSV"].map((type) => (
            <button
              key={type}
              onClick={() => setExportType(type)}
              className={`
                        px-4 py-1
                        text-sm font-medium text-[var(--color-text)]
                        rounded-full
                        transition-colors
                        duration-200
                        ${
                          exportType === type
                            ? "bg-white dark:bg-gray-800 shadow"
                            : "bg-transparent hover:bg-white/50 dark:hover:bg-gray-800/50"
                        }
                      `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Export Button */}
        {isAdmin && (
          <button
            onClick={handleExport}
            className="
                w-full
                ml-0 px-6 py-2
                text-white font-medium
                bg-[var(--color-primary)]
                rounded-lg
                transition-colors shadow-md
                dark:bg-[var(--color-secondary)] hover:bg-[var(--color-primary-dark)] dark:hover:bg-[var(--color-secondary-dark)] dark:text-[var(--color-primary-light)]
                md:w-auto md:ml-2
              "
          >
            Export to {exportType}
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderButtons;
