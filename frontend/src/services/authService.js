import { apiRequest } from "./apiClient";

const SESSION_KEY = "agendaVitalSession";

export async function loginWithCredentials({ email, password }) {
  const session = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password })
  });

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function loginWithGoogle(credential) {
  const session = await apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential })
  });

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getStoredSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const session = JSON.parse(raw);
  if (session.expiresAt < Date.now()) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }

  return session;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function requestPasswordRecovery(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() })
  });
}
