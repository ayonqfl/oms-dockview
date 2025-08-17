import { useTheme } from '../../utilities/context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import '../../styles/ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="switch-track">
        <span className="switch-thumb">
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </span>
      </span>
    </button>
  );
};

export default ThemeSwitcher;