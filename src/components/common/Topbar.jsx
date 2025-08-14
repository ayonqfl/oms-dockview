import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import '../../styles/Topbar.css';

const Topbar = () => {
  return (
    <nav className='topbar'>
      <div className="topbar-content">
         <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Topbar;