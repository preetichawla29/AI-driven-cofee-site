// Same-origin by default (Vite proxies /api in dev); set VITE_API_URL to call another host.
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body && { "Content-Type": "application/json" }),
      },
    });
  } catch {
    throw new ApiError(
      "We couldn't reach the server. Check your connection and try again.",
      0,
    );
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${res.status}).`,
      res.status,
      body,
    );
  }
  return body;
}

export const getMenu = () => request("/api/menu");
export const getGallery = () => request("/api/gallery");

// Contact and Footer both need the info, so share one request between them.
let infoRequest;
export function getInfo() {
  infoRequest ??= request("/api/info").catch((err) => {
    infoRequest = undefined; // let a retry fetch again
    throw err;
  });
  return infoRequest;
}

// Dev only: a data file was saved, so the shared info must be fetched fresh.
// Registered here, before any useFetch listener, so it runs first.
if (import.meta.hot) {
  import.meta.hot.on("api-data-changed", () => {
    infoRequest = undefined;
  });
}

export const createBooking = (booking) =>
  request("/api/bookings", { method: "POST", body: JSON.stringify(booking) });
