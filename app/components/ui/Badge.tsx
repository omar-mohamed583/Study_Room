import { twMerge } from "cn";

export default function Badge({
  className,
  variant = "primary",
  children,
}: {
  className?: string;
  variant?: "primary" | "secondary" | "accent";
  children: React.ReactNode;
}) {
  return (
    <div
      className={twMerge(
        `inline-block p-0.5 px-4 backdrop-blur-lg border rounded-full capitalize text-[11px] ${variant === "primary" ? "bg-blue-500/15 border-blue-500 text-blue-500" : variant === "secondary" ? "bg-[#dfdfdf67] in-[.dark]:bg-[#ffffff0f] text-(--pale-text) border border-gray-400/20" : "bg-purple-500/15 border-purple-500 text-purple-500"} ${className}`,
      )}
    >
      {children}
    </div>
  );
}
