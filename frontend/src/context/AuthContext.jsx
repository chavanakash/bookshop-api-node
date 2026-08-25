import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api.js";

const AuthContext = createContext(null);

function readStored(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStored("booknook-token"));
  const [user, setUser] = useState(() => readStored("booknook-user"));

  useEffect(() => {
    if (token) window.localStorage.setItem("booknook-token", JSON.stringify(token));
    else window.localStorage.removeItem("booknook-token");
  }, [token]);

  useEffect(() => {
    if (user) window.localStorage.setItem("booknook-user", JSON.stringify(user));
    else window.localStorage.removeItem("booknook-user");
  }, [user]);

  async function signup(data) {
    const result = await authApi.signup(data);
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  async function login(data) {
    const result = await authApi.login(data);
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: Boolean(token), signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
