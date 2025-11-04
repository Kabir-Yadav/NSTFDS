const DottedDivider = ({isSidebarOpen,text}) => {
  return (
    <div className="relative h-5 w-full overflow-hidden">
      <span
        className={`absolute left-0 transition-all duration-300 ease-in-out pl-4 
      text-sm font-outfit text-gray-500
      ${
        isSidebarOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 -translate-x-2"
      }
    `}
      >
        {text}
      </span>

      <div
        className={`absolute left-0 right-0 flex justify-center items-center transition-all duration-300 ease-in-out
      ${
        isSidebarOpen
          ? "opacity-0 scale-90 translate-x-2"
          : "opacity-100 scale-100"
      }
    `}
      >
        <div className="w-[2.5px] h-[2.5px] bg-[var(--color-text-secondary)] rounded-full mx-[2px]"></div>
        <div className="w-[2.5px] h-[2.5px] bg-[var(--color-text-secondary)] rounded-full mx-[2px]"></div>
        <div className="w-[2.5px] h-[2.5px] bg-[var(--color-text-secondary)] rounded-full mx-[2px]"></div>
      </div>
    </div>
  );
};

export default DottedDivider;
