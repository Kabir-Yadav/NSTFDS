export const validateRow = (row, selectedProject, categories) => {
  const rowErrors = [];
  const requiredFields = [
    "ID",
    "Delivery_Date",
    "State",
    "District",
    "School",
    "PSU",
    "Status",
    "Cost",
  ];

  if (selectedProject?.name === "Digital Device Procurement") {
    requiredFields.push("Category");
  }

  // Check for required fields
  requiredFields.forEach((field) => {
    const value = row[field];
    if (value === undefined || value === null || value === "") {
      rowErrors.push(`Missing ${field.replace("_", " ")}`);
    }
  });

  // Validate date format
  if (row.Delivery_Date) {
    const dateValue = new Date(row.Delivery_Date);
    if (isNaN(dateValue.getTime())) {
      rowErrors.push("Invalid delivery date format");
    }
  }

  // Validate cost is a number
  if (row.Cost) {
    const costValue = parseFloat(row.Cost.toString().replace(/[^0-9.-]+/g, ""));
    if (isNaN(costValue)) {
      rowErrors.push("Cost must be a number");
    }
  }

  // Add valid status values check
  const validStatuses = ["Shipped", "Pending", "Just Deployed", "Arrived"];
  if (row.Status && !validStatuses.includes(row.Status)) {
    rowErrors.push(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  // If digital device procurement, validate item category
  if (selectedProject?.name === "Digital Device Procurement" && row.Category) {
    if (!categories.includes(row.Category)) {
      rowErrors.push(
        `Invalid item category: ${
          row.Category
        }. Must be one of: ${categories.join(", ")}`
      );
    }
  }

  return rowErrors;
};
