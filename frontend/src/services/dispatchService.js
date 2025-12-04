/**
 * Dispatch Service Layer
 * 
 * This service layer abstracts all dispatch-related business logic.
 * To connect to a database, simply replace the data source imports
 * and update the implementation while keeping the same interface.
 * 
 * All functions return { data, error } format for consistent error handling.
 */

import { Dispatch, DispatchComponent } from "../models/dispatchModels";
import {
    validateComponents,
    validateSchoolForDispatch,
    createDispatchFromData,
    getAvailableComponents,
    getDispatchStatusOrder,
    getAvailableNextStatuses,
    getDispatchStatusDisplay,
    validateStatusChange,
} from "../utils/dispatchUtils";

// Import database functions
import {
    fetchSpaceLabSchoolProjects,
    updateSchoolProjectCertificate,
    addSpaceLabDispatch,
    updateSpaceLabDispatch,
    uploadDispatchDeliveryProof,
    uploadDispatchInstallationProof,
    supabase,
} from "../action/supabase_actions";

/**
 * Fetch all schools with their dispatches from database
 * @param {string} projectName - Project name to filter by (default: "Space Lab")
 * @returns {Promise<{data: Array, error: null|string}>}
 */
export async function fetchSchools(projectName = "Space Lab") {
    try {
        const result = await fetchSpaceLabSchoolProjects(projectName);
        if (result.error) {
            console.error("Error fetching schools from database:", result.error);
            return { data: null, error: result.error.message || "Failed to fetch schools" };
        }
        console.log(`Successfully fetched ${result.data?.length || 0} school projects from database`);
        return result;
    } catch (error) {
        console.error("Error fetching schools:", error);
        return { data: null, error: error.message || "Failed to fetch schools" };
    }
}

