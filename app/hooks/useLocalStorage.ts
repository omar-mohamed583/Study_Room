import { useEffect, useState } from "react";

export function useLocalStorage(key: string, defaultValue: any) {
  const [value, useValue] = useState(() => {
    if (!window.localStorage) return defaultValue;

    const localStorageValue = localStorage.getItem(key);
    if (localStorageValue) return localStorageValue;

    return defaultValue
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value]);

  return [value, useValue] as const;
}