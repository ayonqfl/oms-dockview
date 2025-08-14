import { useTheme } from '../../utilities/context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="theme-switcher">
      Switch to {theme === 'dark' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeSwitcher;