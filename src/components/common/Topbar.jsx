import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
const Topbar = () => {
  return (
    <nav className='topbar'>
      <div className="topbar-title">
        <h1>OMS QFL</h1>
      </div>
      <div className="topbar-content">
         <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Topbar;