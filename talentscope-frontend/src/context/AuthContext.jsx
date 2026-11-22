import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginRequest, logoutRequest, refreshRequest } from "../api/auth.api";
import { clearSession, STORAGE_KEYS } from "../api/client";
import { decodeJwt } from "../utils/jwt";

const AuthContext = createContext(null);
const ALLOWED_ROLES = ["ADMIN", "RH", "ENCADRANT", "STAGIAIRE"];

function normalizeRole(role) {
  return ALLOWED_ROLES.includes(role) ? role : null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const saveSession = useCallback((auth) => {
    const responseRole = normalizeRole(auth.role);
    const jwtRole = normalizeRole(decodeJwt(auth.token)?.role);
    const role = responseRole || jwtRole;
    if (!auth.token || !role) {
      throw new Error("Réponse d’authentification invalide.");
    }

    if (responseRole && jwtRole && responseRole !== jwtRole) {
      throw new Error("Incohérence détectée dans les informations de rôle.");
    }

    localStorage.setItem(STORAGE_KEYS.accessToken, auth.token);
    localStorage.setItem(STORAGE_KEYS.refreshToken, auth.refreshToken || "");
    localStorage.setItem(STORAGE_KEYS.email, auth.email || "");
    localStorage.setItem(STORAGE_KEYS.role, role);

    setSession({
      accessToken: auth.token,
      refreshToken: auth.refreshToken || "",
      email: auth.email || "",
      role,
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
      const email = localStorage.getItem(STORAGE_KEYS.email);
      const role = normalizeRole(localStorage.getItem(STORAGE_KEYS.role));

      if (!accessToken || !refreshToken || !email || !role) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const refreshed = await refreshRequest(refreshToken);
        if (active) saveSession(refreshed);
      } catch {
        clearSession();
        if (active) setSession(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restoreSession();

    function handleExpired() {
      setSession(null);
      setIsLoading(false);
    }

    window.addEventListener("talentscope:session-expired", handleExpired);
    return () => {
      active = false;
      window.removeEventListener("talentscope:session-expired", handleExpired);
    };
  }, [saveSession]);

  const login = useCallback(
    async (email, password) => {
      setAuthError(null);
      const auth = await loginRequest(email, password);
      saveSession(auth);
      return auth;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    const refreshToken =
      session?.refreshToken || localStorage.getItem(STORAGE_KEYS.refreshToken);

    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } finally {
      clearSession();
      setSession(null);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      role: session?.role || null,
      email: session?.email || null,
      isLoading,
      authError,
      setAuthError,
      login,
      logout,
    }),
    [session, isLoading, authError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return context;
}
