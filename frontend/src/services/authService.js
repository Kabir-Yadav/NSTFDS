import { supabase } from "../action/supabase_actions";

const AUTH_STORAGE_KEY = "nstfds-auth-state";

// export const DUMMY_ACCOUNTS = [
//     {
//         email: "admin@example.com",
//         password: "admin123",
//         role: "admin",
//         label: "Admin",
//         isViewOnly: false,
//     },
//     {
//         email: "user@example.com",
//         password: "user123",
//         role: "user",
//         label: "Standard User",
//         isViewOnly: true,
//     },
//     {
//         email: "viewer.bpcl@nstfdc.com",
//         password: "bpcl123",
//         psu: "BPCL",
//         role: "psu_viewer",
//         label: "BPCL PSU Viewer",
//         isViewOnly: true,
//     },
//     {
//         email: "viewer.iocl@nstfdc.com",
//         password: "iocl123",
//         psu: "IOCL",
//         role: "psu_viewer",
//         label: "IOCL PSU Viewer",
//         isViewOnly: true,
//     },
//     {
//         email: "viewer.hpcl@nstfdc.com",
//         password: "hpcl123",
//         psu: "HPCL",
//         role: "psu_viewer",
//         label: "HPCL PSU Viewer",
//         isViewOnly: true,
//     },
// ];

// export const DUMMY_PSU_USERS = DUMMY_ACCOUNTS.filter(
//     (account) => account.role === "psu_viewer"
// );

// export const DUMMY_ADMIN_USERS = DUMMY_ACCOUNTS.filter(
//     (account) => account.role === "admin"
// );

// export const DUMMY_STANDARD_USERS = DUMMY_ACCOUNTS.filter(
//     (account) => account.role === "user"
// );

const persistAuthState = (payload) => {
    if (!payload) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userPsu");
        localStorage.removeItem("isAuthenticated");
        return;
    }

    const normalized = {
        ...payload,
        timestamp: Date.now(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", normalized.role);

    if (normalized.psu) {
        localStorage.setItem("userPsu", normalized.psu);
    } else {
        localStorage.removeItem("userPsu");
    }
};

export const getStoredAuthState = () => {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.error("Failed to parse auth state", error);
        return null;
    }
};

const mapSupabaseUserToAuthState = (user, session) => {
    if (!user) return null;

    const appMetadata = user.app_metadata || {};
    const userMetadata = user.user_metadata || {};

    const role =
        appMetadata.role || userMetadata.role || userMetadata.access_role || "user";
    const psu = appMetadata.psu || userMetadata.psu || userMetadata.psu_name || null;
    // const accessLevel =
    //     appMetadata.access_level || userMetadata.access_level || null;
    const viewOnlyFlag = appMetadata.is_view_only ?? userMetadata.is_view_only;
    const org = appMetadata.org ?? userMetadata.org ?? null;

    const normalizedRole = role === "psu_user" ? "psu_viewer" : role;
    const isViewOnly =
        typeof viewOnlyFlag === "boolean"
            ? viewOnlyFlag
            : normalizedRole !== "admin";

    return {
        provider: "supabase",
        email: user.email,
        userId: user.id,
        org: org || null,
        role: normalizedRole,
        psu: psu || null,
        isViewOnly,
        accessToken: session?.access_token || null,
        refreshToken: session?.refresh_token || null,
    };
};

export const signIn = async ({ email, password }) => {
    // const dummyAccount = DUMMY_ACCOUNTS.find(
    //     (account) => account.email === email && account.password === password
    // );

    // if (dummyAccount) {
    //     const authState = {
    //         provider: "dummy",
    //         email: dummyAccount.email,
    //         role: dummyAccount.role,
    //         psu: dummyAccount.psu,
    //         isViewOnly:
    //             dummyAccount.isViewOnly ?? (dummyAccount.role && dummyAccount.role !== "admin"),
    //     };

    //     persistAuthState(authState);
    //     return authState;
    // }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message || "Unable to sign in with Supabase");
    }

    const { user, session } = data;
    console.log("user", user);
    const authState = mapSupabaseUserToAuthState(user, session);

    persistAuthState(authState);
    return authState;
};

export const signOut = async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.warn("Supabase sign-out warning", error);
    } finally {
        persistAuthState(null);
    }
};

export const syncSupabaseSession = async () => {
    const storedState = getStoredAuthState();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Failed to get Supabase session", error);
        return storedState;
    }

    const session = data?.session;
    if (!session) {
        if (storedState?.provider === "dummy") {
            return storedState;
        }

        persistAuthState(null);
        return null;
    }

    const authState = mapSupabaseUserToAuthState(session.user, session);
    persistAuthState(authState);
    return authState;
};

export const onSupabaseAuthStateChange = (callback) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session || event === "SIGNED_OUT") {
            persistAuthState(null);
            callback(null);
            return;
        }

        const authState = mapSupabaseUserToAuthState(session.user, session);
        persistAuthState(authState);
        callback(authState);
    });

    return data.subscription;
};

export const getIsAuthenticated = () => Boolean(getStoredAuthState());

