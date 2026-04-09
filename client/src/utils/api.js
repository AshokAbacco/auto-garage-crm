const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://nefariously-unglistening-maryann.ngrok-free.dev";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  // 🔥 Guard: ngrok / HTML fallback protection
  if (text.startsWith("<!DOCTYPE")) {
    console.error("HTML response instead of JSON:", text.slice(0, 200));
    throw new Error("API returned HTML (ngrok interstitial)");
  }

  return JSON.parse(text);
}
