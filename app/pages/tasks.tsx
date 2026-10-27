import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import type { MetaFunction } from "react-router";
import type { LinksFunction } from "react-router";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    as: "image",
    href:
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? darkLogo
        : lightLogo,
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Calendar",
  },
  {
    name: "",
    content: "",
  },
];

export default function Tasks() {
  return (
    <main className="grid gap-4 p-5">
      <h1>Tasks</h1>
    </main>
  )
}