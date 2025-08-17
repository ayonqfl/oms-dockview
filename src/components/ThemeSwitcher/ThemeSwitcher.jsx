import { useTheme } from '../../utilities/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className={`theme-switcher ${theme}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="icon-container">
        <FontAwesomeIcon 
          icon={theme === 'dark' ? faSun : faMoon} 
          className="theme-icon"
        />
      </div>
    </button>
  );
};

export default ThemeSwitcher;