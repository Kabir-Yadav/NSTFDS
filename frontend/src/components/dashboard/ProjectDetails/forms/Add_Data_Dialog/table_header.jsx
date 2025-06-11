const TableHeader = ({ selectedProject }) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        {" "}
        {/* Action column */}
        <th
          className="bg-[var(--color-surface-secondary)]"
          style={{ minWidth: "50px" }}
        ></th>
        {/* Required Fields */}
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
          Committed Date
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Target Date
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
          Block
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          School
        </th>
        
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Status
        </th>
        {/* Cost Related Fields */}
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Quantity
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Unit Cost
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Total Cost
        </th>
        {/* Conditional Category */}
        {selectedProject?.name === "Digital Device Procurement" && (
          <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
            style={{ minWidth: "120px" }}
          >
            Item Type
          </th>
        )}
        {/* Proofs and Documents */}
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Stage 1 Proof
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Stage 2 Proof
        </th>
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Certificate URL
        </th>
        {/* Additional Information */}
        <th
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
          style={{ minWidth: "120px" }}
        >
          Extras
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
