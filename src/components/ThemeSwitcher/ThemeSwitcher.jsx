import { useTheme } from '../../utilities/context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
 console.log('Current theme:', theme);
 console.log('Toggle function:', toggleTheme);
  return (
    <button onClick={toggleTheme} className="theme-switcher">
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeSwitcher;