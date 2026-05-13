"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMode } from "@/components/ModeContext";

export default function CambiarPasswordPage() {
  const { user } = useMode();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Debes iniciar sesión en el modo seguro para cambiar la contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seguro/cambiar-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Error al cambiar la contraseña.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }: { show: boolean }) => (
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
      {show ? (
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
  );

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8 text-green-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Cambiar Contraseña
          </h1>
          <p className="text-gray-400 text-sm">
            Modo Seguro — Esta acción <span className="text-green-400 font-semibold">solo actualiza</span> tu contraseña segura.
            La contraseña del modo vulnerable <span className="text-red-400 font-semibold">no cambiará</span>.
          </p>
        </div>

        {/* Aviso pedagógico */}
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex gap-3">
            <div className="text-green-400 mt-0.5 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-1">Demostración OWASP</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Al cambiar tu contraseña aquí, las tablas <code className="text-green-400 bg-black/30 px-1 rounded">perfiles_seguros</code> y{" "}
                <code className="text-red-400 bg-black/30 px-1 rounded">perfiles_vulnerables</code> tendrán credenciales distintas.
                Intentar cambiar al modo seguro desde el vulnerable requerirá verificación adicional.
              </p>
            </div>
          </div>
        </div>

        {/* No logueado */}
        {!user && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 font-medium mb-3">
              Debes iniciar sesión en el modo seguro primero.
            </p>
            <button
              onClick={() => router.push("/seguro/login")}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Ir al login seguro
            </button>
          </div>
        )}

        {/* Formulario */}
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Tu contraseña actual del modo seguro"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Mostrar/ocultar contraseña actual"
                >
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Mostrar/ocultar nueva contraseña"
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>
            </div>

            {/* Confirmar nueva contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  className={`w-full bg-gray-900/50 border rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-colors ${
                    confirmPassword && newPassword !== confirmPassword
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : confirmPassword && newPassword === confirmPassword
                      ? "border-green-500/50 focus:ring-green-500/50"
                      : "border-gray-700 focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Mostrar/ocultar confirmación de contraseña"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Errores y éxito */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
                <p className="text-green-400 text-sm font-medium">✓ {success}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Desde ahora, cambiar al modo seguro desde el vulnerable requerirá verificación.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Actualizando...
                </span>
              ) : "Actualizar contraseña segura"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/seguro/feed")}
              className="w-full py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Volver al feed seguro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
