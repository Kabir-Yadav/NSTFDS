/**
 * Project Component Definitions
 * 
 * This file contains component definitions for different projects.
 * Components are now fetched from the database (projects table, category_list field).
 * 
 * @example
 * // Fetch components for a project
 * const { data: components } = await fetchProjectComponents("Space Lab");
 */

import React from "react";
import { fetchProjectComponents as fetchComponentsFromDB } from "../action/supabase_actions";

/**
 * Project Components Mapping
 * 
 * @deprecated Components are now fetched from database
 * This is kept for backward compatibility in legacy code only
 */
export const PROJECT_COMPONENTS = {};

/**
 * Get components for a specific project from database
 * @param {string} projectName - Name of the project (case-insensitive)
 * @returns {Promise<{data: string[], error: Error|null}>} Array of component names from database
 */
export async function getProjectComponents(projectName) {
    try {
        const { data, error } = await fetchComponentsFromDB(projectName);
        if (error) {
            console.error("Error fetching project components from database:", error);
            throw error;
        }
        return { data: data || [], error: null };
    } catch (error) {
        console.error("Error in getProjectComponents:", error);
        return { data: [], error };
    }
}

/**
 * Get all available project names
 * @deprecated This should fetch from database
 * @returns {string[]} Array of project names
 */
export function getAvailableProjects() {
    return Object.keys(PROJECT_COMPONENTS);
}

/**
 * Check if a component exists for a project
 * @param {string} projectName - Name of the project
 * @param {string} componentName - Name of the component
 * @returns {Promise<boolean>} True if component exists for the project
 */
export async function isValidComponent(projectName, componentName) {
    const { data: components, error } = await getProjectComponents(projectName);
    if (error) {
        console.error("Error validating component:", error);
        return false;
    }
    return components.includes(componentName);
}

/**
 * React hook to fetch and use project components
 * @param {string} projectName - Name of the project
 * @returns {Object} { components, loading, error }
 */
export function useProjectComponents(projectName) {
    const [components, setComponents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let isMounted = true;

        const fetchComponents = async () => {
            setLoading(true);
            setError(null);
            setComponents([]);

            try {
                const { data, error: fetchError } = await fetchComponentsFromDB(projectName);
                if (!isMounted) return;

                if (fetchError) {
                    console.error(`Failed to fetch components for project "${projectName}":`, fetchError);
                    setError(fetchError);
                    setComponents([]);
                } else {
                    console.log(`Successfully fetched ${data?.length || 0} components for project "${projectName}"`);
                    setComponents(data || []);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error(`Error fetching components for project "${projectName}":`, err);
                setError(err);
                setComponents([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (projectName) {
            fetchComponents();
        } else {
            setLoading(false);
            setComponents([]);
            setError(null);
        }

        return () => {
            isMounted = false;
        };
    }, [projectName]);

    return { components, loading, error };
}

