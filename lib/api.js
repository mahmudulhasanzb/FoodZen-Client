const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetch wrapper for FoodZen Express API.
 * Returns parsed JSON with `{ data }` shape on success.
 * Throws ApiError with `{ error }` message on failure.
 */
export async function api(path, options = {}) {
  const url = `${API_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Invalid response from server", res.status);
  }

  if (!res.ok) {
    throw new ApiError(json.error || "Request failed", res.status);
  }

  return json;
}

export function apiGet(path) {
  return api(path);
}

export function apiPost(path, body) {
  return api(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPatch(path, body) {
  return api(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiDelete(path) {
  return api(path, { method: "DELETE" });
}
