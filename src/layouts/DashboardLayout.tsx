import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomSidebar from "../components/common/CustomSidebar";
import Topbar from "../components/common/Topbar";
import "../styles/dashboard.css";

// Define the type for Outlet context
interface DashboardLayoutContext {
  addPanelName: string | null;
}

const DashboardLayout = (): JSX.Element => {
  const [addPanelName, setAddPanelName] = useState<string | null>(null);

  const handleAddLogs = (panelName: string) => {
    setAddPanelName(panelName);
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
            <Outlet context={{ addPanelName } as DashboardLayoutContext} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
