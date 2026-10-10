const BONE = "animate-pulse motion-reduce:animate-none bg-zinc-400/30";

const NAME_WIDTHS = ["w-32", "w-24", "w-36", "w-28", "w-20"];

export default function SubjectItemsSkeleton({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <table
      aria-hidden="true"
      className="w-full min-w-max"
    >
      <thead>
        <tr className="*:text-(--text-secondary) *:font-semibold *:text-[15px] **:p-4 bg-(--stripping-color) border-b border-b-zinc-500">
          <td>Subject</td>
          <td className="text-center">Tasks</td>
          <td className="text-center">Completed</td>
          <td className="text-center">Progress</td>
          <td className="text-center">Time Spent</td>
          <td></td>
        </tr>
      </thead>
      <tbody className="*:not-[tr:last-child]:border-b border-b-zinc-400 *:even:bg-(--stripping-color)">
        {Array.from({ length: count }).map((_, i) => (
          <tr
            className="*:p-2"
            key={i}
          >
            {/* Subject name + created date */}
            <td className="grid p-1 gap-1.5">
              <div
                className={`${BONE} h-[18px] ${NAME_WIDTHS[i % NAME_WIDTHS.length]} rounded`}
              />
              <div className={`${BONE} h-[11px] w-36 rounded`} />
            </td>

            {/* Tasks */}
            <td>
              <div className={`${BONE} mx-auto h-4 w-6 rounded`} />
            </td>

            {/* Completed */}
            <td>
              <div className={`${BONE} mx-auto h-4 w-6 rounded`} />
            </td>

            {/* Progress */}
            <td>
              <div className={`${BONE} mx-auto h-4 w-10 rounded`} />
            </td>

            {/* Time spent */}
            <td>
              <div className={`${BONE} mx-auto h-4 w-8 rounded`} />
            </td>

            {/* Chevron */}
            <td>
              <div className={`${BONE} size-5 rounded`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
