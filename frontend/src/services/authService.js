import { apiRequest } from "./apiClient";

export async function loginWithCredentials({ email, password, captchaToken }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password, captchaToken })
  });
}

export async function loginWithGoogle(credential) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential })
  });
}

export async function getCurrentSession() {
  clearSession();
  try {
    return await apiRequest("/auth/session", { cache: "no-store" });
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("agendaVitalSession");
  }
}

export async function logoutSession() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearSession();
  }
}

export async function requestPasswordRecovery(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() })
  });
}

export async function resetPassword({ token, password }) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password })
  });
}
