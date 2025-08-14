import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft, faHouse } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../../styles/CustomSidebar.css";

const Item = ({ title, to, icon, selected, setSelected }) => {
  return (
    <div className="menu-item-container">
      <Link 
        to={to} 
        className={`menu-item ${selected === title ? "active" : ""}`}
        onClick={() => setSelected(title)}
      >
        <FontAwesomeIcon icon={icon} className="menu-icon" />
        <span className="tooltip">{title}</span>
      </Link>
    </div>
  );
};

const CustomSidebar = () => {
  const [selected, setSelected] = useState("Dashboard");

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="menu-items">
          <Item
            title="Dashboard"
            to="/dashboard"
            icon={faHouse}
            selected={selected}
            setSelected={setSelected}
          />
          <Item
            title="Trade"
            to="/trade"
            icon={faRightLeft}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSidebar;