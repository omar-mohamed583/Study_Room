import { useLayoutEffect } from "react";
import { Link } from "react-router";
import Particles from "~/components/ui/Particles";
import WarpText from "~/components/ui/WarpText";
import useTheme from "~/context/themeContext";

export default function NotFound() {
  const { theme } = useTheme();

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <main className="mt-5 grid content-center *:text-center justify-center min-h-full">
      <Particles
        particleColors={[ theme === "dark" ? "#fff" : "#838383"]}
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
      <Link
        to="/"
        className="mx-auto underline max-w-fit hover:text-blue-500 p-1 underline-offset-1 mt-0"
      >
        Return Home
      </Link>
    </main>
  );
}
