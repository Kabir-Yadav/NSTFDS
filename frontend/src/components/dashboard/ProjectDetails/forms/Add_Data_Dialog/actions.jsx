export const validateRow = (
  row,
  selectedProject,
  categories,
  statusOptions
) => {
  const rowErrors = [];
  // List required fields as per table_header.jsx
  const requiredFields = [
    "Committed_Date", // string, required, valid date
    "Target_Date", // string, required, valid date
    "State", // string, required, not empty
    "District", // string, required, not empty
    "School", // string, required, not empty
    "Status", // string, required, in statusOptions
    "Quantity", // number, required, > 0
    "Unit_Cost", // number, required, > 0
    "Total_Cost", // number, required, > 0
  ];
  // "Item_Type" required only for Digital Device Procurement
  if (selectedProject?.name === "Digital Device Procurement") {
    requiredFields.push("Item_Type");
  }

  // Check missing fields
  requiredFields.forEach((field) => {
    if (!row[field] || row[field].toString().trim() === "") {
      rowErrors.push(`Missing ${field.replace("_", " ")}`);
    }
  });

  // Type/Range checks
  if (
    row["Quantity"] &&
    (isNaN(row["Quantity"]) || Number(row["Quantity"]) <= 0)
  ) {
    rowErrors.push("Quantity must be a positive number");
  }
  if (
    row["Unit_Cost"] &&
    (isNaN(row["Unit_Cost"]) || Number(row["Unit_Cost"]) <= 0)
  ) {
    rowErrors.push("Unit Cost must be a positive number");
  }
  if (
    row["Total_Cost"] &&
    (isNaN(row["Total_Cost"]) || Number(row["Total_Cost"]) <= 0)
  ) {
    rowErrors.push("Total Cost must be a positive number");
  }
  // Status check
  if (row["Status"] && !statusOptions.includes(row["Status"])) {
    rowErrors.push(
      `Invalid status: ${row["Status"]}. Allowed: ${statusOptions.join(", ")}`
    );
  }

  // Proof validation based on status
  if (row["Status"]) {
    const statusIndex = statusOptions.indexOf(row["Status"]);
    const totalStatuses = statusOptions.length;

    // For second last status
    if (statusIndex === totalStatuses - 2) {
      if (!row["Stage1_proof"]) {
        rowErrors.push("Stage 1 proof is required for this status");
      }
    }
    // For last status
    else if (statusIndex === totalStatuses - 1) {
      if (!row["Stage1_proof"]) {
        rowErrors.push("Stage 1 proof is required for this status");
      }
      if (!row["Stage2_proof"]) {
        rowErrors.push("Stage 2 proof is required for this status");
      }
    }
  }

  // Category check
  if (
    selectedProject?.name === "Digital Device Procurement" &&
    row["Item_Type"]
  ) {
    if (!categories.includes(row["Item_Type"])) {
      rowErrors.push(
        `Invalid item type: ${row["Item_Type"]}. Allowed: ${categories.join(
          ", "
        )}`
      );
    }
  }

  // Date checks
  ["Committed_Date", "Target_Date"].forEach((field) => {
    if (row[field] && isNaN(new Date(row[field]).getTime())) {
      rowErrors.push(`${field.replace("_", " ")} is not a valid date`);
    }
  });

  return rowErrors;
};
