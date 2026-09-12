import { Outlet, type MetaArgs } from "react-router";
import Header from "~/components/layout/Header";

export function meta({}: MetaArgs) {
  return [
    { title: "Study Room" },
    {
      name: "description",
      content:
        "Study Room is your assistant to reach the success, study room contains many helpful tools, Focus Sessions, Progress Observer, night/light mode",
    },
  ];
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      
    </>
  );
}
