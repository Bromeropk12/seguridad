"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMode } from "./ModeContext";

export function Navigation() {
  const { mode, user, logout } = useMode();
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = () => {
    const newMode = mode === "vulnerable" ? "seguro" : "vulnerable";
    router.push(newMode === "vulnerable" ? "/vulnerable/login" : "/seguro/login");
  };

  const isVulnerable = pathname?.startsWith("/vulnerable");
  const isLoggedIn = !!user;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        isVulnerable 
          ? "border-red-500/20 bg-red-950/50" 
          : "border-green-500/20 bg-green-950/50"
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-2xl font-bold tracking-tight ${
              isVulnerable ? "text-red-400" : "text-green-400"
            }`}
            aria-label="Cyber-Lab - Ir al inicio"
          >
            Cyber-Lab
          </Link>
          <span className="hidden sm:inline-block rounded-full bg-gray-800/80 px-3 py-1 text-xs text-gray-400">
            Mini-Twitter Educativo
          </span>
        </div>

        <nav className="flex items-center gap-4" role="navigation" aria-label="Navegacion principal">
          {isLoggedIn && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 hidden sm:inline">
                <span className="sr-only">Usuario:</span>@{user.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
                aria-label={`Cerrar sesion de ${user.username}`}
              >
                Cerrar
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                mode === "vulnerable" ? "text-red-400" : "text-green-400"
              }`}
              aria-live="polite"
            >
              {mode === "vulnerable" ? "VULNERABLE" : "SEGURO"}
            </span>
            
            <button
              onClick={handleToggle}
              className={`relative h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isVulnerable 
                  ? "focus:ring-red-500 bg-red-500/20" 
                  : "focus:ring-green-500 bg-green-500/20"
              }`}
              aria-label={`Cambiar a modo ${mode === "vulnerable" ? "seguro" : "vulnerable"}`}
              role="switch"
              aria-checked={mode === "seguro"}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full transition-all shadow-md ${
                  mode === "vulnerable" 
                    ? "left-1 bg-red-500" 
                    : "left-7 bg-green-500"
                }`}
              />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}