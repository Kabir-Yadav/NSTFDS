import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--color-surface)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-[var(--color-text-secondary)]" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />
      )}
    </button>
  );
};

export default ThemeToggle;
