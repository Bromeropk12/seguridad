"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMode } from "./ModeContext";

export function Navigation() {
  const { mode, user, logout } = useMode();
  const pathname = usePathname();
  const router = useRouter();

  // Estado del modal de verificación
  const [showModal, setShowModal] = useState(false);
  const [modalPassword, setModalPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  const isVulnerable = pathname?.startsWith("/vulnerable");
  const isLoggedIn = !!user;

  const handleToggle = async () => {
    const newMode = mode === "vulnerable" ? "seguro" : "vulnerable";

    // Si cambia de vulnerable → seguro y hay un usuario, verificar si requiere reauth
    if (newMode === "seguro" && user) {
      try {
        const res = await fetch(
          `/api/seguro/check-mode-access?userId=${user.id}`
        );
        const data = await res.json();

        if (data.requiresReauth) {
          // Mostrar modal de verificación
          setShowModal(true);
          setModalPassword("");
          setModalError("");
          return;
        }
      } catch {
        // Si falla la verificación, permitir paso (fail-open para demo)
      }
      router.push(user ? "/seguro/feed" : "/seguro/login");
      return;
    }

    // Cambio a vulnerable: siempre directo
    router.push(newMode === "vulnerable" ? "/vulnerable/login" : "/seguro/login");
  };

  const handleModalConfirm = async () => {
    if (!modalPassword || !user) return;
    setModalLoading(true);
    setModalError("");

    try {
      const res = await fetch("/api/seguro/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, password: modalPassword }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setShowModal(false);
        setModalPassword("");
        router.push("/seguro/feed");
      } else {
        setModalError(data.error || "Contraseña incorrecta. Inténtalo de nuevo.");
      }
    } catch {
      setModalError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setModalPassword("");
    setModalError("");
  };

  return (
    <>
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

          <nav
            className="flex items-center gap-4"
            role="navigation"
            aria-label="Navegacion principal"
          >
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
                aria-label={`Cambiar a modo ${
                  mode === "vulnerable" ? "seguro" : "vulnerable"
                }`}
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

      {/* ===== MODAL DE VERIFICACIÓN ===== */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleModalCancel}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md rounded-2xl border border-green-500/30 bg-gray-900 shadow-2xl shadow-green-900/20 p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Ícono */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-7 h-7 text-green-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h2
              id="modal-title"
              className="text-xl font-bold text-white text-center mb-2"
            >
              Verificación Requerida
            </h2>

            {/* Mensaje */}
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 mb-5">
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-wide mb-1">
                🔐 Contraseña segura modificada
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Se detectó que cambiaste tu contraseña en el{" "}
                <span className="text-green-400 font-semibold">modo seguro</span>.
                Para acceder debes ingresar tu contraseña segura actualizada.
              </p>
            </div>

            {/* Input */}
            <div className="relative mb-4">
              <label
                htmlFor="modal-password"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Contraseña del modo seguro
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  type={showModalPassword ? "text" : "password"}
                  value={modalPassword}
                  onChange={(e) => {
                    setModalPassword(e.target.value);
                    setModalError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleModalConfirm()}
                  autoFocus
                  placeholder="Ingresa tu contraseña segura"
                  className="w-full bg-gray-800/60 border border-gray-600 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    {showModalPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            {modalError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 mb-4">
                <p className="text-red-400 text-sm">{modalError}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleModalCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleModalConfirm}
                disabled={modalLoading || !modalPassword}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                {modalLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  "Verificar y acceder"
                )}
              </button>
            </div>

            {/* Link a login completo */}
            <p className="text-center text-xs text-gray-500 mt-4">
              ¿No recuerdas tu contraseña segura?{" "}
              <button
                onClick={() => {
                  handleModalCancel();
                  router.push("/seguro/login");
                }}
                className="text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
              >
                Ir al login seguro
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}