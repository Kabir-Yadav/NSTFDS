/**
 * Training and Handover Status Utility Functions
 * 
 * Pure functions for training and handover status management.
 * These functions have no side effects and can be easily tested.
 */

/**
 * Simple status enum values from database
 */
export const SIMPLE_STATUS_ENUM = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete",
};

/**
 * Map simple status enum values to user-friendly display names
 */
export const SIMPLE_STATUS_DISPLAY = {
    [SIMPLE_STATUS_ENUM.NOT_STARTED]: "Not Started",
    [SIMPLE_STATUS_ENUM.IN_PROGRESS]: "In Progress",
    [SIMPLE_STATUS_ENUM.COMPLETE]: "Complete",
};

/**
 * Get all simple status options for dropdowns in correct order
 */
export const SIMPLE_STATUS_OPTIONS = [
    SIMPLE_STATUS_ENUM.NOT_STARTED,
    SIMPLE_STATUS_ENUM.IN_PROGRESS,
    SIMPLE_STATUS_ENUM.COMPLETE,
];

/**
 * Get the order/index of a status in the workflow
 * @param {string} statusEnum - Enum value from database
 * @returns {number} Order index (0-2), or -1 if invalid
 */
export function getSimpleStatusOrder(statusEnum) {
    return SIMPLE_STATUS_OPTIONS.indexOf(statusEnum);
}

/**
 * Get available next statuses (current status and all future statuses)
 * Status changes are irreversible - can only move forward
 * @param {string} currentStatus - Current status enum
 * @returns {Array<string>} Array of available status enum values
 */
export function getAvailableNextStatuses(currentStatus) {
    if (!currentStatus) {
        return SIMPLE_STATUS_OPTIONS;
    }

    const currentIndex = getSimpleStatusOrder(currentStatus);
    if (currentIndex === -1) {
        // Invalid status, return all options
        return SIMPLE_STATUS_OPTIONS;
    }

    // Get all future statuses (including current)
    return SIMPLE_STATUS_OPTIONS.slice(currentIndex);
}

/**
 * Get display name for a simple status enum value
 * @param {string} statusEnum - Enum value from database
 * @returns {string} User-friendly display name
 */
export function getSimpleStatusDisplay(statusEnum) {
    if (!statusEnum) return "Unknown";
    return SIMPLE_STATUS_DISPLAY[statusEnum] || statusEnum;
}

/**
 * Get status color classes based on simple status
 * @param {string} statusEnum - Enum value from database
 * @returns {string} Tailwind CSS classes for status badge
 */
export function getSimpleStatusColor(statusEnum) {
    if (!statusEnum) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }

    switch (statusEnum) {
        case SIMPLE_STATUS_ENUM.NOT_STARTED:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
        case SIMPLE_STATUS_ENUM.IN_PROGRESS:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
        case SIMPLE_STATUS_ENUM.COMPLETE:
            return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }
}

/**
 * Check if all components are dispatched and installed
 * @param {Array} dispatches - Array of dispatch objects
 * @returns {boolean} True if all dispatches are installed
 */
export function areAllComponentsInstalled(dispatches) {
    if (!dispatches || dispatches.length === 0) {
        return false;
    }

    // Check if all dispatches have status "installed"
    // Also check if there are any dispatches at all
    const hasDispatches = dispatches.length > 0;
    const allInstalled = dispatches.every(
        (dispatch) => dispatch.dispatch_status === "installed"
    );

    return hasDispatches && allInstalled;
}

/**
 * Check if training can be edited
 * Training can only be edited when all components are dispatched and installed
 * @param {Object} school - School object with dispatches
 * @returns {Object} { canEdit: boolean, error: string|null }
 */
export function canEditTraining(school) {
    if (!school) {
        return { canEdit: false, error: "School not found" };
    }

    if (!school.dispatches || school.dispatches.length === 0) {
        return {
            canEdit: false,
            error: "No dispatches found. All components must be dispatched and installed first.",
        };
    }

    if (!areAllComponentsInstalled(school.dispatches)) {
        return {
            canEdit: false,
            error: "All components must be dispatched and installed before training can be started.",
        };
    }

    return { canEdit: true, error: null };
}

/**
 * Check if handover can be edited
 * Handover can only be edited when training is complete
 * @param {Object} school - School object with training_status
 * @returns {Object} { canEdit: boolean, error: string|null }
 */
export function canEditHandover(school) {
    if (!school) {
        return { canEdit: false, error: "School not found" };
    }

    const trainingStatus = school.training_status || SIMPLE_STATUS_ENUM.NOT_STARTED;

    if (trainingStatus !== SIMPLE_STATUS_ENUM.COMPLETE) {
        return {
            canEdit: false,
            error: "Training must be completed before handover can be started.",
        };
    }

    return { canEdit: true, error: null };
}

/**
 * Validate status change (prevent going backwards)
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status to change to
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export function validateStatusChange(currentStatus, newStatus) {
    if (!currentStatus || !newStatus) {
        return { isValid: true, error: null };
    }

    const currentOrder = getSimpleStatusOrder(currentStatus);
    const newOrder = getSimpleStatusOrder(newStatus);

    if (newOrder < currentOrder) {
        return {
            isValid: false,
            error: `Cannot revert status. Current status is "${getSimpleStatusDisplay(
                currentStatus
            )}". Status changes are irreversible and you can only move forward.`,
        };
    }

    return { isValid: true, error: null };
}

/**
 * Check if expected date is required for a status change
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status to change to
 * @returns {boolean} True if expected date is required
 */
export function isExpectedDateRequired(currentStatus, newStatus) {
    // Date is required when moving from not_started to in_progress
    if (
        currentStatus === SIMPLE_STATUS_ENUM.NOT_STARTED &&
        newStatus === SIMPLE_STATUS_ENUM.IN_PROGRESS
    ) {
        return true;
    }

    return false;
}

