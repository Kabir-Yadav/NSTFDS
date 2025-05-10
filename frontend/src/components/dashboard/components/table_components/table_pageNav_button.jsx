const TablePageNavButton = ({ totalPages, currentPage, setCurrentPage }) => {
  return (
    <div
      className="
        flex
        space-x-4 mt-4 mb-2
        justify-center items-center
      "
    >
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="
          px-4 py-2
          text-white
          bg-[var(--color-primary)]
          rounded-lg
          transition-colors shadow-md
          dark:text-[var(--color-primary-light)] dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-[var(--color-secondary)]
        "
      >
        Previous
      </button>
      <span
        className="
          text-[var(--color-primary)]
        "
      >
        {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="
          px-4 py-2
          text-white
          bg-[var(--color-primary)]
          rounded-lg
          transition-colors shadow-md
          dark:text-[var(--color-primary-light)] dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-[var(--color-secondary)]
        "
      >
        Next
      </button>
    </div>
  );
};

export default TablePageNavButton;
