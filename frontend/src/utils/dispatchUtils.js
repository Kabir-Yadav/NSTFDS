/**
 * Dispatch Utility Functions
 * 
 * Pure functions for data transformation, validation, and calculations.
 * These functions have no side effects and can be easily tested.
 */

import { Dispatch, DispatchComponent } from "../models/dispatchModels";

/**
 * Dispatch status enum values from database
 */
export const DISPATCH_STATUS_ENUM = {
    PENDING_DISPATCH: "pending_dispatch",
    DISPATCHED: "dispatched",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    INSTALLATION_IN_PROGRESS: "installation_in_progress",
    INSTALLED: "installed",
};

/**
 * Map dispatch enum values to user-friendly display names
 */
export const DISPATCH_STATUS_DISPLAY = {
    [DISPATCH_STATUS_ENUM.PENDING_DISPATCH]: "Pending Dispatch",
    [DISPATCH_STATUS_ENUM.DISPATCHED]: "Dispatched",
    [DISPATCH_STATUS_ENUM.IN_TRANSIT]: "In Transit",
    [DISPATCH_STATUS_ENUM.DELIVERED]: "Delivered",
    [DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS]: "Installation In Progress",
    [DISPATCH_STATUS_ENUM.INSTALLED]: "Installed",
};

/**
 * Get all dispatch status options for dropdowns in correct order
 */
export const DISPATCH_STATUS_OPTIONS = [
    DISPATCH_STATUS_ENUM.PENDING_DISPATCH,
    DISPATCH_STATUS_ENUM.DISPATCHED,
    DISPATCH_STATUS_ENUM.IN_TRANSIT,
    DISPATCH_STATUS_ENUM.DELIVERED,
    DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS,
    DISPATCH_STATUS_ENUM.INSTALLED,
];

/**
 * Get the order/index of a status in the workflow
 * @param {string} statusEnum - Enum value from database
 * @returns {number} Order index (0-5), or -1 if invalid
 */
export function getDispatchStatusOrder(statusEnum) {
    return DISPATCH_STATUS_OPTIONS.indexOf(statusEnum);
}

/**
 * Get available next statuses (current status and all future statuses)
 * Status changes are irreversible - can only move forward
 * @param {string} currentStatus - Current dispatch status enum
 * @param {Object} dispatch - Dispatch object with proof URLs (optional, not used for filtering)
 * @returns {Array<string>} Array of available status enum values
 */
export function getAvailableNextStatuses(currentStatus, dispatch = null) {
    if (!currentStatus) {
        return DISPATCH_STATUS_OPTIONS;
    }

    const currentIndex = getDispatchStatusOrder(currentStatus);
    if (currentIndex === -1) {
        // Invalid status, return all options
        return DISPATCH_STATUS_OPTIONS;
    }

    // Get all future statuses (including current)
    return DISPATCH_STATUS_OPTIONS.slice(currentIndex);
}

/**
 * Check if a status change is valid (proofs required are uploaded)
 * @param {string} newStatus - New status to change to
 * @param {Object} dispatch - Dispatch object with proof URLs
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateStatusChange(newStatus, dispatch) {
    if (!newStatus || !dispatch) {
        return { isValid: true, error: null };
    }

    // "delivered" requires delivery_proof_url
    if (newStatus === DISPATCH_STATUS_ENUM.DELIVERED) {
        if (!dispatch.delivery_proof_url) {
            return {
                isValid: false,
                error: "Delivery proof must be uploaded before changing status to 'Delivered'",
            };
        }
    }

    // "installed" requires both delivery_proof_url and installation_proof_url
    if (newStatus === DISPATCH_STATUS_ENUM.INSTALLED) {
        const missingProofs = [];
        if (!dispatch.delivery_proof_url) {
            missingProofs.push("delivery proof");
        }
        if (!dispatch.installation_proof_url) {
            missingProofs.push("installation proof");
        }

        if (missingProofs.length > 0) {
            return {
                isValid: false,
                error: `${missingProofs.join(" and ")} must be uploaded before changing status to 'Installed'`,
            };
        }
    }

    return { isValid: true, error: null };
}

/**
 * Get display name for a dispatch status enum value
 * @param {string} statusEnum - Enum value from database
 * @returns {string} User-friendly display name
 */
export function getDispatchStatusDisplay(statusEnum) {
    if (!statusEnum) return "Unknown";
    return DISPATCH_STATUS_DISPLAY[statusEnum] || statusEnum;
}

/**
 * Get status color classes based on dispatch status
 * @param {string} statusEnum - Enum value from database
 * @returns {string} Tailwind CSS classes for status badge
 */
export function getDispatchStatusColor(statusEnum) {
    if (!statusEnum) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }

    switch (statusEnum) {
        case DISPATCH_STATUS_ENUM.PENDING_DISPATCH:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
        case DISPATCH_STATUS_ENUM.DISPATCHED:
        case DISPATCH_STATUS_ENUM.IN_TRANSIT:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case DISPATCH_STATUS_ENUM.DELIVERED:
        case DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
        case DISPATCH_STATUS_ENUM.INSTALLED:
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }
}

