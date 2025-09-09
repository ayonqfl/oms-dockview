import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft, faHouse, faRightFromBracket, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import "../../styles/CustomSidebar.css";

interface ItemProps {
  title: string;
  to: string;
  icon: IconDefinition;
  selected: string;
  setSelected: (title: string) => void;
}

const Item = ({ title, to, icon, selected, setSelected }: ItemProps): JSX.Element => {
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

const CustomSidebar = (): JSX.Element => {
  const location = useLocation();
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (location.pathname.includes("/dashboard")) {
      setSelected("Dashboard");
    } else if (location.pathname.includes("/trade")) {
      setSelected("Trade");
    } else if (location.pathname.includes("/logout")) {
      setSelected("Logout");
    }
  }, [location.pathname]);

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
          <Item
            title="Logout"
            to="/logout"
            icon={faRightFromBracket}
            selected={selected}
            setSelected={setSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSidebar;
