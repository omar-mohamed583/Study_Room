import type { InputHTMLAttributes, Ref } from "react";

export type InputProps = {
  type?: string;
  errorText?: string;
  value: string;
  seePassword?: boolean;
  setSeePassword?: React.Dispatch<React.SetStateAction<boolean>> | null;
  error: boolean;
  ref: Ref<null | HTMLInputElement>
} & InputHTMLAttributes<HTMLInputElement>