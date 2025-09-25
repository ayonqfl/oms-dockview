import React, { useMemo, useCallback, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { useTheme } from "../../utilities/context/ThemeContext";
import { useMarketDepth } from "../../hooks/useMarketDepth";
import { useSelector } from "react-redux";

// ✅ Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface SymbolItem {
  ltp?: number;
  open?: number;
  trades?: number;
  last_vol?: number;
  high?: number;
  close?: number;
  change?: number;
  change_per?: number;
  category?: string;
  ycp?: number;
  turnover?: number;
  volume?: number;
  low?: number;
  sector?: string;
}

const MarketDepth: React.FC = () => {
  const { theme } = useTheme();
  const { filters, data, loading, error, updateFilters } = useMarketDepth();

    // ✅ Get symbols from Redux
  const symbols: Record<string, SymbolItem> = useSelector(
    (state: any) => state.symbols.symbols || {}
  );

    // Selected symbol state
  const [selectedSymbol, setSelectedSymbol] = useState<string>(filters.symbol);

  // Update filters when symbol changes
  const handleSymbolChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setSelectedSymbol(value);
      updateFilters({ symbol: value });
    },
    [updateFilters]
  );

  const handleExchangeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilters({ exchange: e.target.value });
    },
    [updateFilters]
  );

  const handleSortByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilters({ sortBy: e.target.value as "price" | "quantity" });
    },
    [updateFilters]
  );
 
  // ✅ Market depth table data
const displayData = useMemo(() => {
  if (!data || !data.data) return [];

  const bids = data.data.bid_levels || [];
  const asks = data.data.ask_levels || [];

  const maxLen = Math.max(bids.length, asks.length);
  const rows: {
    ord: number | string;
    cumQ: number | string;
    bidQ: number | string;
    bid: number | string;
    ask: number | string;
    askQ: number | string;
    cumQ2: number | string;
    ord2: number | string;
  }[] = [];

  let cumBidQ = 0;
  let cumAskQ = 0;

  for (let i = 0; i < maxLen; i++) {
    const bid = bids[i];
    const ask = asks[i];

    console.log("Bid:", bid, "Ask:", ask);

    cumBidQ += bid ? Number(bid.qty) : 0;
    cumAskQ += ask ? Number(ask.qty) : 0;

    rows.push({
      ord: bid ? i + 1 : "",
      cumQ: bid ? cumBidQ : "",
      bidQ: bid ? bid.qty : "",
      bid: bid ? Number(bid.price).toFixed(data.data.price_decimals) : "",
      ask: ask ? Number(ask.price).toFixed(data.data.price_decimals) : "",
      askQ: ask ? ask.qty : "",
      cumQ2: ask ? cumAskQ : "",
      ord2: ask ? i + 1 : "",
    });
  }

  return rows;
}, [data]);

  // ✅ InfoData from Redux symbols
  const infoData = useMemo(() => {
    if (!symbols || !selectedSymbol) return [];

    const symbolInfo = symbols[selectedSymbol];

    console.log("InfoData symbolInfo:", symbolInfo);
    
    if (!symbolInfo) return [];

    const cls = (val: number | undefined) => {
      if (val === undefined) return "";
      return val >= 0 ? "text-success" : "text-danger";
    };

    return [
      ["Last", symbolInfo.ltp?.toString() ?? "", cls(symbolInfo.change)],
      ["Open", symbolInfo.open?.toString() ?? "", ""],
      ["Trade", symbolInfo.trades?.toLocaleString() ?? "", ""],
      ["L.Vol", symbolInfo.last_vol?.toString() ?? "", ""],
      ["SH", symbolInfo.high?.toString() ?? "", ""],
      ["DH", symbolInfo.high?.toString() ?? "", ""],
      ["CH", symbolInfo.close?.toString() ?? "", ""],
      ["Net", symbolInfo.change?.toString() ?? "", cls(symbolInfo.change)],
      ["D%", symbolInfo.change_per ? `${symbolInfo.change_per}%` : "", cls(symbolInfo.change_per)],
      ["Ctg", symbolInfo.category ?? "", ""],
      ["YCP", symbolInfo.ycp?.toString() ?? "", ""],
      ["Close", symbolInfo.close?.toString() ?? "", ""],
      ["Value", symbolInfo.turnover?.toLocaleString() ?? "", ""],
      ["Vol", symbolInfo.volume?.toLocaleString() ?? "", ""],
      ["SL", symbolInfo.low?.toString() ?? "", ""],
      ["DL", symbolInfo.low?.toString() ?? "", ""],
      ["CL", symbolInfo.close?.toString() ?? "", ""],
      ["52Wk", "-", ""],
      ["VWAP", "-", ""],
      ["Mkt", symbolInfo.sector ?? "", ""],
    ];
  }, [symbols, selectedSymbol]);

  // Column definitions
  const columnDefs = useMemo(
    () => [
      { headerName: "Ordr", field: "ord", flex: 1, minWidth: 80 },
      { headerName: "CUM Q", field: "cumQ", flex: 1, minWidth: 80 },
      { headerName: "BID Q", field: "bidQ", flex: 1, minWidth: 80 },
      { headerName: "BID", field: "bid", flex: 1, minWidth: 80 },
      { headerName: "ASK", field: "ask", flex: 1, minWidth: 80 },
      { headerName: "ASK Q", field: "askQ", flex: 1, minWidth: 80 },
      { headerName: "CUM Q", field: "cumQ2", flex: 1, minWidth: 80 },
      { headerName: "Ordr", field: "ord2", flex: 1, minWidth: 80 },
    ],
    []
  );

  return (
     <div className="container-fluid text-light rounded py-2">
      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6 d-flex gap-2">
          <select
            className="form-select form-select-sm bg-secondary text-light"
            value={filters.exchange}
            onChange={handleExchangeChange}
          >
            <option value="DSE">DSE</option>
            <option value="CSE">CSE</option>
          </select>
          <input
            type="text"
            value={selectedSymbol}
            onChange={handleSymbolChange}
            className="form-control form-control-sm bg-secondary text-light"
            placeholder="Enter symbol..."
          />
        </div>

        <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
          <select
            className="form-select form-select-sm bg-secondary text-light"
            value={filters.sortBy === "price" ? "price" : "quantity"}
            onChange={handleSortByChange}
          >
            <option value="price">By Price</option>
            <option value="quantity">By Quantity</option>
          </select>
          <button className="btn btn-success btn-sm fw-bold">BUY</button>
          <button className="btn btn-danger btn-sm fw-bold">SELL</button>
        </div>
      </div>

      {/* Info Section */}
      <div className="text-center small g-2 mb-3">
        <div className="row mt-2">
          {infoData.map(([label, value, cls], idx) => (
            <div className="col-6 col-md-2 col-lg-1" key={idx}>
              <div>{label}</div>
              <div className={cls}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <div className="text-center mb-3">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Market Depth Table */}
      <div
        className={
          theme === "dark"
            ? "ag-theme-alpine-dark ag-container"
            : "ag-theme-alpine ag-container"
        }
        style={{ width: "100%", overflow: "hidden" }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={displayData}
          headerHeight={32}
          rowHeight={30}
          domLayout="autoHeight"
          suppressHorizontalScroll={true}
        />
      </div>
    </div>
  );
};

export default MarketDepth;