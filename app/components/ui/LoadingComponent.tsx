import { ThinkingOrb } from "thinking-orbs";

export default function LoadingComponent({ loading }: { loading: any}) {
  return (
    <div
      className={`loading h-screen w-screen fixed top-0 left-0 in-[.dark]:bg-black/80 bg-white/80 place-content-center place-items-center z-999 backdrop-blur-2xl ${!loading ? "visible opacity-100" : "invisible opacity-0"} duration-75 transition-opacity`}
    >
      <div className="flex flex-col items-center gap-2 tracking-wider text-sm">
        <ThinkingOrb
          state="solving"
          size={64}
        />
        Hang Tight...
      </div>
    </div>
  );
}