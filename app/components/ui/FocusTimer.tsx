
export default function FocusTimer() {
  return (
    <div className="pb-2 max-w-fit mx-auto rounded-2xl grid justify-center">
      <div className="timer aspect-square w-[clamp(280px,100%,380px)] rounded-[50%] bg-(--timer-bg) tracking-wider text-xl leading-[normal] border border-zinc-400/30 grid place-content-center">
        00:00
      </div>
    </div>
  );
}
