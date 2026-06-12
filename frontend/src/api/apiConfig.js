export const API_URL = (
  import.meta.env.DEV ? import.meta.env.VITE_API_URL || "http://127.0.0.1:5000" : ""
).replace(/\/+$/, "");

export function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

export function adminAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("token");

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export function adminFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    ...options,
    headers: adminAuthHeaders(options.headers || {})
  });
}
