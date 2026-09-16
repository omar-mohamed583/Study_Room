import type { ReactNode } from "react";
import { ThemeContext } from "~/context/themeContext";
import { useLocalStorage } from "~/hooks/useLocalStorage";

export default function ThemeContextProvider({children}: {children: ReactNode}) {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <ThemeContext value={{theme, setTheme,}}>
      {children}
    </ThemeContext>
  )
}