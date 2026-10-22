import { Signature } from "../ui/footer/signature";

export default function Footer() {
  return (
    <footer className="flex justify-between px-5 max-w-350 mt-20 mx-auto *:text-xs *:font-medium pb-7">
      <p>

          &copy;{new Date().getFullYear()} ALL RIGHTS RESERVED FOR STUDY PLANNER TEAM.


      </p>
      <a
        href="https://www.linkedin.com/in/omar-mohamed-69872731b"
        target="_blank"
      >
        <Signature
          text="MADE BY OMAR"
          fontSize={5}
          duration={1.8}
        />
      </a>
    </footer>
  );
}
