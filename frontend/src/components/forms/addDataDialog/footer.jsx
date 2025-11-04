import { Loader } from "lucide-react";

const DialogFooter = ({
  onClose,
  mode,
  isPreviewReady,
  handleSubmitMultiple,
  parsedData,
  hasError,
  isSubmitting,
}) => {
  return (
    <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 space-x-3">
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className={`px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
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
              disabled={parsedData.length === 0 || isSubmitting}
              className={`px-4 py-2 text-white rounded-lg flex items-center justify-center min-w-[160px] ${
                parsedData.length === 0 || isSubmitting
                  ? "bg-purple-400 cursor-not-allowed dark:bg-purple-700"
                  : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Importing...
                </>
              ) : (
                `Import ${parsedData.length} Entries`
              )}
            </button>
          )}

          {mode === "single" && (
            <button
              type="submit"
              form="single-entry-form"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg flex items-center justify-center min-w-[120px] ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed dark:bg-purple-700"
                  : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Add Entry"
              )}
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
