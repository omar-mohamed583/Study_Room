import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./components/layout/Main.tsx"),
  route("/login", "./pages/login.tsx"),
  route("/login/forget-password", "./pages/forgetPass.tsx"),
  route("*", "./pages/404.tsx")
] satisfies RouteConfig;