/**
 * Normalize dispatch data to support both new and legacy formats
 * @param {Object} dispatch - Dispatch object (may be in legacy or new format)
 * @returns {Object} Normalized dispatch with components array
 */
export function normalizeDispatch(dispatch) {
    if (!dispatch) return null;

    // If already in new format with components array
    if (dispatch.components && Array.isArray(dispatch.components)) {
        // Check if components are strings (newest format) or objects (legacy)
        const hasStringComponents = dispatch.components.some(
            (comp) => typeof comp === "string"
        );
        if (hasStringComponents) {
            // Already in newest format (array of strings)
            return dispatch;
        }
        // Legacy format with objects - convert to strings
        return {
            ...dispatch,
            components: dispatch.components.map(
                (comp) => comp.component_name || comp.component || "Unknown Component"
            ),
        };
    }

    // Legacy format - convert to new format (array of strings)
    return {
        ...dispatch,
        components: [dispatch.component || "Unknown Component"],
    };
}

/**
 * Get all dispatched component names from a school's dispatches
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {Set} Set of component names that have been dispatched
 */
export function getDispatchedComponents(dispatches) {
    const dispatchedSet = new Set();

    if (!dispatches || !Array.isArray(dispatches)) {
        return dispatchedSet;
    }

    dispatches.forEach((dispatch) => {
        const normalized = normalizeDispatch(dispatch);
        if (normalized.components) {
            normalized.components.forEach((comp) => {
                // Handle both string format and legacy object format
                const name = typeof comp === "string" ? comp : comp.component_name || comp.component;
                if (name) {
                    dispatchedSet.add(name);
                }
            });
        }
    });

    return dispatchedSet;
}

/**
 * Get available components for a school (not yet dispatched)
 * @param {Array} allComponents - All available components for the project
 * @param {Array} dispatches - School's existing dispatches
 * @returns {Array} Array of available component names
 */
export function getAvailableComponents(allComponents, dispatches) {
    const dispatchedSet = getDispatchedComponents(dispatches);
    return allComponents.filter((comp) => !dispatchedSet.has(comp));
}

/**
 * Calculate total cost of all components in a dispatch
 * @deprecated Components no longer have cost information
 * @param {Object} dispatch - Dispatch object
 * @returns {number} Always returns 0
 */
export function calculateDispatchTotalCost(dispatch) {
    // Components are now just strings, no cost information
    return 0;
}

/**
 * Get total number of components across all dispatches for a school
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {number} Total component count
 */
export function getTotalComponentCount(dispatches) {
    if (!dispatches || !Array.isArray(dispatches)) return 0;

    return dispatches.reduce((total, dispatch) => {
        const normalized = normalizeDispatch(dispatch);
        if (normalized.components) {
            return total + normalized.components.length;
        }
        // Legacy format - each dispatch is one component
        return total + 1;
    }, 0);
}

/**
 * Get count of installed dispatches
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {number} Count of installed dispatches
 */
export function getInstalledDispatchCount(dispatches) {
    if (!dispatches || !Array.isArray(dispatches)) return 0;
    // Check both legacy format (is_installed) and new format (dispatch_status === "installed")
    return dispatches.filter(
        (d) =>
            d.dispatch_status === DISPATCH_STATUS_ENUM.INSTALLED ||
            d.is_installed === true
    ).length;
}

/**
 * Get cumulative dispatch status for all dispatches
 * Returns the overall status based on all dispatches:
 * - "All Installed" if all dispatches are installed
 * - "Partially Installed" if some are installed but not all
 * - "In Progress" if any dispatch is in progress (delivered, installation_in_progress)
 * - "Pending" if all dispatches are pending or dispatched
 * - "No Dispatches" if there are no dispatches
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {string} Cumulative status string
 */
export function getCumulativeDispatchStatus(dispatches) {
    if (!dispatches || !Array.isArray(dispatches) || dispatches.length === 0) {
        return "No Dispatches";
    }

    const statusCounts = {
        installed: 0,
        inProgress: 0,
        pending: 0,
    };

    dispatches.forEach((dispatch) => {
        const status = dispatch.dispatch_status || DISPATCH_STATUS_ENUM.PENDING_DISPATCH;

        if (status === DISPATCH_STATUS_ENUM.INSTALLED) {
            statusCounts.installed++;
        } else if (
            status === DISPATCH_STATUS_ENUM.DELIVERED ||
            status === DISPATCH_STATUS_ENUM.INSTALLATION_IN_PROGRESS
        ) {
            statusCounts.inProgress++;
        } else {
            statusCounts.pending++;
        }
    });

    const total = dispatches.length;

    // All installed
    if (statusCounts.installed === total) {
        return "All Installed";
    }

    // Some installed
    if (statusCounts.installed > 0) {
        return `Partially Installed (${statusCounts.installed}/${total})`;
    }

    // Some in progress
    if (statusCounts.inProgress > 0) {
        return "In Progress";
    }

    // All pending
    return "Pending";
}

