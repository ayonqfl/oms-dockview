// default styles imports
import "react-pro-sidebar/dist/css/styles.css";

// custom modules imports
import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightLeft, faHouse } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";


const Item = ({ title,  to, icon, selected, setSelected }) => {
  return (
    <MenuItem
      active={selected === title}
      style={{ color: "#ffffff" }}
      onClick={() => setSelected(title)}
      icon={<FontAwesomeIcon icon={icon} />}
    >
      <Link to={to} style={{ color: "#fff", textDecoration: "none" }}>{title}</Link>
    </MenuItem>
  );
};

const CustomSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <div style={{backgroundColor: "rgb(245, 245, 245)", height: "100vh",}}>
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
              title="Dashboard"
              to="/dashboard"
              icon={faHouse}
              // selected={selected}
              setSelected={setSelected}
            />
          </div>

          <div style={{ paddingLeft: isCollapsed ? undefined : "10%" }}>
            <Item
              title="Trade"
              to="/trade"
              icon={faRightLeft}
              // selected={selected}
              setSelected={setSelected}
            />
          </div>
        </Menu>
      </ProSidebar>
    </div>
  );
};

export default CustomSidebar;
