import { useState, useEffect, ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return (savedTheme as Theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme);
  };

  const toggleTheme = (): void => {
    setThemeState((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};