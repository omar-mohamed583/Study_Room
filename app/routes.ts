import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./components/layout/Main.tsx"),
  route("/login", "./pages/login.tsx"),
  route("/login/forget-password", "./pages/forgetPass.tsx"),
  route("/tasks/:id?", "./pages/tasks.tsx"),
  route("/subject/:id?", "./pages/subjects.tsx"),
  route("*", "./pages/404.tsx"),
] satisfies RouteConfig;
