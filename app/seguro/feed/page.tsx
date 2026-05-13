"use client";

import { useState, FormEvent, useEffect } from "react";
import { useMode } from "@/components/ModeContext";
import AdminPanel from "@/components/AdminPanel";

interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

interface ConnectedUser {
  user_id: string;
  username: string;
  last_activity: string;
  modo: string;
}

export default function SeguroFeed() {
  const { user, logout } = useMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  const sendHeartbeat = async (currentUser: typeof user) => {
    if (!currentUser?.id) return;
    try {
      await fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          modo: "seguro",
        }),
      });
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    fetchConnectedUsers();
    sendHeartbeat(user);

    fetch("/api/seguro/csrf")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken))
      .catch(() => {});

    const heartbeatInterval = setInterval(() => sendHeartbeat(user), 10000);
    const usersInterval = setInterval(fetchConnectedUsers, 10000);
    const messagesInterval = setInterval(fetchMessages, 3000); // Polling de mensajes cada 3s

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(usersInterval);
      clearInterval(messagesInterval);
      if (user?.id) {
        fetch("/api/heartbeat", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, modo: "seguro" }),
        }).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/seguro/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch { /* ignore */ }
  };

  const fetchConnectedUsers = async () => {
    try {
      const res = await fetch("/api/connected-users");
      if (res.ok) {
        const data = await res.json();
        setConnectedUsers(data.all || []);
      }
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    setLoading(true);

    try {
      const res = await fetch("/api/seguro/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          content: newMessage,
          mode: "seguro",
          authorId: user.id
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {user && (
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-xl font-bold text-black">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">@{user.username}</p>
                    <p className="text-sm text-green-400/80">Sesion segura activa</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-full transition-colors"
                >
                  Cerrar Sesion
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-green-400 font-medium">Protegido</span>
              <span className="text-xs text-gray-500">Contenido sanitizado en servidor</span>
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Que estas pensando?"
              className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none focus:outline-none min-h-[100px]"
              aria-label="Publicar mensaje"
            />
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <div className="flex items-center gap-2 text-gray-500">
                <button type="button" className="p-2 hover:bg-gray-800 rounded-full transition-colors" aria-label="Agregar imagen">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button type="button" className="p-2 hover:bg-gray-800 rounded-full transition-colors" aria-label="Agregar emoji">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="px-6 py-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 disabled:cursor-not-allowed text-black font-semibold rounded-full transition-all hover:shadow-lg hover:shadow-green-500/20"
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold flex-shrink-0">
                    {msg.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">@{msg.username}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(msg.created_at).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-white whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No hay mensajes aun</p>
                <p className="text-sm mt-1">Se el primero en publicar algo!</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold text-white mb-4">En linea</h3>
            <div className="space-y-3">
              {connectedUsers.slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${u.modo === 'seguro' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                  <span className="text-gray-300 text-sm">@{u.username}</span>
                </div>
              ))}
              {connectedUsers.length === 0 && (
                <p className="text-gray-500 text-sm">No hay usuarios conectados</p>
              )}
            </div>
          </div>

          <AdminPanel currentUser={user} mode="seguro" csrfToken={csrfToken} />
        </aside>
      </div>
    </div>
  );
}