import { twMerge } from "cn";
import { useNavigate } from "react-router";
import type { ButtonProps } from "~/types/ButtonProps";

export default function Button({
  children,
  className,
  navigation = { to: "" },
  ...props
}: ButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      className={twMerge(`p-2 rounded-xl cursor-pointer ${className}`)}
      onClick={navigation?.to ? () => navigate(navigation.to) : () => ""}
      {...props}
    >
      {children}
    </button>
  );
}
