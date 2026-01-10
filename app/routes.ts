import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Auth routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),

  // Dashboard routes (protected by layout)
  layout("routes/dashboard-layout.tsx", [
    index("routes/home.tsx"),
    route("organization", "routes/organization.tsx"),
    route("class", "routes/class.tsx"),
    route("leave-approval", "routes/leave-approval.tsx"),
    route("check-in", "routes/check-in.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),
] satisfies RouteConfig;
