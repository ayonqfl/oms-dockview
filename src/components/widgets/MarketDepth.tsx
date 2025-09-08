import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { useTheme } from "../../utilities/context/ThemeContext";

// ✅ Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const MarketDepth: React.FC = () => {
  const { theme } = useTheme();

  // ✅ Column Definitions
  const columnDefs = useMemo(
    () => [
      { headerName: "Ordr", 
        field: "ord", 
        flex: 1, 
        minWidth: 80,
        cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#01392e", fontWeight: "bold", color: "white" }
            : {background: "#035644", fontWeight: "bold", color: "white"},
     },
      { headerName: "CUM Q", 
        field: "cumQ", 
        flex: 1,
         minWidth: 80,
          cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#01392e", fontWeight: "bold", color: "white" }
            : {background: "#035644", fontWeight: "bold", color: "white"},
         },
      { headerName: "BID Q", 
        field: "bidQ", 
        flex: 1, 
        minWidth: 80 ,
         cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#025242", fontWeight: "bold", color: "white" }
            : {background: "#047b62", fontWeight: "bold", color: "white"},
      },
      {
        headerName: "BID",
        field: "bid",
        flex: 1,
        minWidth: 80,
        cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#025242", fontWeight: "bold", color: "white" }
            : {background: "#047b62", fontWeight: "bold", color: "white"},
      },
      {
        headerName: "ASK",
        field: "ask",
        flex: 1,
        minWidth: 80,
        cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#7a1a34", fontWeight: "bold", color: "white" }
            : {background: "#ab2449", fontWeight: "bold", color: "white"},
      },
      { headerName: "ASK Q", 
        field: "askQ", 
        flex: 1, 
        minWidth: 80,
        cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#7a1a34", fontWeight: "bold", color: "white" }
            : {background: "#ab2449", fontWeight: "bold", color: "white"},
     },
      { headerName: "CUM Q", 
        field: "cumQ2", 
        flex: 1,
         minWidth: 80,
         cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#551224", fontWeight: "bold", color: "white" }
            : {background: "#771933", fontWeight: "bold", color: "white"},
         },
      { headerName: "Ordr", 
        field: "ord2", 
        flex: 1, 
        minWidth: 80,
         cellStyle: (params: any) =>
          params.node.rowIndex % 2 !== 0
            ? { background: "#551224", fontWeight: "bold", color: "white" }
            : {background: "#771933", fontWeight: "bold", color: "white"},
    },
    ],
    []
  );

  // ✅ Row Data
  const rowData = [
    { ord: 1, cumQ: 5, bidQ: 5, bid: 190.3, ask: 190.4, askQ: 277, cumQ2: 277, ord2: 1 },
    { ord: 2, cumQ: 53, bidQ: 48, bid: 190.2, ask: 192.5, askQ: 150, cumQ2: 427, ord2: 1 },
    { ord: 3, cumQ: 233, bidQ: 180, bid: 190.1, ask: 192.6, askQ: 1, cumQ2: 428, ord2: 1 },
    { ord: 7, cumQ: 521, bidQ: 288, bid: 190.0, ask: 193.0, askQ: 200, cumQ2: 628, ord2: 2 },
    { ord: 7, cumQ: 643, bidQ: 122, bid: 189.9, ask: 193.1, askQ: 29, cumQ2: 657, ord2: 2 },
    { ord: 5, cumQ: 713, bidQ: 70, bid: 189.8, ask: 193.7, askQ: 25, cumQ2: 662, ord2: 2 },
    { ord: 1, cumQ: 723, bidQ: 10, bid: 189.7, ask: 193.8, askQ: 2995, cumQ2: 3657, ord2: 3 },
    { ord: 3, cumQ: 853, bidQ: 130, bid: 189.6, ask: 194.0, askQ: 251, cumQ2: 3908, ord2: 3 },
    { ord: 3, cumQ: 973, bidQ: 120, bid: 189.5, ask: 194.9, askQ: 500, cumQ2: 4408, ord2: 1 },
    { ord: 1, cumQ: 978, bidQ: 5, bid: 189.4, ask: 195.0, askQ: 132, cumQ2: 4540, ord2: 5 },
  ];

  return (
    <div className="container-fluid text-light rounded py-2">
      {/* Top Section */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6 d-flex gap-2">
          <select className="form-select form-select-sm bg-secondary text-light">
            <option>DSE</option>
            <option>CSE</option>
          </select>
          <input
            type="text"
            value="ACI.PUBLIC"
            className="form-control form-control-sm bg-secondary text-light"
            readOnly
          />
        </div>

        <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
          <select className="form-select form-select-sm bg-secondary text-light">
            <option>By Price</option>
            <option>By Quantity</option>
          </select>
          <button className="btn btn-success btn-sm fw-bold">BUY</button>
          <button className="btn btn-danger btn-sm fw-bold">SELL</button>
        </div>
      </div>

    
    {/* Info Section */}
    <div className="text-center small g-2 mb-3">
    {(() => {
        const infoData = [
        ["Last", "190.4", "text-danger"],
        ["Open", "193.8", ""],
        ["Trade", "1,107", ""],
        ["L.Vol", "10", ""],
        ["SH", "213.0", ""],
        ["DH", "193.8", ""],
        ["CH", "209.40", ""],
        ["Net", "-3.3", "text-danger"],
        ["D%", "-1.7%", "text-danger"],
        ["Ctg", "A", ""],
        ["YCP", "193.7", ""],
        ["Close", "190.7", ""],
        ["Value", "190.7", ""],
        ["Vol", "190.7", ""],
        ["SL", "190.7", ""],
        ["DL", "190.7", ""],
        ["CL", "190.7", ""],
        ["52Wk", "190.7", ""],
        ["VWAP", "190.7", ""],
        ["Mkt", "190.7", ""],
        ];

        const rows = [];
        const itemsPerRow = 10;

        for (let i = 0; i < infoData.length; i += itemsPerRow) {
        const rowItems = infoData.slice(i, i + itemsPerRow);
        rows.push(
            <div className="row mt-2" key={i}>
                {rowItems.map(([label, value, cls], idx) => (
                    <div className="col-6 col-md-2 col-lg-1" key={idx}>
                    <div>{label}</div>
                    <div className={cls}>{value}</div>
                    </div>
                ))}
            </div>
        );
        }

        return rows;
    })()}
    </div>


      {/* Progress Bar */}
      <div className="progress mb-3" style={{ height: "10px" }}>
        <div className="progress-bar bg-success" role="progressbar" style={{ width: "50.00%" }}></div>
        <div className="progress-bar bg-danger" role="progressbar" style={{ width: "50.00%" }}></div>
      </div>

      {/* Market Depth Table */}
      <div
        className={theme === "dark" ? "ag-theme-alpine-dark ag-container" : "ag-theme-alpine ag-container"}
        style={{ width: "100%", overflow: "hidden" }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          headerHeight={32}
          rowHeight={30}
          domLayout="autoHeight"   
          suppressHorizontalScroll= {true}  
        />
      </div>
    </div>
  );
};

export default MarketDepth;
