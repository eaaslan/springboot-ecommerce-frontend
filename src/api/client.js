// Tiny fetch wrapper. No axios. Bearer token auto-attached if present in localStorage.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function token() {
  return localStorage.getItem("accessToken");
}

async function request(method, path, { body, headers } = {}) {
  const t = token();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return null;

  let data;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      (data && data.code) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts) => request("POST", path, { ...opts, body }),
  put: (path, body, opts) => request("PUT", path, { ...opts, body }),
  patch: (path, body, opts) => request("PATCH", path, { ...opts, body }),
  delete: (path, opts) => request("DELETE", path, opts),
};

export function uuid() {
  // crypto.randomUUID is available in modern browsers
  return crypto.randomUUID();
}
