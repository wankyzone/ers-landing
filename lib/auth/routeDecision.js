export function routeForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "runner") return "/runner";
  if (role === "client") return "/client";
  return "/select-role";
}
