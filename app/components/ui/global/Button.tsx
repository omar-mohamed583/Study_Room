import { twMerge } from "cn";
import { useNavigate } from "react-router";
import { useTransition, type MouseEventHandler } from "react";
import type { ButtonProps } from "~/types/ButtonProps";

export default function Button({
  children,
  className,
  navigation = { to: "" },
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || !navigation.to || disabled) return;

    startTransition(() => {
      void navigate(navigation.to);
    });
  };

  return (
    <button
      {...props}
      className={twMerge(
        `p-2 rounded-xl cursor-pointer transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100 ${className} leading-[normal]`,
      )}
      onClick={handleClick}
      disabled={disabled || isPending}
      aria-busy={isPending || undefined}
    >
      {children}
    </button>
  );
}
