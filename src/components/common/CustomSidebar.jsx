import "react-pro-sidebar/dist/css/styles.css";

import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightLeft } from "@fortawesome/free-solid-svg-icons";

// Removed Link from react-router-dom

const Item = ({ title, icon, selected, setSelected }) => {
  return (
    <MenuItem
      active={selected === title}
      style={{ color: "#ffffff" }}
      onClick={() => setSelected(title)}
      icon={<FontAwesomeIcon icon={icon} />}
    >
      <span>{title}</span>
      {/* Removed <Link to={to} /> */}
    </MenuItem>
  );
};

const CustomSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <div
      style={{
        backgroundColor: "rgb(245, 245, 245)",
        height: "100vh",
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <FontAwesomeIcon icon={faBars} /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: "#ffffff",
            }}
          >
            {!isCollapsed && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginLeft: "15px",
                }}
              >
                <span style={{ fontSize: "1.5rem", color: "#ffffff" }}>
                  OMS UFTFAST
                </span>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  style={{ background: "none", border: "none", color: "#ffffff" }}
                >
                  <FontAwesomeIcon icon={faBars} />
                </button>
              </div>
            )}
          </MenuItem>

          <div style={{ paddingLeft: isCollapsed ? undefined : "10%" }}>
            <Item
              title="Trade"
              icon={faRightLeft}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        </Menu>
      </ProSidebar>
    </div>
  );
};

export default CustomSidebar;
