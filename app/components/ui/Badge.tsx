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
        `inline-block p-1.5 px-3.5 backdrop-blur-lg border capitalize text-[15px] ${variant === "primary" ? "bg-blue-500/30 border-blue-500 text-blue-500" : variant === "secondary" ? "bg-[#ffffff0f] text-(--pale-text) border border-white/30" : "bg-purple-500/30 border-purple-500 text-purple-500"} ${className}`,
      )}
    >{children}</div>
  );
}
