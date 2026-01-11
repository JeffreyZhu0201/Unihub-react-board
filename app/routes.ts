import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/dashboard-layout.tsx", [
    index("routes/home.tsx"),
    route("profile", "routes/profile.tsx"),
    route("organization", "routes/organization.tsx"),
    route("class", "routes/class.tsx"),
    route("check-in", "routes/check-in.tsx"),
    route("dings", "routes/ding-list.tsx"),
    route("leave-approval", "routes/leave-approval.tsx"),
    route("leave-return", "routes/leave-return.tsx"),
    route("notifications", "routes/notifications.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
] satisfies RouteConfig;
