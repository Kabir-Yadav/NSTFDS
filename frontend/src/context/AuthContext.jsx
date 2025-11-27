import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getStoredAuthState,
  onSupabaseAuthStateChange,
  signIn,
  signOut,
  syncSupabaseSession,
} from "../services/authService";

const AuthContext = createContext({
  user: null,
  role: null,
  isAuthenticated: false,
  isViewOnly: true,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => getStoredAuthState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const sessionState = await syncSupabaseSession();
        if (!isMounted) return;
        if (sessionState) {
          setAuthState(sessionState);
        } else {
          setAuthState(getStoredAuthState());
        }
      } catch (error) {
        console.error("Failed to initialize auth context", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const subscription = onSupabaseAuthStateChange((state) => {
      if (!isMounted) return;
      setAuthState(state);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const handleLogin = async (email, password) => {
    const nextState = await signIn({ email, password });
    setAuthState(nextState);
    return nextState;
  };

  const handleLogout = async () => {
    await signOut();
    setAuthState(null);
  };

  const value = useMemo(
    () => ({
      user: authState,
      role: authState?.role || null,
      psu: authState?.psu || null,
      org: authState?.org || null,
      isAuthenticated: Boolean(authState),
      isViewOnly: authState?.isViewOnly ?? true,
      loading,
      login: handleLogin,
      logout: handleLogout,
    }),
    [authState, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