/**
 * Toggle school ready status
 * @param {number|string} schoolId - School project ID (space_lab_school_projects.id)
 * @param {boolean} isReady - New ready status
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function toggleSchoolReady(schoolId, isReady) {
    try {
        // Update in database
        const readinessStatus = isReady ? "ready" : "not_ready";

        const { data, error } = await supabase
            .from("space_lab_school_projects")
            .update({
                readiness_status: readinessStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", schoolId)
            .select()
            .single();

        if (error) throw error;

        // Transform to match expected format
        const transformed = {
            id: data.id,
            school_id: data.school_id,
            state: data.state || "",
            district: data.district || "",
            school_name: data.school_name || "",
            psu_name: data.psu_name || "",
            is_ready: data.readiness_status === "ready",
            certificate_url: data.readiness_certificate_url || null,
            certificate_uploaded_date: data.readiness_certificate_url && data.updated_at
                ? new Date(data.updated_at).toISOString().split('T')[0]
                : null,
            dispatches: [], // Will be populated when fetching full data
        };

        return { data: transformed, error: null };
    } catch (error) {
        console.error("Error toggling school ready status:", error);
        return { data: null, error: error.message || "Failed to update school status" };
    }
}

/**
 * Upload certificate for a school
 * @param {number|string} schoolId - School ID
 * @param {File} file - Certificate file
 * @param {Object} schoolData - School data object with school_name and project_name (optional)
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function uploadCertificate(schoolId, file, schoolData = null) {
    try {
        // Validate file
        if (!file) {
            return { data: null, error: "No file provided" };
        }

        // If schoolData is provided, use new upload function with folder structure
        if (schoolData && schoolData.school_name) {
            const { uploadCertificateFile } = await import("../action/supabase_actions");
            const projectName = schoolData.project_name || "Space Lab";
            const { data: certificateUrl, error: uploadError } = await uploadCertificateFile({
                file,
                projectName,
                schoolName: schoolData.school_name,
            });

            if (uploadError) {
                return { data: null, error: uploadError.message || "Failed to upload certificate" };
            }

            // Update database with certificate URL
            const { updateSchoolProjectCertificate } = await import("../action/supabase_actions");
            const updateResult = await updateSchoolProjectCertificate(
                schoolId, // This should be school_project_id
                certificateUrl
            );

            if (updateResult.error) {
                console.error("Failed to update certificate URL in database:", updateResult.error);
                // Still return success with URL, but log the error
            }

            return {
                data: {
                    ...schoolData,
                    id: schoolId,
                    certificate_url: certificateUrl,
                    certificate_uploaded_date: new Date().toISOString().split('T')[0],
                },
                error: null,
            };
        }

        // If schoolData not provided, return error
        return { data: null, error: "School data is required for certificate upload" };
    } catch (error) {
        console.error("Error uploading certificate:", error);
        return { data: null, error: error.message || "Failed to upload certificate" };
    }
}

/**
 * Add a new dispatch for a school project
 * @param {number|string} schoolId - School project ID (space_lab_school_projects.id)
 * @param {Object} dispatchData - Dispatch data with components array
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function addDispatch(schoolId, dispatchData) {
    try {
        // Validate components
        if (!dispatchData.components || !Array.isArray(dispatchData.components)) {
            return { data: null, error: "Components array is required" };
        }

        const validation = validateComponents(dispatchData.components);
        if (!validation.isValid) {
            return { data: null, error: validation.errors.join(", ") };
        }

        // Fetch school to validate
        const { data: schools, error: fetchError } = await fetchSchools();
        if (fetchError) {
            return { data: null, error: fetchError };
        }

        const school = schools.find((s) => s.id === schoolId);
        if (!school) {
            return { data: null, error: "School project not found" };
        }

        const schoolValidation = validateSchoolForDispatch(school);
        if (!schoolValidation.isReady) {
            return { data: null, error: schoolValidation.error };
        }

        // Create dispatch in database
        const result = await addSpaceLabDispatch(schoolId, dispatchData);
        if (result.error) {
            return { data: null, error: result.error.message || "Failed to add dispatch" };
        }

        return { data: result.data, error: null };
    } catch (error) {
        console.error("Error adding dispatch:", error);
        return { data: null, error: error.message || "Failed to add dispatch" };
    }
}

/**
 * Update dispatch details (status, tracking, etc.)
 * @param {number|string} schoolId - School project ID (not used, kept for compatibility)
 * @param {number|string} dispatchId - Dispatch ID
 * @param {Object} updates - Fields to update in dispatch_info JSONB
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function updateDispatch(schoolId, dispatchId, updates) {
    try {
        const result = await updateSpaceLabDispatch(dispatchId, updates);
        if (result.error) {
            return { data: null, error: result.error.message || "Failed to update dispatch" };
        }
        return { data: result.data, error: null };
    } catch (error) {
        console.error("Error updating dispatch:", error);
        return { data: null, error: error.message || "Failed to update dispatch" };
    }
}

/**
 * Update dispatch status
 * @param {number|string} schoolId - School project ID (not used, kept for compatibility)
 * @param {number|string} dispatchId - Dispatch ID
 * @param {Object} statusUpdates - Status updates { dispatch_status }
 * @param {Object} currentDispatch - Current dispatch object (optional, for validation)
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function updateDispatchStatus(schoolId, dispatchId, statusUpdates, currentDispatch = null) {
    try {
        // Validate status change if current dispatch is provided
        if (currentDispatch && statusUpdates.dispatch_status) {
            const currentStatus = currentDispatch.dispatch_status || "pending_dispatch";
            const newStatus = statusUpdates.dispatch_status;

            const currentOrder = getDispatchStatusOrder(currentStatus);
            const newOrder = getDispatchStatusOrder(newStatus);

            // Prevent going backwards in status
            if (newOrder < currentOrder) {
                return {
                    data: null,
                    error: `Cannot revert status. Current status is "${getDispatchStatusDisplay(
                        currentStatus
                    )}". Status changes are irreversible and you can only move forward.`,
                };
            }

            // Validate: check if proofs are required and uploaded
            const proofValidation = validateStatusChange(newStatus, currentDispatch);
            if (!proofValidation.isValid) {
                return {
                    data: null,
                    error: proofValidation.error,
                };
            }
        }

        // Update dispatch_status (enum from database)
        const updates = {};
        if (statusUpdates.dispatch_status) {
            updates.dispatch_status = statusUpdates.dispatch_status;
        }

        const result = await updateSpaceLabDispatch(dispatchId, updates);
        if (result.error) {
            return { data: null, error: result.error.message || "Failed to update dispatch status" };
        }
        return { data: result.data, error: null };
    } catch (error) {
        console.error("Error updating dispatch status:", error);
        return { data: null, error: error.message || "Failed to update dispatch status" };
    }
}

/**
 * Upload delivery proof for a dispatch
 * @param {number|string} schoolId - School project ID
 * @param {number|string} dispatchId - Dispatch ID
 * @param {File} file - Proof file (image or PDF)
 * @param {Object} schoolData - School data with school_name and project_name (optional)
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function uploadDeliveryProof(schoolId, dispatchId, file, schoolData = null) {
    try {
        // Validate file
        if (!file) {
            return { data: null, error: "No file provided" };
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!validTypes.includes(file.type)) {
            return { data: null, error: "Invalid file type. Only images and PDFs are allowed" };
        }

        // Fetch school data if not provided
        let schoolInfo = schoolData;
        if (!schoolInfo) {
            const { data: schools } = await fetchSchools();
            const school = schools?.find((s) => s.id === schoolId);
            if (school) {
                schoolInfo = {
                    school_name: school.school_name,
                    project_name: school.project_name || "Space Lab",
                };
            }
        }

        if (!schoolInfo || !schoolInfo.school_name) {
            return { data: null, error: "School data is required for file upload" };
        }

        const result = await uploadDispatchDeliveryProof(dispatchId, file, schoolInfo);
        if (result.error) {
            return { data: null, error: result.error.message || "Failed to upload delivery proof" };
        }

        // Result already contains the fully updated dispatch object (with proofs array)
        return { data: result.data, error: null };
    } catch (error) {
        console.error("Error uploading delivery proof:", error);
        return { data: null, error: error.message || "Failed to upload delivery proof" };
    }
}

/**
 * Upload installation proof for a dispatch
 * @param {number|string} schoolId - School project ID
 * @param {number|string} dispatchId - Dispatch ID
 * @param {File} file - Proof file (image or PDF)
 * @param {Object} schoolData - School data with school_name and project_name (optional)
 * @returns {Promise<{data: Object|null, error: null|string}>}
 */
