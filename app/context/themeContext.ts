import { createContext, useContext } from "react";
import type CustomContextType from "~/types/customContextType";

export const ThemeContext = createContext<CustomContextType | null>(null);

export default function useTheme() {
  const contextValue = useContext(ThemeContext);

  if (!contextValue) throw "error";

  return contextValue;
}