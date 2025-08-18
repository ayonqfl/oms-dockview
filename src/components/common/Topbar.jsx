import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

const Topbar = ({ onAddLogs }) => {
  return (
    <nav className='topbar'>
      <div className="topbar-title">
        <h4>OMS QFL</h4>
      </div>
      <div className="topbar-content"> 
         <button onClick={onAddLogs} type="button" className="btn btn-sm" style={{ backgroundColor: '#0dcaf0' }}>Add Panel</button>
         <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Topbar;
