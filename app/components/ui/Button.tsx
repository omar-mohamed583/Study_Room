import type { ReactNode } from "react";
import { useNavigate } from "react-router";

export default function Button({
  children,
  className,
  navigation,
}: {
  children: ReactNode;
  className: string;
  navigation: { to: string };
}) {
  const navigate = useNavigate();
  return (
    <button
      className={`p-2 rounded-xl cursor-pointer ${className}`}
      onClick={navigation.to ? () => navigate(navigation.to) : () => ""}
    >
      {children}
    </button>
  );
}
