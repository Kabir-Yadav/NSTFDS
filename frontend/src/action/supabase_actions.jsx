// useStatsWithStateFilter.js
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
// import { data } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useStatsWithStateFilter = () => {
  const [statesList, setStatesList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStates: 0,
    totalDistricts: 0,
    totalSchools: 0,
    totalPSUs: 0,
    activeProjects: 0,
  });

  const fetchStates = async () => {
    const { data, error } = await supabase.from("states").select("name");
    if (!error) setStatesList(data.map((s) => s.name));
  };

  const fetchStats = async (stateName = null) => {
    setLoading(true);
    try {
      let stateRes;
      let stateId = null;

      if (stateName) {
        stateRes = await supabase
          .from("states")
          .select("id")
          .eq("name", stateName)
          .single();
        stateId = stateRes?.data?.id;
      } else {
        stateRes = await supabase
          .from("states")
          .select("*", { count: "exact", head: true });
      }

      const totalStates = stateName ? 1 : stateRes.count || 0;

      // Districts count
      let districtQuery = supabase
        .from("districts")
        .select("*", { count: "exact", head: true });
      if (stateId) districtQuery = districtQuery.eq("state_id", stateId);
      const { count: totalDistricts = 0 } = await districtQuery;

      // Schools count
      let schoolCount = 0;
      if (stateId) {
        const { data: districts } = await supabase
          .from("districts")
          .select("id")
          .eq("state_id", stateId);
        const districtIds = districts?.map((d) => d.id);

        if (districtIds.length > 0) {
          const { data: blocks } = await supabase
            .from("blocks")
            .select("id")
            .in("district_id", districtIds);
          const blockIds = blocks?.map((b) => b.id);

          if (blockIds.length > 0) {
            const { count } = await supabase
              .from("schools")
              .select("*", { count: "exact", head: true })
              .in("block_id", blockIds);
            schoolCount = count || 0;
          }
        }
      } else {
        const { count } = await supabase
          .from("schools")
          .select("*", { count: "exact", head: true });
        schoolCount = count || 0;
      }

      // PSU Count from project_deliveries
      let psuQuery = supabase
        .from("project_deliveries")
        .select("psu_name", { count: "exact", head: false });
      if (stateName) psuQuery = psuQuery.eq("state", stateName);

      const { data: psuDeliveries } = await psuQuery;
      const uniquePSU = [
        ...new Set(psuDeliveries?.map((p) => p.psu_name.toLowerCase())),
      ];
      const totalPSUs = uniquePSU.length;

      // Active Projects (if you want from `project_deliveries` with status not Pending)
      let projectQuery = supabase
        .from("project_deliveries")
        .select("*", { count: "exact", head: true })
        .not("status", "eq", "Pending");
      if (stateName) projectQuery = projectQuery.eq("state", stateName);
      const { count: activeProjects = 0 } = await projectQuery;

      setStats({
        totalStates,
        totalDistricts,
        totalSchools: schoolCount,
        totalPSUs,
        activeProjects,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStates();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats(selectedState);
  }, [selectedState]);

  return { statesList, selectedState, setSelectedState, stats, loading };
};

// --------------------------------------------------------------------------------------------------------

export async function fetchHierarchicalData() {
  try {
    const { data, error } = await supabase.rpc("get_hierarchical_data_json");

    if (error) {
      console.error("Error fetching hierarchical data:", error);
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error in fetchHierarchicalData:", error);
    return [];
  }
}

// --------------------------------------------------------------------------------------------------------

export async function fetchProjectsAndPsu() {
  try {
    // Fetch all projects
    const { data: projects, error: projectError } = await supabase
      .from("projects")
      .select("*");
    if (projectError) throw projectError;

    // Fetch PSU-to-project mapping in one bulk query
    const { data: mapping, error: mappingError } = await supabase
      .from("psu_projects")
      .select("psu:psu_id (name), project:project_id (name)");
    if (mappingError) throw mappingError;

    const psuProjects = {};
    mapping.forEach(({ psu, project }) => {
      if (!psuProjects[psu.name]) psuProjects[psu.name] = [];
      psuProjects[psu.name].push({ project_name: project.name });
    });

    return { projects, psuProjects };
  } catch (error) {
    console.error("Error in fetchProjectsAndPsu:", error);
    return { projects: [], psuProjects: {} };
  }
}

// --------------------------------------------------------------------------------------------------------

export async function fetchBudgetUtilization(stateName = null) {
  const { data, error } = await supabase.rpc("get_budget_utilization", {
    p_state: stateName,
  });
  if (error) {
    console.error("Error fetching budget utilization:", error);
    return [];
  }
  return data;
}

// ----------------------------------------------------------------------------------------------------

export async function fetchProjectCompletionRate(stateName = null) {
  const { data, error } = await supabase.rpc("get_project_completion_rate", {
    p_state: stateName,
  });
  if (error) {
    console.error("Error fetching completion rate:", error);
    return [];
  }
  return data; // [{ state_name, completion_rate }, …]
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDistrictCompletionRate(stateName) {
  const { data, error } = await supabase.rpc("get_district_completion_rate", {
    p_state: stateName,
  });
  if (error) {
    console.error("Error fetching district completion rate:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchPsuProjectBudgets(psuName) {
  const { data, error } = await supabase.rpc("get_psu_project_budgets", {
    p_psu: psuName,
  });
  if (error) {
    console.error("Error fetching PSU project budgets:", error);
    return [];
  }
  return data; // [{ project_name, allocated_budget, used_budget }, …]
}

//-----------------------------------------------------------------------------------------------------

export async function fetchPsuStateBudgets(psuName) {
  const { data, error } = await supabase.rpc("get_psu_state_budgets", {
    p_psu: psuName,
  });
  if (error) {
    console.error("Error fetching PSU‐state budgets:", error);
    return [];
  }
  return data; // [{ state_name, allocated_budget, used_budget }, …]
}

//-----------------------------------------------------------------------------------------------------

export async function fetchPsuProjectBudgetsByState(psuName, stateName) {
  const { data, error } = await supabase.rpc(
    "get_psu_project_budgets_by_state",
    {
      p_psu: psuName,
      p_state: stateName,
    }
  );
  if (error) {
    console.error("Error fetching PSU-project budgets by state:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchSchoolImplementationRate(stateName = null) {
  const { data, error } = await supabase.rpc("get_school_implementation_rate", {
    p_state: stateName,
  });
  if (error) {
    console.error("Error fetching school implementation rate:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchPsuStateDistrictStats(psu, state) {
  const { data, error } = await supabase.rpc("get_psu_state_district_stats", {
    p_psu: psu,
    p_state: state,
  });
  if (error) {
    console.error("Error fetching district stats:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDashboardOnlyPSUData(psuName) {
  const { data, error } = await supabase.rpc("dashboard_all_states", {
    psu_input: psuName,
  });
  if (error) {
    console.error("Error fetching dashboard all states:", error);
    return null;
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDashboardBothStatePSUData(psuName, stateName) {
  const { data, error } = await supabase.rpc("dashboard_state", {
    psu_input: psuName,
    state_input: stateName,
  });
  if (error) {
    console.error("Error fetching dashboard state:", error);
    return null;
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

// export async function fetchDistrictProgressByState(stateName, options = {}) {
//   return [];
// }

//-----------------------------------------------------------------------------------------------------

export async function fetchTableData({ selectedProject }) {
  const { data, error } = await supabase
    .from("project_deliveries")
    .select("*")
    .eq("project_name", selectedProject);
  if (error) {
    console.error("Error fetching device procurements:", error);
    return [];
  }
  return data || [];
}

//-----------------------------------------------------------------------------------------------------

// export async function isDigitalProcurementActive(schoolName) {
// console.log(schoolName);
// const { data, error } = await supabase
//   .from("schools")
//   .select("digital_device_procurement_active")
//   .match({
//     school_name: schoolName,
//   })
//   .single();
// if (error) {
//   console.error("Failed to fetch procurement status:", error);
//   return false;
// }
// return data?.digital_device_procurement_active === true;
// }

//-----------------------------------------------------------------------------------------------------

// export async function isSanitaryProcurementActive(schoolName) {
// console.log(schoolName);
// const { data, error } = await supabase
//   .from("schools")
//   .select("sanitary_pad_procurement_active")
//   .match({
//     school_name: schoolName,
//   })
//   .single();
// if (error) {
//   console.error("Failed to fetch procurement status:", error);
//   return false;
// }
// return data?.sanitary_pad_procurement_active === true;
// }
/*
 * =============================
 *      INSERT FUNCTIONS
 * =============================
 */

export async function insertProjectDelivery(record) {
  // Note: .select() returns the full row (including id, timestamps)
  const { data, error } = await supabase
    .from("project_deliveries")
    .insert([record])
    .select()
    .single(); // .single() so data is one row, not array
  return { data, error };
}

export async function insertProjectDeliveries(records) {
  const { data, error } = await supabase
    .from("project_deliveries")
    .insert(records)
    .select(); // returns array of full rows
  return { data, error };
}

// ----------------------------------------------------------------------

/**
 * Sanitize a string to be used as a folder name
 * Removes special characters and replaces spaces with underscores
 * @param {string} name - Name to sanitize
 * @returns {string} Sanitized folder name
 */
export function sanitizeFolderName(name) {
  if (!name) return "";
  // Replace spaces with underscores, remove special characters except underscores and hyphens
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
}

/**
 * Upload proof image to Supabase storage
 * @param {Object} params - Upload parameters
 * @param {File} params.file - File to upload
 * @param {string} params.projectName - Project name (e.g., "Space Lab") - used as-is, not lowercased
 * @param {string} params.schoolName - School name for folder structure (optional)
 * @returns {Promise<string|null>} Public URL of uploaded file or null on error
 */
export async function uploadProofImage({
  file,
  projectName,
  schoolName = null,
}) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const bucket = "proofs";

  // Build file path: proofs/{Project Name}/{School Name}/filename
  let filePath;
  if (schoolName) {
    const sanitizedSchoolName = sanitizeFolderName(schoolName);
    filePath = `${projectName}/${sanitizedSchoolName}/${fileName}`;
  } else {
    // Fallback to old structure if school name not provided
    filePath = `${projectName}/${fileName}`;
  }

  // Upload
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return null;
  }

  // Get public URL
  const { data, error } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (error) {
    console.error("getPublicUrl error:", error);
    return null;
  }
  return data.publicUrl;
}

/**
 * Upload certificate for a school project
 * @param {Object} params - Upload parameters
 * @param {File} params.file - Certificate file to upload
 * @param {string} params.projectName - Project name (e.g., "Space Lab")
 * @param {string} params.schoolName - School name for folder structure
 * @returns {Promise<{data: string|null, error: Error|null}>} Public URL of uploaded certificate
 */
export async function uploadCertificateFile({ file, projectName, schoolName }) {
  if (!file) {
    return { data: null, error: new Error("No file provided") };
  }

  if (!schoolName) {
    return {
      data: null,
      error: new Error("School name is required for certificate upload"),
    };
  }

  try {
    const url = await uploadProofImage({ file, projectName, schoolName });
    if (!url) {
      return {
        data: null,
        error: new Error("Failed to upload certificate to storage"),
      };
    }
    console.log(
      `Certificate uploaded successfully to: proofs/${projectName}/${sanitizeFolderName(
        schoolName
      )}/`
    );
    return { data: url, error: null };
  } catch (error) {
    console.error("Error uploading certificate:", error);
    return { data: null, error };
  }
}

/**
 * Update certificate URL for a space lab school project
 * @param {number} schoolProjectId - ID of the school project in space_lab_school_projects table
 * @param {string} certificateUrl - URL of the uploaded certificate
 * @returns {Promise<{data: Object|null, error: Error|null}>} Updated school project record
 */
export async function updateSchoolProjectCertificate(
  schoolProjectId,
  certificateUrl
) {
  try {
    const { data, error } = await supabase
      .from("space_lab_school_projects")
      .update({
        readiness_certificate_url: certificateUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schoolProjectId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating school project certificate:", error);
    return { data: null, error };
  }
}

//-----------------------------------------------------------------------------------------------------

/**
 * Fetch all Space Lab school projects with their dispatches
 * @param {string} projectName - Project name to filter by (default: "Space Lab")
 * @returns {Promise<{data: Array|null, error: Error|null}>} Array of school projects with dispatches
 */
export async function fetchSpaceLabSchoolProjects(projectName = "Space Lab") {
  try {
    // Fetch school projects
    const { data: schoolProjects, error: projectsError } = await supabase
      .from("space_lab_school_projects")
      .select("*")
      .ilike("project_name", projectName)
      .order("created_at", { ascending: false });

    if (projectsError) throw projectsError;

    if (!schoolProjects || schoolProjects.length === 0) {
      return { data: [], error: null };
    }

    // Get all school project IDs
    const schoolProjectIds = schoolProjects.map((sp) => sp.id);

    // Fetch all dispatches for these school projects
    const { data: dispatches, error: dispatchesError } = await supabase
      .from("space_lab_dispatches")
      .select("*")
      .in("school_project_id", schoolProjectIds)
      .order("dispatch_no", { ascending: true });

    if (dispatchesError) throw dispatchesError;

    // Group dispatches by school_project_id
    const dispatchesByProject = {};
    (dispatches || []).forEach((dispatch) => {
      const projectId = dispatch.school_project_id;
      if (!dispatchesByProject[projectId]) {
        dispatchesByProject[projectId] = [];
      }
      dispatchesByProject[projectId].push(dispatch);
    });

    // Transform data to match frontend expected format
    const transformedData = schoolProjects.map((project) => {
      // Map readiness_status enum to boolean is_ready
      const isReady = project.readiness_status === "ready";

      // Transform dispatches
      const projectDispatches = (dispatchesByProject[project.id] || []).map(
        (dispatch) => {
          // Parse dispatch_info JSONB to extract components and other data
          const dispatchInfo = dispatch.dispatch_info || {};
          const components = dispatchInfo.components || [];

          // Transform components to array of strings
          // Handle both new format (array of strings) and legacy format (array of objects)
          const componentsArray = Array.isArray(components)
            ? components.map((comp) => {
                if (typeof comp === "string") {
                  return comp;
                }
                // Legacy format - extract component name
                return (
                  comp.component_name ||
                  comp.name ||
                  comp.component ||
                  "Unknown Component"
                );
              })
            : [];

          // Normalize delivery proofs to an array for multi-proof support
          const rawDeliveryProof = dispatchInfo.delivery_proof_url || null;
          const rawDeliveryProofs = dispatchInfo.delivery_proof_urls;
          const deliveryProofUrls = Array.isArray(rawDeliveryProofs)
            ? rawDeliveryProofs
            : rawDeliveryProof
            ? [rawDeliveryProof]
            : [];

          // Normalize installation proofs to an array for multi-proof support
          const rawInstallationProof =
            dispatchInfo.installation_proof_url || null;
          const rawInstallationProofs = dispatchInfo.installation_proof_urls;
          const installationProofUrls = Array.isArray(rawInstallationProofs)
            ? rawInstallationProofs
            : rawInstallationProof
            ? [rawInstallationProof]
            : [];

          return {
            id: dispatch.id,
            school_id: project.id, // Use school_project_id as school_id for frontend
            school_project_id: dispatch.school_project_id,
            dispatch_no: dispatch.dispatch_no,
            components: componentsArray,
            expected_delivery_date: dispatchInfo.expected_delivery_date || null,
            dispatch_date: dispatchInfo.dispatch_date || null,
            dispatch_status: dispatch.dispatch_status || "pending_dispatch",
            // For backward compatibility keep single URL fields as the first proof
            delivery_proof_url: deliveryProofUrls[0] || null,
            installation_proof_url: installationProofUrls[0] || null,
            // New multi-proof arrays
            delivery_proof_urls: deliveryProofUrls,
            installation_proof_urls: installationProofUrls,
            tracking_number: dispatchInfo.tracking_number || null,
            tracking_url: dispatchInfo.tracking_url || null,
            vendor_name: dispatchInfo.vendor_name || null,
            purchase_order: dispatchInfo.purchase_order || null,
            invoice_number: dispatchInfo.invoice_number || null,
            warranty_period: dispatchInfo.warranty_period || null,
            installation_date: dispatchInfo.installation_date || null,
            technician_name: dispatchInfo.technician_name || null,
            contact_person: dispatchInfo.contact_person || null,
            contact_phone: dispatchInfo.contact_phone || null,
            remarks: dispatchInfo.remarks || dispatch.remarks || null,
          };
        }
      );

      return {
        id: project.id,
        school_id: project.school_id,
        state: project.state || "",
        district: project.district || "",
        block: project.block || "",
        school_name: project.school_name || "",
        psu_name: project.psu_name || "",
        project_name: project.project_name,
        is_ready: isReady,
        certificate_url: project.readiness_certificate_url || null,
        certificate_uploaded_date: project.readiness_certificate_url
          ? project.updated_at
            ? new Date(project.updated_at).toISOString().split("T")[0]
            : null
          : null,
        unit_cost: project.unit_cost || 0,
        quantity: project.quantity || 0,
        components_left: project.components_left || [],
        training_status: project.training_status || "not_started",
        expected_training_completion_date:
          project.expected_training_completion_date || null,
        handover_status: project.handover_status || "not_started",
        expected_handover_date: project.expected_handover_date || null,
        handover_certificate_url: project.handover_certificate_url || null,
        remarks: project.remarks || null,
        created_at: project.created_at || null,
        delivery_installation_status:
          project.delivery_installation_status || "not_started",
        dispatches: projectDispatches,
      };
    });

    return { data: transformedData, error: null };
  } catch (error) {
    console.error("Error fetching Space Lab school projects:", error);
    return { data: null, error };
  }
}

export async function updateProjectExtraData(rowId, extraData) {
  try {
    const { data, error } = await supabase
      .from("project_deliveries")
      .update({
        extra_json: extraData,
      })
      .eq("id", rowId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating extra data:", error);
    return { data: null, error };
  }
}

/**
 * Update training status and expected training completion date for a school project
 * @param {number} schoolProjectId - ID of the school project in space_lab_school_projects table
 * @param {string} trainingStatus - New training status (not_started, in_progress, complete)
 * @param {string} expectedTrainingCompletionDate - Expected training completion date (YYYY-MM-DD format, optional)
 * @returns {Promise<{data: Object|null, error: Error|null}>} Updated school project record
 */
export async function updateSchoolProjectTraining(
  schoolProjectId,
  trainingStatus,
  expectedTrainingCompletionDate = null
) {
  try {
    const updateData = {
      training_status: trainingStatus,
      updated_at: new Date().toISOString(),
    };

    // Only update expected_training_completion_date if provided
    if (expectedTrainingCompletionDate) {
      updateData.expected_training_completion_date =
        expectedTrainingCompletionDate;
    }

    const { data, error } = await supabase
      .from("space_lab_school_projects")
      .update(updateData)
      .eq("id", schoolProjectId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating school project training:", error);
    return { data: null, error };
  }
}

/**
 * Update handover status and expected handover date for a school project
 * @param {number} schoolProjectId - ID of the school project in space_lab_school_projects table
 * @param {string} handoverStatus - New handover status (not_started, in_progress, complete)
 * @param {string} expectedHandoverDate - Expected handover date (YYYY-MM-DD format, optional)
 * @param {string} handoverCertificateUrl - Handover certificate URL (optional)
 * @returns {Promise<{data: Object|null, error: Error|null}>} Updated school project record
 */
export async function updateSchoolProjectHandover(
  schoolProjectId,
  handoverStatus,
  expectedHandoverDate = null,
  handoverCertificateUrl = null
) {
  try {
    const updateData = {
      handover_status: handoverStatus,
      updated_at: new Date().toISOString(),
    };

    // Only update expected_handover_date if provided
    if (expectedHandoverDate) {
      updateData.expected_handover_date = expectedHandoverDate;
    }

    // Only update handover_certificate_url if provided
    if (handoverCertificateUrl) {
      updateData.handover_certificate_url = handoverCertificateUrl;
    }

    const { data, error } = await supabase
      .from("space_lab_school_projects")
      .update(updateData)
      .eq("id", schoolProjectId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating school project handover:", error);
    return { data: null, error };
  }
}

/**
 * Update handover certificate URL for a space lab school project
 * @param {number} schoolProjectId - ID of the school project in space_lab_school_projects table
 * @param {string} certificateUrl - URL of the uploaded handover certificate
 * @returns {Promise<{data: Object|null, error: Error|null}>} Updated school project record
 */
export async function updateSchoolProjectHandoverCertificate(
  schoolProjectId,
  certificateUrl
) {
  try {
    const { data, error } = await supabase
      .from("space_lab_school_projects")
      .update({
        handover_certificate_url: certificateUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schoolProjectId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating handover certificate:", error);
    return { data: null, error };
  }
}

//-----------------------------------------------------------------------------------------------------

/**
 * Creates a new Space Lab school project entry
 * Calls the create_space_lab_school_project SQL function
 * @param {Object} params - Parameters for the function
 * @param {string} params.school_name - Name of the school
 * @param {number} params.unit_cost - Cost value for the project
 * @param {boolean} params.readiness - Marks the project ready or not (default: false)
 * @param {boolean} params.requires_certificate - If true, certificate URL must be provided (default: false)
 * @param {string} params.readiness_certificate_url - File path or URL (default: null)
 * @param {string} params.remarks - Free text remarks (default: null)
 * @param {string} params.project_name - Project key (default: 'Space Lab')
 * @returns {Promise<{data: number|null, error: Error|null}>} Returns the newly inserted ID
 */
export async function createSpaceLabSchoolProject({
  school_name,
  unit_cost,
  readiness = false,
  requires_certificate = false,
  readiness_certificate_url = null,
  remarks = null,
  project_name = "Space Lab",
}) {
  try {
    const { data, error } = await supabase.rpc(
      "create_space_lab_school_project",
      {
        p_school_name: school_name,
        p_unit_cost: unit_cost,
        p_readiness: readiness,
        p_requires_certificate: requires_certificate,
        p_readiness_certificate_url: readiness_certificate_url,
        p_remarks: remarks,
        p_project_name: project_name,
      }
    );

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating Space Lab school project:", error);
    return { data: null, error };
  }
}

// export async function insertDigitalProcurement(formData) {
// const { state_name, district_name, school_name } = formData;
// const { error } = await supabase.from("digital_device_procurement").insert({
//   state_name,
//   district_name,
//   school_name,
//   item_name: formData.item_name,
//   cost: formData.cost,
//   status: formData.status,
//   delivery_date: formData.delivery_date,
//   proof_image_url: formData.proof_image_url,
// });
// if (error) {
//   console.error("Error inserting digital procurement record:", error);
//   return { success: false, error };
// }
// return { success: true };
// }

//-----------------------------------------------------------------------------------------------------

/**
 * Fetches project components (category_list) from the projects table
 * @param {string} projectName - Name of the project (case-insensitive match)
 * @returns {Promise<{data: string[]|null, error: Error|null}>} Returns the category_list array
 */
export async function fetchProjectComponents(projectName = "Space Lab") {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("category_list")
      .ilike("name", projectName)
      .single();

    if (error) throw error;
    return { data: data?.category_list || [], error: null };
  } catch (error) {
    console.error("Error fetching project components:", error);
    return { data: null, error };
  }
}

//-----------------------------------------------------------------------------------------------------

/**
 * Add a new dispatch for a school project
 * @param {number} schoolProjectId - ID of the school project (space_lab_school_projects.id)
 * @param {Object} dispatchData - Dispatch data with components array
 * @returns {Promise<{data: Object|null, error: Error|null}>} Created dispatch record
 */
export async function addSpaceLabDispatch(schoolProjectId, dispatchData) {
  try {
    // Get the next dispatch_no for this school project
    const { data: existingDispatches, error: fetchError } = await supabase
      .from("space_lab_dispatches")
      .select("dispatch_no")
      .eq("school_project_id", schoolProjectId)
      .order("dispatch_no", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const nextDispatchNo =
      existingDispatches && existingDispatches.length > 0
        ? existingDispatches[0].dispatch_no + 1
        : 1;

    // Get current school project to update components_left
    const { data: schoolProject, error: projectError } = await supabase
      .from("space_lab_school_projects")
      .select("components_left")
      .eq("id", schoolProjectId)
      .single();

    if (projectError) throw projectError;

    // Extract component names from dispatch
    // Components can be array of strings (new format) or array of objects (legacy)
    const dispatchedComponentNames = (dispatchData.components || []).map(
      (comp) => (typeof comp === "string" ? comp : comp.component_name)
    );

    // Update components_left by removing dispatched components
    const currentComponentsLeft = schoolProject.components_left || [];
    const updatedComponentsLeft = currentComponentsLeft.filter(
      (comp) => !dispatchedComponentNames.includes(comp)
    );

    // Prepare dispatch_info JSONB with components and metadata
    // Ensure components are stored as array of strings
    const componentsArray = (dispatchData.components || []).map((comp) =>
      typeof comp === "string" ? comp : comp.component_name || comp.component
    );

    const dispatchInfo = {
      components: componentsArray,
      expected_delivery_date: dispatchData.expected_delivery_date || null,
      dispatch_date: dispatchData.dispatch_date || null,
      // Proofs are stored as arrays to support multiple documents
      delivery_proof_urls: [],
      installation_proof_urls: [],
      // Backward compatible single-url fields (first element of arrays)
      delivery_proof_url: null,
      installation_proof_url: null,
      tracking_number: null,
      tracking_url: null,
      vendor_name: null,
      purchase_order: null,
      invoice_number: null,
      warranty_period: null,
      installation_date: null,
      technician_name: null,
      contact_person: null,
      contact_phone: null,
      remarks: null,
      ...dispatchData, // Override with any provided data
      // Ensure components, expected_delivery_date, and dispatch_date are set correctly after spread
      components: componentsArray,
      expected_delivery_date: dispatchData.expected_delivery_date || null,
      dispatch_date: dispatchData.dispatch_date || null,
    };

    // Insert dispatch and update components_left in a transaction-like manner
    // Use dispatch_status enum from database (default: pending_dispatch)
    const { data, error } = await supabase
      .from("space_lab_dispatches")
      .insert({
        school_project_id: schoolProjectId,
        dispatch_no: nextDispatchNo,
        dispatch_status: dispatchData.dispatch_status || "pending_dispatch",
        dispatch_info: dispatchInfo,
      })
      .select()
      .single();

    if (error) throw error;

    // Update components_left in school project
    const { error: updateError } = await supabase
      .from("space_lab_school_projects")
      .update({
        components_left: updatedComponentsLeft,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schoolProjectId);

    if (updateError) {
      console.error("Failed to update components_left:", updateError);
      // Don't throw - dispatch was created successfully
    }

    // Transform to match frontend format
    const transformed = {
      id: data.id,
      school_id: schoolProjectId, // Use school_project_id as school_id for frontend
      school_project_id: data.school_project_id,
      dispatch_no: data.dispatch_no,
      components: dispatchInfo.components || [],
      expected_delivery_date: dispatchInfo.expected_delivery_date || null,
      dispatch_date: dispatchInfo.dispatch_date || null,
      dispatch_status: data.dispatch_status || "pending_dispatch",
      // Multi-proof fields
      delivery_proof_urls: dispatchInfo.delivery_proof_urls || [],
      installation_proof_urls: dispatchInfo.installation_proof_urls || [],
      // Backward compatible single-url fields
      delivery_proof_url:
        (dispatchInfo.delivery_proof_urls &&
          dispatchInfo.delivery_proof_urls[0]) ||
        dispatchInfo.delivery_proof_url ||
        null,
      installation_proof_url:
        (dispatchInfo.installation_proof_urls &&
          dispatchInfo.installation_proof_urls[0]) ||
        dispatchInfo.installation_proof_url ||
        null,
      tracking_number: dispatchInfo.tracking_number || null,
      tracking_url: dispatchInfo.tracking_url || null,
      vendor_name: dispatchInfo.vendor_name || null,
      purchase_order: dispatchInfo.purchase_order || null,
      invoice_number: dispatchInfo.invoice_number || null,
      warranty_period: dispatchInfo.warranty_period || null,
      installation_date: dispatchInfo.installation_date || null,
      technician_name: dispatchInfo.technician_name || null,
      contact_person: dispatchInfo.contact_person || null,
      contact_phone: dispatchInfo.contact_phone || null,
      remarks: dispatchInfo.remarks || null,
    };

    return { data: transformed, error: null };
  } catch (error) {
    console.error("Error adding dispatch:", error);
    return { data: null, error };
  }
}

/**
 * Update dispatch information
 * @param {number} dispatchId - Dispatch ID
 * @param {Object} updates - Fields to update in dispatch_info JSONB
 * @returns {Promise<{data: Object|null, error: Error|null}>} Updated dispatch record
 */
export async function updateSpaceLabDispatch(dispatchId, updates) {
  try {
    // Fetch current dispatch
    const { data: currentDispatch, error: fetchError } = await supabase
      .from("space_lab_dispatches")
      .select("*")
      .eq("id", dispatchId)
      .single();

    if (fetchError) throw fetchError;

    // Separate dispatch_status from dispatch_info updates
    const { dispatch_status, ...infoUpdates } = updates;

    // Merge updates with existing dispatch_info
    const currentInfo = currentDispatch.dispatch_info || {};
    const updatedInfo = {
      ...currentInfo,
      ...infoUpdates,
    };

    // Prepare update object
    const updateData = {
      dispatch_info: updatedInfo,
      updated_at: new Date().toISOString(),
    };

    // Update dispatch_status if provided
    if (dispatch_status) {
      updateData.dispatch_status = dispatch_status;
    }

    // Update dispatch
    const { data, error } = await supabase
      .from("space_lab_dispatches")
      .update(updateData)
      .eq("id", dispatchId)
      .select()
      .single();

    if (error) throw error;

    // Transform to match frontend format
    const transformed = {
      id: data.id,
      school_id: data.school_project_id,
      school_project_id: data.school_project_id,
      dispatch_no: data.dispatch_no,
      components: updatedInfo.components || [],
      expected_delivery_date: updatedInfo.expected_delivery_date || null,
      dispatch_date: updatedInfo.dispatch_date || null,
      dispatch_status: data.dispatch_status || "pending_dispatch",
      // Multi-proof fields (normalize to arrays)
      delivery_proof_urls: Array.isArray(updatedInfo.delivery_proof_urls)
        ? updatedInfo.delivery_proof_urls
        : updatedInfo.delivery_proof_url
        ? [updatedInfo.delivery_proof_url]
        : [],
      installation_proof_urls: Array.isArray(
        updatedInfo.installation_proof_urls
      )
        ? updatedInfo.installation_proof_urls
        : updatedInfo.installation_proof_url
        ? [updatedInfo.installation_proof_url]
        : [],
      // Backward compatible single-url fields
      delivery_proof_url: updatedInfo.delivery_proof_url || null,
      installation_proof_url: updatedInfo.installation_proof_url || null,
      tracking_number: updatedInfo.tracking_number || null,
      vendor_name: updatedInfo.vendor_name || null,
      purchase_order: updatedInfo.purchase_order || null,
      invoice_number: updatedInfo.invoice_number || null,
      warranty_period: updatedInfo.warranty_period || null,
      installation_date: updatedInfo.installation_date || null,
      technician_name: updatedInfo.technician_name || null,
      contact_person: updatedInfo.contact_person || null,
      contact_phone: updatedInfo.contact_phone || null,
      remarks: updatedInfo.remarks || null,
    };

    return { data: transformed, error: null };
  } catch (error) {
    console.error("Error updating dispatch:", error);
    return { data: null, error };
  }
}

/**
 * Upload delivery proof for a dispatch
 * @param {number} dispatchId - Dispatch ID
 * @param {File} file - Proof file
 * @param {Object} schoolData - School data with school_name and project_name
 * @returns {Promise<{data: string|null, error: Error|null}>} Public URL of uploaded file
 */
export async function uploadDispatchDeliveryProof(
  dispatchId,
  file,
  schoolData
) {
  try {
    if (!file) {
      return { data: null, error: new Error("No file provided") };
    }

    if (!schoolData || !schoolData.school_name) {
      return {
        data: null,
        error: new Error("School data is required for file upload"),
      };
    }

    const projectName = schoolData.project_name || "Space Lab";
    const url = await uploadProofImage({
      file,
      projectName,
      schoolName: schoolData.school_name,
    });

    if (!url) {
      return {
        data: null,
        error: new Error("Failed to upload delivery proof"),
      };
    }

    // Fetch current dispatch_info to append to existing proofs (if any)
    const { data: currentDispatch, error: fetchError } = await supabase
      .from("space_lab_dispatches")
      .select("dispatch_info")
      .eq("id", dispatchId)
      .single();

    if (fetchError) {
      console.error("Error fetching current dispatch for proofs:", fetchError);
      return { data: null, error: fetchError };
    }

    const currentInfo = currentDispatch?.dispatch_info || {};
    const existingProofs = Array.isArray(currentInfo.delivery_proof_urls)
      ? currentInfo.delivery_proof_urls
      : currentInfo.delivery_proof_url
      ? [currentInfo.delivery_proof_url]
      : [];

    const updatedProofs = [...existingProofs, url];

    // Update dispatch_info with new proofs array and back-compat single field
    const updateResult = await updateSpaceLabDispatch(dispatchId, {
      delivery_proof_urls: updatedProofs,
      delivery_proof_url: updatedProofs[0] || null,
    });

    if (updateResult.error) {
      return { data: null, error: updateResult.error };
    }

    // Return the fully updated dispatch object
    return { data: updateResult.data, error: null };
  } catch (error) {
    console.error("Error uploading delivery proof:", error);
    return { data: null, error };
  }
}

/**
 * Upload installation proof for a dispatch
 * @param {number} dispatchId - Dispatch ID
 * @param {File} file - Proof file
 * @param {Object} schoolData - School data with school_name and project_name
 * @returns {Promise<{data: string|null, error: Error|null}>} Public URL of uploaded file
 */
export async function uploadDispatchInstallationProof(
  dispatchId,
  file,
  schoolData
) {
  try {
    if (!file) {
      return { data: null, error: new Error("No file provided") };
    }

    if (!schoolData || !schoolData.school_name) {
      return {
        data: null,
        error: new Error("School data is required for file upload"),
      };
    }

    const projectName = schoolData.project_name || "Space Lab";
    const url = await uploadProofImage({
      file,
      projectName,
      schoolName: schoolData.school_name,
    });

    if (!url) {
      return {
        data: null,
        error: new Error("Failed to upload installation proof"),
      };
    }

    // Fetch current dispatch_info to append to existing proofs (if any)
    const { data: currentDispatch, error: fetchError } = await supabase
      .from("space_lab_dispatches")
      .select("dispatch_info")
      .eq("id", dispatchId)
      .single();

    if (fetchError) {
      console.error("Error fetching current dispatch for proofs:", fetchError);
      return { data: null, error: fetchError };
    }

    const currentInfo = currentDispatch?.dispatch_info || {};
    const existingProofs = Array.isArray(currentInfo.installation_proof_urls)
      ? currentInfo.installation_proof_urls
      : currentInfo.installation_proof_url
      ? [currentInfo.installation_proof_url]
      : [];

    const updatedProofs = [...existingProofs, url];

    // Update dispatch_info with new proofs array and back-compat single field
    const updateResult = await updateSpaceLabDispatch(dispatchId, {
      installation_proof_urls: updatedProofs,
      installation_proof_url: updatedProofs[0] || null,
    });

    if (updateResult.error) {
      return { data: null, error: updateResult.error };
    }

    // Return the fully updated dispatch object
    return { data: updateResult.data, error: null };
  } catch (error) {
    console.error("Error uploading installation proof:", error);
    return { data: null, error };
  }
}

export { supabase };
