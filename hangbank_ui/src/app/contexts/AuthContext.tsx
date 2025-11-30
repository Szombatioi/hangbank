"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken, getAuthToken, removeAuthToken } from "../axios"; // Feltételezem, van removeAuthToken is
import { CircularProgress } from "@mui/material";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>; // Új funkció
  logout: () => void; // Új funkció
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Ezt kiszervezzük, hogy bárhonnan hívható legyen
  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(null);
      // Ha 401-et kapunk backend újraindítás után, törölni kell a rossz tokent
      removeAuthToken(); 
      return null;
    }
  };

  // 1. Initial Load
  useEffect(() => {
    async function init() {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Beállítjuk a tokent, ha van
      setAuthToken(token);
      
      // Megpróbáljuk lekérni a usert
      await fetchUser();
      
      setLoading(false);
    }

    init();
  }, []); // Csak egyszer fut le mount-kor

  // 2. Route Protection (Külön useEffect, hogy ne keveredjen az init-tel)
  useEffect(() => {
    if (loading) return;

    const isAuthGroup = pathname.startsWith("/auth");

    if (!user && !isAuthGroup) {
      router.push("/auth/login");
    } else if (user && isAuthGroup) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);


  // Login funkció: Beállítja a tokent, lekéri a usert, majd navigál
  const login = async (token: string) => {
    setLoading(true); // UX: Loading állapotba tesszük, amíg validálunk
    setAuthToken(token);
    const u = await fetchUser();
    
    if (u) {
      router.replace("/");
    } else {
       // Ha a token érvényes formátumú, de a user lekérés fal, hiba van
       setLoading(false); 
    }
    // A loading false-t a fetchUser vagy az useEffect fogja kezelni, 
    // de itt is beállíthatjuk a biztonság kedvéért, ha nem sikerült a fetch
    if(!u) setLoading(false);
    window.location.reload();
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    router.push("/auth/login");
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </div>
    );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);