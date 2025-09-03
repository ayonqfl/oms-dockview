import React, { useState } from "react";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";

interface TopbarProps {
  onAddLogs: (panelName: string) => void;
}

const panelList: string[] = [
  "Watchlist",
  "Market Watch",
  "Order Terminal",
  "Market Depth"
];

const Topbar = ({ onAddLogs }: TopbarProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (panel: string) => {
    onAddLogs(panel);
    setIsOpen(false);
  };

  return (
    <nav className="topbar"  >
      <div className="topbar-title">
        <h4 style={{ margin: 0 }}>OMS QFL</h4>
      </div>

      <div className="topbar-content" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Custom Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: "#0dcaf0", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            Add Panel ▾
          </button>

          {isOpen && (
            <ul
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                minWidth: "180px",
                maxHeight: "580px",
                overflowY: "auto",
                background: "#212529", 
                borderRadius: "6px",
                padding: "4px 0",
                zIndex: 9999,
                listStyle: "none",
                margin: 0,
              }}
            >
              {panelList.map((panel, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(panel)}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.background = "#727272ff")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.background = "")
                  }
                >
                  {panel}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default Topbar;