export async function uploadInstallationProof(schoolId, dispatchId, file, schoolData = null) {
    try {
        // Validate file
        if (!file) {
            return { data: null, error: "No file provided" };
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!validTypes.includes(file.type)) {
            return { data: null, error: "Invalid file type. Only images and PDFs are allowed" };
        }

        // Fetch school data if not provided
        let schoolInfo = schoolData;
        if (!schoolInfo) {
            const { data: schools } = await fetchSchools();
            const school = schools?.find((s) => s.id === schoolId);
            if (school) {
                schoolInfo = {
                    school_name: school.school_name,
                    project_name: school.project_name || "Space Lab",
                };
            }
        }

        if (!schoolInfo || !schoolInfo.school_name) {
            return { data: null, error: "School data is required for file upload" };
        }

        const result = await uploadDispatchInstallationProof(dispatchId, file, schoolInfo);
        if (result.error) {
            return { data: null, error: result.error.message || "Failed to upload installation proof" };
        }

        // Result already contains the fully updated dispatch object (with proofs array)
        return { data: result.data, error: null };
    } catch (error) {
        console.error("Error uploading installation proof:", error);
        return { data: null, error: error.message || "Failed to upload installation proof" };
    }
}

/**
 * Get available components for a school (not yet dispatched)
 * @param {Object} school - School object with dispatches
 * @param {Array} allComponents - All available components for the project
 * @returns {Array} Array of available component names
 */
export function getAvailableComponentsForSchool(school, allComponents) {
    return getAvailableComponents(allComponents, school?.dispatches || []);
}

// Re-export dispatch status utilities for convenience
export {
    DISPATCH_STATUS_OPTIONS,
    DISPATCH_STATUS_ENUM,
    DISPATCH_STATUS_DISPLAY,
    getDispatchStatusDisplay,
    getDispatchStatusColor,
    getAvailableNextStatuses,
} from "../utils/dispatchUtils";

