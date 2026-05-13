"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Mode = "vulnerable" | "seguro";

interface UserData {
  username: string;
  role: string;
  id: string; // UUID compartido entre perfiles_seguros y perfiles_vulnerables
}

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("vulnerable");
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sesión unificada: el mismo usuario funciona en ambos modos
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    const isVulnerable = pathname?.startsWith("/vulnerable");
    setMode(isVulnerable ? "vulnerable" : "seguro");
  }, [pathname]);

  const toggleMode = () => {
    const newMode = mode === "vulnerable" ? "seguro" : "vulnerable";
    setMode(newMode);
    // Cambiar de modo NO cierra sesión: el usuario sigue logueado
    if (newMode === "vulnerable") {
      router.push(user ? "/vulnerable/feed" : "/vulnerable/login");
    } else {
      router.push(user ? "/seguro/feed" : "/seguro/login");
    }
  };

  const logout = () => {
    // Limpiar todas las variantes por compatibilidad
    localStorage.removeItem("user");
    localStorage.removeItem("user_seguro");
    localStorage.removeItem("user_vulnerable");
    localStorage.removeItem("auth_token");
    setUser(null);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode, user, setUser, logout }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}