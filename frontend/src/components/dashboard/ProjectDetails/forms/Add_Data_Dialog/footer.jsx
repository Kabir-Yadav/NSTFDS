const DialogFooter = ({
  onClose,
  mode,
  isPreviewReady,
  handleSubmitMultiple,
  parsedData,
  hasError,
}) => {
  return (
    <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 space-x-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Cancel
      </button>

      {hasError ? (
        <button
          disabled
          className="px-4 py-2 text-white bg-red-500 rounded-lg cursor-not-allowed dark:bg-red-600/50"
        >
          Fix Errors
        </button>
      ) : (
        <>
          {mode === "multiple" && isPreviewReady && (
            <button
              onClick={handleSubmitMultiple}
              disabled={parsedData.length === 0}
              className={`px-4 py-2 text-white rounded-lg ${
                parsedData.length === 0
                  ? "bg-purple-400 cursor-not-allowed dark:bg-purple-700"
                  : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
              }`}
            >
              Import {parsedData.length} Entries
            </button>
          )}

          {mode === "single" && (
            <button
              type="submit"
              form="single-entry-form" // Assuming your form has this id
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
            >
              Add Entry
            </button>
          )}

          {mode === "multiple" && !isPreviewReady && (
            <button
              disabled
              className="px-4 py-2 text-white bg-purple-400 rounded-lg cursor-not-allowed dark:bg-purple-700"
            >
              Next
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DialogFooter;
