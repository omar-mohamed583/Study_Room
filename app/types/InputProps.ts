import type { InputHTMLAttributes, Ref } from "react";

export type InputProps = {
  type?: string;
  errorText?: string;
  value: string;
  error: boolean;
  ref: Ref<null | HTMLInputElement>
} & InputHTMLAttributes<HTMLInputElement>