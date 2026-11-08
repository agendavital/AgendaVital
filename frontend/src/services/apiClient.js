const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const SESSION_KEY = "agendaVitalSession";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "null");
    if (!session?.token || session.expiresAt <= Date.now()) return null;
    return session.token;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : payload?.message;

    throw new Error(message ?? "Error consultando el servicio.");
  }

  return payload;
}
