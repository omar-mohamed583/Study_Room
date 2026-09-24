import { useMemo, useRef, useState } from "react";
import type { InputProps } from "~/types/InputProps";

export function useInputStates() {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const id = useMemo(() => crypto.randomUUID(), []);
  const inputRef = useRef<null | HTMLInputElement>(null);

  return [value, setValue, error, setError, id, inputRef] as const;
}

export default function InputComponent({
  type = "text",
  errorText = `Invalid ${type}`,
  value,
  error,
  ref,
  ...inpProps
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          id={type}
          ref={ref}
          aria-autocomplete="list"
          type={type === "otp" || type === "name" ? "text" : type === "password" || type === "confirm password" ? "password" : "email"}
          autoComplete={type}
          placeholder=" "
          name={type}
          title={`Please enter your ${type}`}
          {...inpProps}
          value={value}
          className={`peer focus:outline-none p-2 border-b  w-full text-[15px] ${error ? "border-b-red-500" : "border-b-gray-400"}`}
        />
        <label
          htmlFor={type}
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${error ? "text-red-500" : "text-gray-400"}
              pointer-events-none transition-all
              peer-focus:-top-0.5 peer-focus:scale-80 peer-focus:left-0
              peer-not-placeholder-shown:left-0
              peer-not-placeholder-shown:scale-80
              peer-not-placeholder-shown:-top-0.5 flex gap-2 items-center content-center capitalize`}
        >
          {type === "email" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-mail"
            >
              <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
              />
            </svg>
          )}
          {(type === "password" ||
            type === "confirm password" )&& (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-lock-keyhole"
              >
                <circle
                  cx="12"
                  cy="16"
                  r="1"
                />
                <rect
                  x="3"
                  y="10"
                  width="18"
                  height="12"
                  rx="2"
                />
                <path d="M7 10V7a5 5 0 0 1 10 0v3" />
              </svg>
            )}

          {type === "otp" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-key-round preview-icon"
            >
              <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
              <circle
                cx="16.5"
                cy="7.5"
                r=".5"
                fill="currentColor"
              />
            </svg>
          )}
          {type === "name" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-type"
            >
              <path d="M12 4v16" />
              <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
              <path d="M9 20h6" />
            </svg>
          )}
          {type}
        </label>
      </div>
      <span
        className={`max-w-fit email-error text-[13px] text-red-500 font-medium ${!error && "opacity-0"} transition-opacity`}
      >
        {errorText}
      </span>
    </div>
  );
}
