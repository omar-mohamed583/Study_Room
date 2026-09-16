import type { ReactNode } from "react";
import { Navigate } from "react-router";

export default function Button({
  children,
  className,
  navigation,
}: {
  children: ReactNode;
  className: string;
  navigation: { to: string };
}) {
  return (
    <button
      className={`p-2 rounded-xl cursor-pointer ${className}`}
      onClick={navigation.to ? () => Navigate({ to: navigation.to }) : () => ""}
    >
      {children}
    </button>
  );
}
