import { useState } from "react";
import { Outlet } from "react-router-dom";

import CustomSidebar from "../components/common/CustomSidebar";
import Topbar from "../components/common/Topbar";
import WsFeedMd from "../components/feed/WsFeedMd";
import "../styles/dashboard.css";

interface DashboardLayoutContext {
  addPanelName: string | null;
}
interface DashboardLayoutProps {
  isAuthenticated: boolean;
}

const DashboardLayout = ({ isAuthenticated }: DashboardLayoutProps): JSX.Element => {
  const [addPanelName, setAddPanelName] = useState<string | null>(null);

  const handleAddLogs = (panelName: string) => {
    setAddPanelName(panelName);
    setTimeout(() => setAddPanelName(null), 50);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <CustomSidebar />

      <div className="d-flex flex-column flex-grow-1">
        <Topbar onAddLogs={handleAddLogs} />

        {/* Only render WsFeedMd if user is authenticated */}
        {isAuthenticated && <WsFeedMd />}

        <div className="d-flex flex-grow-1 dashboard-content">
          <div className="container-fluid" style={{ paddingRight: "1px" }}>
            <Outlet context={{ addPanelName } as DashboardLayoutContext} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