/**
 * Get cumulative dispatch status color classes
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {string} Tailwind CSS classes for status badge
 */
export function getCumulativeDispatchStatusColor(dispatches) {
    if (!dispatches || !Array.isArray(dispatches) || dispatches.length === 0) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }

    const status = getCumulativeDispatchStatus(dispatches);

    if (status === "All Installed") {
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    }

    if (status.startsWith("Partially Installed")) {
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    }

    if (status === "In Progress") {
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
    }

    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
}

/**
 * Get total number of components that are installed across all dispatches
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {number} Total count of installed components
 */
export function getInstalledComponentCount(dispatches) {
    if (!dispatches || !Array.isArray(dispatches)) return 0;

    return dispatches.reduce((total, dispatch) => {
        // Check if dispatch is installed (both legacy and new format)
        const isInstalled =
            dispatch.dispatch_status === DISPATCH_STATUS_ENUM.INSTALLED ||
            dispatch.is_installed === true;

        if (!isInstalled) {
            return total;
        }

        // Count components in this installed dispatch
        const normalized = normalizeDispatch(dispatch);
        if (normalized.components) {
            return total + normalized.components.length;
        }
        // Legacy format - each dispatch is one component
        return total + 1;
    }, 0);
}

/**
 * Validate dispatch component data
 * @param {string} componentName - Component name to validate
 * @param {number} index - Index of component (for error messages)
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
export function validateComponent(componentName, index = 0) {
    const errors = [];

    if (!componentName || componentName.trim() === "") {
        errors.push(`Component ${index + 1}: Component name is required`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate multiple components for a dispatch
 * @param {Array<string>} components - Array of component names (strings)
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
export function validateComponents(components) {
    if (!components || components.length === 0) {
        return {
            isValid: false,
            errors: ["At least one component is required"],
        };
    }

    const allErrors = [];
    components.forEach((compName, index) => {
        const validation = validateComponent(compName, index);
        if (!validation.isValid) {
            allErrors.push(...validation.errors);
        }
    });

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
    };
}

/**
 * Create DispatchComponent instances from raw data
 * @deprecated Components are now just strings, not objects
 * @param {Array} componentsData - Array of component names (strings) or legacy objects
 * @returns {Array} Array of component names (strings)
 */
export function createDispatchComponents(componentsData) {
    if (!componentsData || !Array.isArray(componentsData)) {
        return [];
    }

    // Convert to array of strings
    return componentsData.map((comp) => {
        if (typeof comp === "string") {
            return comp;
        }
        // Legacy format - extract component name
        return comp.component_name || comp.component || "Unknown Component";
    });
}

/**
 * Create a Dispatch instance from raw data
 * @param {Object} dispatchData - Dispatch data object
 * @returns {Dispatch} Dispatch instance
 */
export function createDispatchFromData(dispatchData) {
    const components = createDispatchComponents(dispatchData.components || []);

    return new Dispatch({
        id: dispatchData.id || null,
        school_id: dispatchData.school_id,
        components: components,
        dispatch_date: dispatchData.dispatch_date || new Date().toISOString().split("T")[0],
        delivery_status: dispatchData.delivery_status || "Pending",
        installation_status: dispatchData.installation_status || "Not Started",
        delivery_proof_url: dispatchData.delivery_proof_url || null,
        installation_proof_url: dispatchData.installation_proof_url || null,
        is_installed: dispatchData.is_installed || false,
        tracking_number: dispatchData.tracking_number || null,
        vendor_name: dispatchData.vendor_name || null,
        purchase_order: dispatchData.purchase_order || null,
        invoice_number: dispatchData.invoice_number || null,
        warranty_period: dispatchData.warranty_period || null,
        installation_date: dispatchData.installation_date || null,
        technician_name: dispatchData.technician_name || null,
        contact_person: dispatchData.contact_person || null,
        contact_phone: dispatchData.contact_phone || null,
        remarks: dispatchData.remarks || null,
    });
}

/**
 * Check if a school is ready for dispatch
 * @param {Object} school - School object
 * @returns {Object} { isReady: boolean, error: string|null }
 */
export function validateSchoolForDispatch(school) {
    if (!school) {
        return { isReady: false, error: "School not found" };
    }

    if (!school.is_ready) {
        return { isReady: false, error: "School must be marked as ready first" };
    }

    // Readiness certificate is no longer mandatory for dispatch
    return { isReady: true, error: null };
}

/**
 * Calculate total cost for multiple components
 * @deprecated Components no longer have cost information
 * @param {Array} components - Array of component names (strings)
 * @returns {number} Always returns 0
 */
export function calculateComponentsTotalCost(components) {
    // Components are now just strings, no cost information
    return 0;
}

