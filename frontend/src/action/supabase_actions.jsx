// useStatsWithStateFilter.js
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
    activeProjects: 0,
  });

  const fetchStates = async () => {
    const { data, error } = await supabase.from("states").select("state_name");
    if (!error) setStatesList(data.map((s) => s.state_name));
  };

  const fetchStats = async (stateName = null) => {
    setLoading(true);
    try {
      // States count
      const stateRes = stateName
        ? await supabase
            .from("states")
            .select("state_id")
            .eq("state_name", stateName)
        : await supabase
            .from("states")
            .select("state_id", { count: "exact", head: true });
      const stateId =
        Array.isArray(stateRes.data) && stateRes.data.length
          ? stateRes.data[0].state_id
          : null;
      const totalStates = stateName ? 1 : stateRes.count || 0;

      // Districts count
      let districtQuery = supabase
        .from("districts")
        .select("*", { count: "exact", head: true });
      if (stateId) districtQuery = districtQuery.eq("state_id", stateId);
      const { count: totalDistricts = 0 } = await districtQuery;

      // Schools count
      let schoolQuery = supabase
        .from("schools")
        .select("*", { count: "exact", head: true });
      if (stateId) {
        const { data: districts = [] } = await supabase
          .from("districts")
          .select("district_id")
          .eq("state_id", stateId);
        const districtIds = districts.map((d) => d.district_id);
        schoolQuery = schoolQuery.in("district_id", districtIds);
      }
      const { count: totalSchools = 0 } = await schoolQuery;

      // Active Projects
      let moduleQuery = supabase
        .from("state_modules")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      if (stateId) moduleQuery = moduleQuery.eq("state_id", stateId);
      const { count: activeProjects = 0 } = await moduleQuery;

      setStats({ totalStates, totalDistricts, totalSchools, activeProjects });
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
  const { data, error } = await supabase.rpc(
    "get_state_district_school_hierarchy"
  );
  if (error) {
    console.error("Error fetching hierarchical data:", error);
    return null;
  }
  // data is an array with a single JSON result
  return data;
}

// --------------------------------------------------------------------------------------------------------

export async function fetchBudgetUtilization(stateName = null) {
  // 1. Fetch states with allocated_budget.
  let stateQuery = supabase
    .from("states")
    .select("state_id, state_name, allocated_budget");
  if (stateName) {
    stateQuery = stateQuery.eq("state_name", stateName);
  }
  const { data: states, error: stateError } = await stateQuery;
  if (stateError) {
    console.error("Error fetching states:", stateError);
    return [];
  }

  if (stateName) {
    // Process for a specific state (array with one object)
    const state = states[0];
    let totalAllocated = state.allocated_budget;
    let totalSpent = 0;

    // Digital procurement
    let digitalQuery = supabase
      .from("digital_device_procurement")
      .select("cost")
      .eq("state_name", stateName);
    const { data: digitalData, error: digitalError } = await digitalQuery;
    if (digitalError) {
      console.error("Error fetching digital procurement data:", digitalError);
      return [];
    }
    digitalData.forEach((record) => {
      if (record.cost) {
        totalSpent += Number(record.cost);
      }
    });

    // Sanitary procurement
    let sanitaryQuery = supabase
      .from("sanitary_pad_procurement")
      .select("cost")
      .eq("state_name", stateName);
    const { data: sanitaryData, error: sanitaryError } = await sanitaryQuery;
    if (sanitaryError) {
      console.error("Error fetching sanitary procurement data:", sanitaryError);
      return [];
    }
    sanitaryData.forEach((record) => {
      if (record.cost) {
        totalSpent += Number(record.cost);
      }
    });

    const utilization =
      totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    return [
      {
        state_name: state.state_name,
        allocated_budget: totalAllocated,
        total_spent: totalSpent,
        budget_utilization_percent: utilization.toFixed(2),
      },
    ];
  } else {
    // Overall (all states): sum allocated budgets & total spent
    let totalAllocated = 0;
    let totalSpent = 0;
    states.forEach((st) => {
      totalAllocated += Number(st.allocated_budget);
    });

    // Digital procurement overall
    let digitalQuery = supabase
      .from("digital_device_procurement")
      .select("cost");
    const { data: digitalData, error: digitalError } = await digitalQuery;
    if (digitalError) {
      console.error("Error fetching digital procurement data:", digitalError);
      return [];
    }
    digitalData.forEach((record) => {
      if (record.cost) {
        totalSpent += Number(record.cost);
      }
    });

    // Sanitary procurement overall
    let sanitaryQuery = supabase
      .from("sanitary_pad_procurement")
      .select("cost");
    const { data: sanitaryData, error: sanitaryError } = await sanitaryQuery;
    if (sanitaryError) {
      console.error("Error fetching sanitary procurement data:", sanitaryError);
      return [];
    }
    sanitaryData.forEach((record) => {
      if (record.cost) {
        totalSpent += Number(record.cost);
      }
    });

    const utilization =
      totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    return [
      {
        state_name: "Overall",
        allocated_budget: totalAllocated,
        total_spent: totalSpent,
        budget_utilization_percent: utilization.toFixed(2),
      },
    ];
  }
}

// --------------------------------------------------------------------------------------------------------

export async function fetchDigitalDeviceProcurementRate(stateName = null) {
  // 1. Fetch states (with or without filter)
  let stateQuery = supabase.from("states").select("state_id, state_name");
  if (stateName) {
    stateQuery = stateQuery.eq("state_name", stateName);
  }
  const { data: states, error: stateError } = await stateQuery;
  if (stateError) {
    console.error("Error fetching states:", stateError);
    return [];
  }

  // 2. Fetch schools with district information (we also need school_name)
  const { data: schools, error: schoolError } = await supabase.from("schools")
    .select(`
      school_id,
      school_name,
      district:district_id ( state_id )
    `);
  if (schoolError) {
    console.error("Error fetching schools:", schoolError);
    return [];
  }

  // 3. Fetch digital procurement records (use school_name for matching)
  let digitalQuery = supabase
    .from("digital_device_procurement")
    .select("school_name, state_name");
  if (stateName) {
    digitalQuery = digitalQuery.eq("state_name", stateName);
  }
  const { data: digitalData, error: digitalError } = await digitalQuery;
  if (digitalError) {
    console.error(
      "Error fetching digital device procurement records:",
      digitalError
    );
    return [];
  }

  // Build a set of school names that have digital submissions.
  const digitalSchools = new Set((digitalData || []).map((r) => r.school_name));

  if (stateName) {
    // For a given state, aggregate only that state's data.
    let total = 0,
      completed = 0;
    schools.forEach((school) => {
      // Check if this school's district belongs to the provided state
      if (
        school.district.state_id &&
        states[0] &&
        school.district.state_id === states[0].state_id
      ) {
        total++;
        if (digitalSchools.has(school.school_name)) {
          completed++;
        }
      }
    });
    const rate = total > 0 ? (completed / total) * 100 : 0;
    return [
      {
        state: states[0].state_name,
        total_schools: total,
        completed_schools: completed,
        digital_completion_rate: rate.toFixed(2),
      },
    ];
  } else {
    // Overall: aggregate across all states.
    let overallTotal = 0,
      overallCompleted = 0;
    schools.forEach((school) => {
      overallTotal++;
      if (digitalSchools.has(school.school_name)) {
        overallCompleted++;
      }
    });
    const overallRate =
      overallTotal > 0 ? (overallCompleted / overallTotal) * 100 : 0;
    return [
      {
        state: "Overall",
        total_schools: overallTotal,
        completed_schools: overallCompleted,
        digital_completion_rate: overallRate.toFixed(2),
      },
    ];
  }
}

//-----------------------------------------------------------------------------------------------------

export async function fetchSchoolImplementationRate(stateName = null) {
  // 1. Fetch states (optionally filtered)
  let stateQuery = supabase.from("states").select("state_id, state_name");
  if (stateName) {
    stateQuery = stateQuery.eq("state_name", stateName);
  }
  const { data: states, error: stateError } = await stateQuery;
  if (stateError) {
    console.error("Error fetching states:", stateError);
    return [];
  }

  // 2. Fetch schools with district info (also include school_name)
  const { data: schools, error: schoolError } = await supabase.from("schools")
    .select(`
      school_id,
      school_name,
      district:district_id ( state_id )
    `);
  if (schoolError) {
    console.error("Error fetching schools:", schoolError);
    return [];
  }

  // 3. Fetch digital & sanitary procurement records (using school_name)
  let { data: digitalData } = await supabase
    .from("digital_device_procurement")
    .select("school_name");
  let { data: sanitaryData } = await supabase
    .from("sanitary_pad_procurement")
    .select("school_name");

  // Build sets from procurement records.
  const digitalSet = new Set((digitalData || []).map((r) => r.school_name));
  const sanitarySet = new Set((sanitaryData || []).map((r) => r.school_name));

  if (stateName) {
    // Calculate for a specific state.
    let total = 0,
      implemented = 0;
    schools.forEach((school) => {
      if (
        school.district.state_id &&
        states[0] &&
        school.district.state_id === states[0].state_id
      ) {
        total++;
        if (
          digitalSet.has(school.school_name) ||
          sanitarySet.has(school.school_name)
        ) {
          implemented++;
        }
      }
    });
    const rate = total > 0 ? (implemented / total) * 100 : 0;
    return [
      {
        state: states[0].state_name,
        total_schools: total,
        implemented_schools: implemented,
        implementation_rate: rate.toFixed(2),
      },
    ];
  } else {
    // Overall: aggregate for all schools.
    let overallTotal = 0,
      overallImplemented = 0;
    schools.forEach((school) => {
      overallTotal++;
      if (
        digitalSet.has(school.school_name) ||
        sanitarySet.has(school.school_name)
      ) {
        overallImplemented++;
      }
    });
    const overallRate =
      overallTotal > 0 ? (overallImplemented / overallTotal) * 100 : 0;
    return [
      {
        state: "Overall",
        total_schools: overallTotal,
        implemented_schools: overallImplemented,
        implementation_rate: overallRate.toFixed(2),
      },
    ];
  }
}

//-----------------------------------------------------------------------------------------------------

export async function fetchStateProgress(options = {}) {
  if (options.onLoadingStart) options.onLoadingStart();
  try {
    // 1. Get all states (state_id & state_name)
    const { data: states, error: statesError } = await supabase
      .from("states")
      .select("state_id, state_name");
    if (statesError) throw statesError;

    // 2. For each state, calculate the progress.
    const stateProgress = await Promise.all(
      states.map(async (state) => {
        // 2a. Get all district IDs for the state
        const { data: stateDistricts, error: districtsError } = await supabase
          .from("districts")
          .select("district_id")
          .eq("state_id", state.state_id);
        if (districtsError) throw districtsError;
        const districtIds = stateDistricts.map((d) => d.district_id);

        // 2b. Count total schools within these districts
        const { count: totalSchools, error: schoolCountError } = await supabase
          .from("schools")
          .select("*", { count: "exact", head: true })
          .in("district_id", districtIds);
        if (schoolCountError) throw schoolCountError;

        // 2c. Count completed schools (based on digital_device_procurement) for this state.
        // We assume a record in digital_device_procurement indicates a completed school.
        const { count: completedSchools, error: completedError } =
          await supabase
            .from("digital_device_procurement")
            .select("*", { count: "exact", head: true })
            .eq("state_name", state.state_name);
        if (completedError) throw completedError;

        // 2d. Calculate progress percentage
        let progress = 0;
        if (totalSchools > 0) {
          progress = Number(
            ((completedSchools / totalSchools) * 100).toFixed(2)
          );
        }
        return {
          state: state.state_name,
          progress,
        };
      })
    );
    return stateProgress;
  } catch (error) {
    console.error("Error fetching state progress:", error);
    return [];
  } finally {
    if (options.onLoadingEnd) options.onLoadingEnd();
  }
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDistrictProgressByState(stateName, options = {}) {
  if (options.onLoadingStart) options.onLoadingStart();
  try {
    // 1. Get the state_id based on state name
    const { data: stateData, error: stateError } = await supabase
      .from("states")
      .select("state_id")
      .eq("state_name", stateName)
      .single();
    if (stateError) throw stateError;
    const stateId = stateData.state_id;

    // 2. Get all districts for that state
    const { data: districts, error: districtError } = await supabase
      .from("districts")
      .select("district_id, district_name")
      .eq("state_id", stateId);
    if (districtError) throw districtError;

    // 3. For each district, count schools and completed schools in parallel.
    const districtProgress = await Promise.all(
      districts.map(async (district) => {
        const { district_id, district_name } = district;

        // Count total schools in this district.
        const { count: totalSchools, error: schoolCountError } = await supabase
          .from("schools")
          .select("*", { count: "exact", head: true })
          .eq("district_id", district_id);
        if (schoolCountError) throw schoolCountError;

        // Count distinct completed schools in this district from digital_device_procurement.
        // We assume a school is complete if it has at least one record.
        // Since the digital_device_procurement table stores school_name and district_name,
        // we filter by both.
        const { count: completedCount, error: completedCountError } =
          await supabase
            .from("digital_device_procurement")
            .select("*", { count: "exact", head: true })
            .eq("district_name", district_name)
            .eq("state_name", stateName);
        if (completedCountError) throw completedCountError;

        let progress = 0;
        if (totalSchools > 0) {
          progress = Number(((completedCount / totalSchools) * 100).toFixed(2));
        }
        return {
          district: district_name,
          total_schools: totalSchools,
          completed_schools: completedCount,
          progress, // completion percentage of this district
        };
      })
    );

    return districtProgress;
  } catch (error) {
    console.error("Error fetching district progress by state:", error);
    return [];
  } finally {
    if (options.onLoadingEnd) options.onLoadingEnd();
  }
}

//-----------------------------------------------------------------------------------------------------

export async function fetchDeviceProcurements(filters = {}) {
  let query = supabase.from("digital_device_procurement").select("*");

  // Apply filter for state name if provided.
  if (filters.stateName) {
    query = query.eq("state_name", filters.stateName);
  }
  if (filters.districtName) {
    query = query.eq("district_name", filters.districtName);
  }
  if (filters.schoolName) {
    query = query.eq("school_name", filters.schoolName);
  }
  // For category, we assume that the category matches the item_name.
  if (filters.category) {
    query = query.eq("item_name", filters.category);
  }
  // Filter by date range if provided; assuming the column is named 'date' (or 'delivery_date')
  if (filters.startDate) {
    query = query.gte("delivery_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("delivery_date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching device procurements:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function fetchSanitaryProcurements(filters = {}) {
  let query = supabase.from("sanitary_pad_procurement").select("*");

  // Apply filter for state name if provided.
  if (filters.stateName) {
    query = query.eq("state_name", filters.stateName);
  }
  if (filters.districtName) {
    query = query.eq("district_name", filters.districtName);
  }
  if (filters.schoolName) {
    query = query.eq("school_name", filters.schoolName);
  }
  // Filter by date range if provided; assuming the column is named 'date' (or 'delivery_date')
  if (filters.startDate) {
    query = query.gte("delivery_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("delivery_date", filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching device procurements:", error);
    return [];
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------

export async function isDigitalProcurementActive(schoolName) {
  console.log(schoolName)
  const { data, error } = await supabase
    .from('schools')
    .select('digital_device_procurement_active')
    .match({
      school_name: schoolName
    })
    .single();

  if (error) {
    console.error('Failed to fetch procurement status:', error);
    return false;
  }

  return data?.digital_device_procurement_active === true;
}

//-----------------------------------------------------------------------------------------------------

export async function isSanitaryProcurementActive(schoolName) {
  console.log(schoolName)
  const { data, error } = await supabase
    .from('schools')
    .select('sanitary_pad_procurement_active')
    .match({
      school_name: schoolName
    })
    .single();

  if (error) {
    console.error('Failed to fetch procurement status:', error);
    return false;
  }

  return data?.sanitary_pad_procurement_active === true;
}
/*
 * =============================
 *      INSERT FUNCTIONS
 * =============================
 */

export async function insertSanitaryProcurement(formData) {
  const { state_name, district_name, school_name } = formData;
  // Insert a record directly with provided names.
  const { error } = await supabase.from("sanitary_pad_procurement").insert({
    state_name,
    district_name,
    school_name,
    cost: formData.cost,
    status: formData.status,
    delivery_date: formData.delivery_date,
    proof_image_url: formData.proof_image_url,
  });
  if (error) {
    console.error("Error inserting sanitary procurement record:", error);
    return { success: false, error };
  }
  return { success: true };
}


export async function uploadProofImage(file, device = false, sanitary = false) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const fileheader = device
    ? "device_proofs"
    : sanitary
    ? "sanitary_proofs"
    : "proofs";
  const bucketName = device
    ? "digital-device-procurement-images"
    : sanitary
    ? "sanitary-pads-procurement"
    : "";
  const filePath = `${fileheader}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName) // replace with your actual bucket name
    .upload(filePath, file);

  if (error) {
    console.error("Image upload failed:", error.message);
    return null;
  }

  // Get public URL
  const { data: publicURLData } = supabase.storage
    .from(bucketName) // same bucket name
    .getPublicUrl(filePath);

  return publicURLData?.publicUrl || null;
}

export async function insertDigitalProcurement(formData) {
  const { state_name, district_name, school_name } = formData;
  const { error } = await supabase.from("digital_device_procurement").insert({
    state_name,
    district_name,
    school_name,
    item_name: formData.item_name,
    cost: formData.cost,
    status: formData.status,
    delivery_date: formData.delivery_date,
    proof_image_url: formData.proof_image_url,
  });
  if (error) {
    console.error("Error inserting digital procurement record:", error);
    return { success: false, error };
  }
  return { success: true };
}

export { supabase };
