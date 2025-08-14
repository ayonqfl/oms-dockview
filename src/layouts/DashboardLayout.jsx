import { Outlet } from "react-router-dom";
import CustomSidebar from '../components/common/CustomSidebar';
import Topbar from '../components/common/Topbar';
import '../styles/dashboard.css';

function DashboardLayout() {
 
  return (
    <div className='d-flex' style={{ minHeight: '100vh' }}>
      <div>
        <CustomSidebar />
      </div>
      
      <div className="d-flex flex-column flex-grow-1">
        <Topbar/>
        <div className="d-flex flex-grow-1 dashboard-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;