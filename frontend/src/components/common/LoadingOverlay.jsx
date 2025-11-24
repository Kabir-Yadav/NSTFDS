import React from "react";

const LoadingOverlay = ({ message = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 dark:border-gray-700"></div>
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-purple-500 dark:border-t-purple-400 animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {message}
      </p>
    </div>
  );
};

export default LoadingOverlay;
