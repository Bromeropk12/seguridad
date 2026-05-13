"use client";

import { useState, useEffect } from "react";

interface AdminUser {
  id: string;
  username: string;
  role: string;
  password?: string;
}

export default function AdminPanel({
  currentUser,
  mode,
  csrfToken,
}: {
  currentUser: any;
  mode: "seguro" | "vulnerable";
  csrfToken?: string;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url =
        mode === "seguro"
          ? `/api/seguro/admin/users?adminId=${currentUser.id}`
          : `/api/vulnerable/admin/users`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const err = await res.json();
        setError(err.error || "Error al cargar usuarios");
      }
    } catch {
      setError("Error de red");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser, mode]);

  const handleEditClick = (user: AdminUser) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    setEditPassword("");
  };

  const handleUpdate = async (userId: string) => {
    if (!editUsername.trim()) return;
    try {
      const url =
        mode === "seguro"
          ? `/api/seguro/admin/users`
          : `/api/vulnerable/admin/users`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mode === "seguro" && csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const payload = {
        adminId: currentUser.id,
        userId,
        newUsername: editUsername,
        ...(editPassword ? { newPassword: editPassword } : {}),
      };

      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingUserId(null);
        fetchUsers();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch {
      alert("Error de red al actualizar");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("¿Estas seguro de eliminar este usuario por completo?")) return;
    try {
      const url =
        mode === "seguro"
          ? `/api/seguro/admin/users`
          : `/api/vulnerable/admin/users`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mode === "seguro" && csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }

      const res = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ adminId: currentUser.id, userId }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch {
      alert("Error de red al eliminar");
    }
  };

  if (currentUser?.role !== "admin") return null;

  const accentColor = mode === "seguro" ? "text-green-400" : "text-red-400";
  const borderColor = mode === "seguro" ? "border-green-500/30" : "border-red-500/30";
  const btnColor = mode === "seguro" ? "bg-green-500 text-black hover:bg-green-400" : "bg-red-500 text-white hover:bg-red-400";

  return (
    <div className={`mt-6 rounded-lg border ${borderColor} bg-gray-900 p-4`}>
      <h3 className={`text-lg font-bold mb-4 ${accentColor}`}>
        Panel de Administracion ({mode})
      </h3>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {loading && <p className="text-gray-400 text-sm">Cargando usuarios...</p>}
        {!loading && users.map((u) => (
          <div key={u.id} className="rounded border border-gray-700 bg-gray-800 p-3">
            {editingUserId === u.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full rounded bg-gray-900 border border-gray-600 px-2 py-1 text-white text-sm"
                  placeholder="Nuevo username"
                />
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded bg-gray-900 border border-gray-600 px-2 py-1 text-white text-sm"
                  placeholder="Nueva contrasena (dejar vacio para no cambiar)"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdate(u.id)}
                    className={`rounded px-3 py-1 text-xs font-bold ${btnColor}`}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">@{u.username}</p>
                  <span className="text-xs text-gray-500">{u.role}</span>
                </div>
                {u.password && (
                  <p className="text-xs text-red-400 mt-1 font-mono">
                    Clave Expuesta: {u.password}
                  </p>
                )}
                {u.role !== "admin" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
