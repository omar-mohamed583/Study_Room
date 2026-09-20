import { useLayoutEffect } from "react";
import { Link } from "react-router";
import Button from "~/components/ui/Button";
import Particles from "~/components/ui/Particles";
import WarpText from "~/components/ui/WarpText";
import useTheme from "~/context/themeContext";

export default function NotFound() {
  const { theme } = useTheme();

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <main className="mt-27 grid content-center *:text-center justify-center min-h-full">
      <Particles
        particleColors={[theme === "dark" ? "#fff" : "#838383"]}
        particleCount={800}
        particleSpread={10}
        speed={0.3}
        particleBaseSize={110}
        moveParticlesOnHover
        alphaParticles={false}
        disableRotation={false}
      />
      <h1 className="relative z-10 text-8xl leading-[normal] font-black">
        <WarpText
          text="404"
          color={theme === "light" ? "#424242" : "#fff"}
          warpStrength={0.09}
          warpScale={1.6}
          speed={0.55}
          pointerInfluence={0.47}
          pointerStrength={0.48}
          refraction={0.02}
          ripple
          fontSize={116}
          fontWeight={900}
          style={{ height: "fit-content" }}
          fontFamily="inherit"
          letterSpacing={-0.06}
          lineHeight={0.9}
        />
      </h1>
      <span className="-mt-24">
        <WarpText
          text="Not Found"
          color={theme === "light" ? "#424242" : "#fff"}
          warpStrength={0.09}
          warpScale={1.3}
          speed={0.55}
          pointerInfluence={0.47}
          pointerStrength={0.48}
          refraction={0.02}
          ripple
          fontSize={30}
          fontWeight={600}
          style={{ height: "fit-content" }}
          fontFamily="inherit"
          letterSpacing={-0.06}
          lineHeight={0.9}
        />
      </span>

      <p className="-mt-20">
        Sorry, we didn't find the page that you are looking for.
      </p>

      <Button className="bg-black text-white transition-colors duration-300 hover:bg-zinc-800 flex gap-2 content-center items-center justify-center" navigation={{to: "/"}}>
        Return To Home
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
          className="lucide lucide-move-right preview-icon"
        >
          <path d="M18 8L22 12L18 16" />
          <path d="M2 12H22" />
        </svg>
      </Button>
    </main>
  );
}
