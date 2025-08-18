import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
const Topbar = () => {
  return (
    <nav className='topbar'>
      <div className="topbar-title">
        <h4>OMS QFL</h4>
      </div>
      <div className="topbar-content">
         <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Topbar;