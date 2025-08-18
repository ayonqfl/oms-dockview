import { Outlet } from "react-router-dom";
import { useState } from "react";

import CustomSidebar from '../components/common/CustomSidebar';
import Topbar from '../components/common/Topbar';
import '../styles/dashboard.css';

function DashboardLayout() {
  // State to trigger adding logs panel
  const [addLogsTrigger, setAddLogsTrigger] = useState(false);

  // Function passed to Topbar
  const handleAddLogs = () => {
    // Toggle trigger to notify routed component
    setAddLogsTrigger(prev => !prev);
  };

  return (
    <div className='d-flex' style={{ minHeight: '100vh' }}>
      <div>
        <CustomSidebar />
      </div>
      
      <div className="d-flex flex-column flex-grow-1">
        <Topbar onAddLogs={handleAddLogs} />
        
        <div className="d-flex flex-grow-1 dashboard-content">
          <div className="container-fluid">
            {/* Pass addLogsTrigger to routed components via Outlet context */}
            <Outlet context={{ addLogsTrigger }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
