// getToken: Dedicated auth utility helper to retrieve the access token from the
// document cookie storage. decodeURIComponent is the fallback solution to access
// the same cookie, in a different method
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// authHeaders: Dedicated function for setting the headers of a request to have
// the access token of the currently active user for different operations pertaining
// the authenticated user's data.
export function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
