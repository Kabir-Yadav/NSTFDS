const TableHeader = ({selectedProject}) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th
          className="bg-[var(--color-surface-secondary)]"
          style={{ minWidth: "50px" }}
        ></th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "30px" }}
        >
          Id
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Delivery_Date
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          State
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          District
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          School
        </th>
        {selectedProject?.name === "Digital Device Procurement" && (
          <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
            style={{ minWidth: "120px" }}
          >
            Category
          </th>
        )}
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Status
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Cost
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader