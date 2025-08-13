// default modules imports
import { Outlet } from "react-router-dom";

// custom modules imports
import CustomSidebar from '../components/common/CustomSidebar'

import '../styles/dashboard.css'


function DashboardLayout() {

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div>
        <CustomSidebar />
      </div>

      <div className="d-flex flex-grow-1 dashboard-content">
        <div className="container-fluid">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout;
