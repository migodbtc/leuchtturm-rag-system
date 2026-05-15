import { NextRequest, NextResponse } from "next/server";

/**
 * PUBLIC_AUTH_ROUTES: routes for unauthenticated access (login/register).
 * PROTECTED_ROUTE_PREFIXES: URL prefixes that require a signed-in user.
 */
const PUBLIC_AUTH_ROUTES = ["/auth/login", "/auth/register"];
const PROTECTED_ROUTE_PREFIXES = ["/home"];

function getAccessToken(request: NextRequest) {
  const cookieValue =
    request.cookies.get("access_token")?.value ??
    request.cookies.get("auth_token")?.value ??
    null;

  if (!cookieValue) {
    return null;
  }

  const token = cookieValue.startsWith("Bearer ")
    ? cookieValue.slice("Bearer ".length)
    : cookieValue;

  // Basic shape check for JWT-like tokens (header.payload.signature)
  return token.split(".").length === 3 ? token : null;
}

export function authMiddleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Retrieve URL and check if public or protected
  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const token = getAccessToken(request);
  const hasToken = Boolean(token);

  // If there is no token, and the current route is protected
  if (!hasToken && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // If there is a token, and the current route is a public auth route
  if (hasToken && isPublicAuthRoute) {
    return NextResponse.redirect(new URL("/home/dash", request.url));
  }

  return response;
}
