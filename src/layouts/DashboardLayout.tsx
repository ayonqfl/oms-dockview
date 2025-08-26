import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomSidebar from "../components/common/CustomSidebar";
import Topbar from "../components/common/Topbar";
import "../styles/dashboard.css";

// Define the type for Outlet context
interface DashboardLayoutContext {
  addLogsTrigger: boolean;
}

const DashboardLayout = (): JSX.Element => {
  // State to trigger adding logs panel
  const [addLogsTrigger, setAddLogsTrigger] = useState<boolean>(false);

  // Function passed to Topbar
  const handleAddLogs = () => {
    // Toggle trigger to notify routed component
    setAddLogsTrigger((prev) => !prev);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div>
        <CustomSidebar />
      </div>

      <div className="d-flex flex-column flex-grow-1">
        <Topbar onAddLogs={handleAddLogs} />

        <div className="d-flex flex-grow-1 dashboard-content">
          <div className="container-fluid">
            {/* Pass addLogsTrigger to routed components via Outlet context */}
            <Outlet context={{ addLogsTrigger } as DashboardLayoutContext} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
