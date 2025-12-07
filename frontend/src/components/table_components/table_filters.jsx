const TableFilters = ({
  startDate,
  endDate,
  selectedPsu,
  selectedState,
  selectedSchool,
  selectedProject,
  selectedDistrict,
  selectedCategory,
  selectedStatus,
  selectedReady,
  selectedTraining,
  selectedHandover,
  selectedDispatchStatus,
  setEndDate,
  setStartDate,
  setSelectedPsu,
  setSelectedState,
  setSelectedSchool,
  setSelectedDistrict,
  setSelectedCategory,
  setSelectedStatus,
  setSelectedReady,
  setSelectedTraining,
  setSelectedHandover,
  setSelectedDispatchStatus,
  psuOptions = [],
  categories = [],
  stateOptions = [],
  schoolOptions = [],
  districtOptions = [],
  statusOptions = [],
  fundFilter = "",
  setFundFilter,
  fundComparison = "greater",
  setFundComparison,
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
      {startDate && setStartDate && (
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
      )}

      {/* End Date Filter */}
      {endDate && setEndDate && (
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
      )}

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

      {setSelectedPsu && (
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
            onChange={(e) => setSelectedPsu(e.target.value)}
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
      )}

      {setSelectedStatus && (
        <div>
          <label
            className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
          >
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:disabled:bg-[var(--color-text-secondary)] disabled:bg-[var(--color-text-disabled)] dark:bg-gray-900 dark:text-white dark:disabled:text-gray-800
            "
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Filter (Conditional) */}

      {categories.length > 0 && (
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
      {setFundFilter && (
        <div>
          <label
            className="
                flex
                mb-2
                text-sm font-medium text-[var(--color-primary)]
                items-center
              "
          >
            Fund
            <button
              onClick={() =>
                setFundComparison((prev) =>
                  prev === "greater" ? "less" : "greater"
                )
              }
              className="
                  ml-2 px-2
                  border border-gray-300 rounded-md
                  dark:border-gray-500
                "
            >
              {fundComparison === "greater" ? ">" : "<"}
            </button>
          </label>
          <input
            type="number"
            value={fundFilter}
            onChange={(e) => setFundFilter(e.target.value)}
            placeholder="Enter amount"
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
      )}

      {setSelectedReady && (
        <div>
          <label
            className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
          >
            Ready Status
          </label>
          <select
            value={selectedReady}
            onChange={(e) => setSelectedReady(e.target.value)}
            className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
          >
            <option value="">All</option>
            <option value="ready">Ready</option>
            <option value="not_ready">Not Ready</option>
          </select>
        </div>
      )}

      {setSelectedTraining && (
        <div>
          <label
            className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
          >
            Training Status
          </label>
          <select
            value={selectedTraining}
            onChange={(e) => setSelectedTraining(e.target.value)}
            className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
          >
            <option value="">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      )}

      {setSelectedHandover && (
        <div>
          <label
            className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
          >
            Handover Status
          </label>
          <select
            value={selectedHandover}
            onChange={(e) => setSelectedHandover(e.target.value)}
            className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
          >
            <option value="">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      )}

      {setSelectedDispatchStatus && (
        <div>
          <label
            className="
              block
              mb-2
              text-sm font-medium text-[var(--color-primary)]
            "
          >
            Delivery & Installation
          </label>
          <select
            value={selectedDispatchStatus}
            onChange={(e) => setSelectedDispatchStatus(e.target.value)}
            className="
              w-full
              px-3 py-2
              text-black
              bg-white
              border border-gray-300 rounded-lg
              dark:border-gray-500 dark:bg-gray-900 dark:text-white
            "
          >
            <option value="">All</option>
            <option value="all_installed">All Installed</option>
            <option value="partially_installed">Partially Installed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="no_dispatches">No Dispatches</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
