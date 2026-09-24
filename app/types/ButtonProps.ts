import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = {
  children: ReactNode;
  className: string;
  navigation?: { to: string };
} & ButtonHTMLAttributes<HTMLButtonElement>;