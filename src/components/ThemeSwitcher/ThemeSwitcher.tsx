import React from "react";
import { useTheme } from "../../utilities/context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import "../../styles/ThemeSwitcher.css";

const ThemeSwitcher = (): JSX.Element => {
  const { theme, toggleTheme } = useTheme(); // Now this matches

  const icon: IconDefinition = theme === "dark" ? faSun : faMoon;

  return (
    <button
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="switch-track">
        <span className="switch-thumb">
          <FontAwesomeIcon icon={icon} />
        </span>
      </span>
    </button>
  );
};

export default ThemeSwitcher;