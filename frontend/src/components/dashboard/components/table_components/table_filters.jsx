const TableFilters = ({
  startDate,
  endDate,
  selectedPsu,
  selectedState,
  selectedSchool,
  selectedProject,
  selectedDistrict,
  selectedCategory,
  setEndDate,
  setStartDate,
  setSelectedPsu,
  setSelectedState,
  setSelectedSchool,
  setSelectedDistrict,
  setSelectedCategory,
  psuOptions = [],
  categories = [],
  stateOptions = [],
  schoolOptions = [],
  districtOptions = [],
}) => {
  return (
    <div
      className="
          grid grid-cols-2
          gap-4
          md:grid-cols-3
          lg:grid-cols-6
        "
    >
      {/* Start Date Filter */}
      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
        />
      </div>

      {/* End Date Filter */}
      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
        />
      </div>

      {/* State Filter */}
      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          State
        </label>
        <select
          value={selectedState}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedState(value);
            setSelectedDistrict("");
            setSelectedSchool("");
          }}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
        >
          <option value="">All States</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          District
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedDistrict(value);
            setSelectedSchool("");
          }}
          disabled={!selectedState}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-gray-900 dark:text-white dark:disabled:text-gray-800
            "
        >
          <option value="">All Districts</option>
          {districtOptions.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* School Filter */}
      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          School
        </label>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          disabled={!selectedDistrict}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-gray-900 dark:text-white dark:disabled:text-gray-800
            "
        >
          <option value="">All Schools</option>
          {schoolOptions.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
        >
          PSU
        </label>
        <select
          value={selectedPsu}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-gray-900 dark:text-white dark:disabled:text-gray-800
            "
        >
          <option value="">All PSUs</option>
          {psuOptions.map((psu) => (
            <option key={psu} value={psu}>
              {psu}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter (Conditional) */}
      {selectedProject?.name === "Digital Device Procurement" && (
        <div>
          <label
            className="
                block
                mb-2
                text-sm font-medium text-[var(--color-primary)]
              "
          >
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="
                w-full
                px-3 py-2
                text-black
                bg-white
                border border-gray-300 rounded-lg
                dark:border-gray-500 dark:bg-gray-900 dark:text-white
              "
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
