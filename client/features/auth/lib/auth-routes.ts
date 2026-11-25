//destination route that auth logic redirect to
export const authRoutes = {
  login: "/login",
  dashboard: "/dashboard",
  home: "/",
} as const;

//only authenticated user can visit this routes
export const protectedRoutes = [authRoutes.dashboard, "/workspace"] as const;

//if user is not authenticated and tries to access protected route, redirect to login page
export const unauthenticatedRoutes = [authRoutes.login] as const;

// Check if a route is protected eg. /dashboard, /workspace
export function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// Check if a route is unauthenticated eg. /login
export function isUnauthenticatedRoute(pathname: string) {
  return unauthenticatedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
