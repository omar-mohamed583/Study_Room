import lightLogo from "~/assets/light-logo.svg";
import darkLogo from "~/assets/dark-logo.svg";
import type { MetaFunction } from "react-router";
import type { LinksFunction } from "react-router";
import Header from "~/components/layout/Header";

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
    <>
      <Header />
      <main className="mx-auto grid w-full max-w-350 gap-4 px-4 pb-10 pt-28 md:px-8">
        <h1 className="text-2xl font-black">Tasks</h1>
      </main>
    </>
  );
}