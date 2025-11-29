"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken, getAuthToken } from "../axios";
import { CircularProgress } from "@mui/material";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    }
  }

  // Load user on first mount
  useEffect(() => {
    async function init() {
      const token = getAuthToken();

      if (!token) {
        setUser(null);
        if (!pathname.startsWith("/auth")) router.push("/auth/login");
        setLoading(false);
        return;
      }

      const u = await fetchUser();

      if (!u && !pathname.startsWith("/auth")) {
        router.push("/auth/login");
      }

      setLoading(false);
    }

    init();
  }, []);

  // Redirect if navigating without auth
  useEffect(() => {
    if (loading) return;

    if (!user && !pathname.startsWith("/auth")) {
      router.push("/auth/login");
      return;
    }

    if (user && pathname.startsWith("/auth")) {
      router.push("/");
      return;
    }
  }, [pathname, user, loading]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
