const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

export default function TaskItemSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-[1.1fr_.9fr] p-3 has-[+div]:border-b border-(--secondary-gray) items-center content-center"
    >
      {/* Subject, title, due time */}
      <div className="grid gap-1">
        <div className={`${BONE} h-3.5 w-20 max-w-full rounded`} />
        <div className={`${BONE} mt-1 h-[18px] w-3/4 max-w-full rounded`} />
        <div className={`${BONE} h-[11px] w-16 rounded`} />
      </div>

      {/* Actions: edit, delete, complete, start */}
      <div className="flex gap-1 flex-wrap justify-end items-center content-center">
        <div className={`${BONE} size-[31px] rounded-lg`} />
        <div className={`${BONE} size-[31px] rounded-lg`} />
        <div className={`${BONE} size-[31px] rounded-lg`} />
        <div className={`${BONE} h-[31px] w-[31px] rounded-lg md:w-[76px]`} />
      </div>
    </div>
  );
}
