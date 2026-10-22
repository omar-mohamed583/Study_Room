import { useEffect, useLayoutEffect, useRef } from "react";
import FocusTimer from "~/components/ui/FocusTimer";
import useTheme from "~/context/themeContext";
import video from "../assets/nature-vid.mp4";
import image from "../assets/nature-image.webp";
import { createPortal } from "react-dom";
import type { LinksFunction, MetaFunction } from "react-router";
import logo from "../assets/logo.svg";
import Button from "~/components/ui/Button";

export const links: LinksFunction = () => [
  {
    rel: "icon",
    type: "image/svg+xml",
    href: logo,
  },
];

export const meta: MetaFunction = () => [
  {
    title: "Study Planner - Focus Mode",
  },
  {
    name: "",
    content: "",
  },
];

export default function focusMode() {
  if (!window.matchMedia("(pointer: fine)").matches)
    return (
      <div className="font-black text-lg fixed top-1/2 left-1/2 -translate-1/2 text-center text-balance">
        Please Open This Page On Desktop For Better Experince
      </div>
    );
  const { theme } = useTheme();

  useLayoutEffect(() => {
    theme !== "dark" ? document.body.classList.add("dark") : "";
    document.body.style.overflow = "auto";
  }, []);

  return (
    <>
      <Button
        className="fixed inset-bs-6 inset-s-6 bg-black/25 backdrop-blur-[2px] flex items-center gap-1 px-3.5 transition-colors hover:bg-black/50"
        navigation={{ to: "/focus-timer" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-left preview-icon"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Button>
      <main className="mx-auto flex max-w-7xl md:p-7 p-4 fixed inset-s-1/2 inset-bs-1/2 -translate-1/2 rounded-4xl border-2 bg-black/15 backdrop-blur-[2px] md:px-12">
        <FocusTimer size="sm" />
      </main>

      <VideoComponent />
    </>
  );
}

function VideoComponent() {
  const videoRef = useRef<null | HTMLVideoElement>(null);
  const imageRef = useRef<null | HTMLImageElement>(null);

  return createPortal(
    <div
      className="fixed inset-s-1/2 inset-bs-1/2 -translate-1/2 grid [grid-template-areas:'stack'] *:[grid-area:stack] min-h-dvh w-full pointer-events-none *:block *:size-full place-items-center *:aspect-"
      draggable={false}
    >
      <img
        src={image}
        alt="nature image"
        ref={imageRef}
      />
      <video
        src={video}
        autoPlay
        ref={videoRef}
        loop
        muted
        onCanPlay={() => {
          if (!videoRef.current || !imageRef.current) return;
          videoRef.current.style.opacity = "1";
          imageRef.current.style.opacity = "0";
        }}
      ></video>
    </div>,
    document.body,
  );
}
