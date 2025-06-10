// useStatsWithStateFilter.js
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { data } from "react-router-dom";

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
    console.log("Hierarchical data fetched successfully:", data);
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
  console.log(data);
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

export async function fetchStateProgress(options = {}) {
  return [];
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDistrictProgressByState(stateName, options = {}) {
  return [];
}

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
  console.log("Fetched table data:", data);
  return data || [];
}

//-----------------------------------------------------------------------------------------------------

export async function isDigitalProcurementActive(schoolName) {
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
}

//-----------------------------------------------------------------------------------------------------

export async function isSanitaryProcurementActive(schoolName) {
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
}
/*
 * =============================
 *      INSERT FUNCTIONS
 * =============================
 */

/**
 * Insert a single delivery record.
 * @param {object} record — must match your project_deliveries columns.
 * @returns {{ data: object, error: object }}
 */
export async function insertProjectDelivery(record) {
  return supabase.from("project_deliveries").insert([record]).single();
}

/**
 * Insert multiple delivery records at once.
 * @param {object[]} records
 * @returns {{ data: object[], error: object }}
 */
export async function insertProjectDeliveries(records) {
  return supabase.from("project_deliveries").insert(records);
}

// ----------------------------------------------------------------------

export async function uploadProofImage({ file, projectName }) {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${projectName}/${fileName}`;
  const bucket = "proofs";

  // Upload
  const { data: uploadData, error: uploadError } = await supabase.storage
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

export async function insertDigitalProcurement(formData) {
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
}

export { supabase };
