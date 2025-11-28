"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken, validate } from "../axios";
import { CircularProgress } from "@mui/material";

interface User {
  id: string;
  email: string;
  name: string;
  // ...
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
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          if (!["/auth/login", "/auth/register"].includes(pathname))
            router.push("/auth/login");
          return;
        }

        
        const validLogin = await validate();
        if(!validLogin)
          router.push("/auth/login");
          
        const res = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch {
        router.push("/auth/login");
        setUser(null);
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  useEffect(() => {
    async function checkAuth() {
      console.log("Auth");
      const token = localStorage.getItem("token");
        if (!token) {
          if (!["/auth/login", "/auth/register"].includes(pathname))
            router.push("/auth/login");
          return;
        }
      const res = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    checkAuth();
  }, [pathname]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
