// MarketDepth.tsx
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { useTheme } from "../../utilities/context/ThemeContext";
import { useMarketDepth } from "../../hooks/useMarketDepth";
import { useSelector } from "react-redux";
import AutoComplete from "../common/AutoComplete";

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

interface MarketDepthProps {
  id: string;
}

const MarketDepth: React.FC<MarketDepthProps> = ({ id }) => {
  const { theme } = useTheme();
  const { 
    instance, 
    updateFilters, 
    fetchData 
  } = useMarketDepth(id);

  const symbols: Record<string, SymbolItem> = useSelector(
    (state: any) => state.symbols.symbols || {}
  );

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    instance?.filters.symbol || "1JANATAMF.PUBLIC"
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (instance?.filters.symbol) {
      setSelectedSymbol(instance.filters.symbol);
    }
  }, [instance?.filters.symbol]);

  const allSymbols = useMemo(() => {
    return Object.keys(symbols || {})
      .filter(symbol => symbol.includes('.')) // Only symbols with board
      .sort();
  }, [symbols]);

  const searchSymbols = useCallback((query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const filtered = allSymbols.filter(symbol =>
      symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sort by relevance (exact match first, then partial matches)
    const sorted = filtered.sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.localeCompare(b);
    });
    
    setSuggestions(sorted.slice(0, 20)); // Increased to 20 for better UX
  }, [allSymbols]);

  const handleSymbolChange = useCallback((value: string) => {
    setSelectedSymbol(value);
    setSearchQuery(value);
    
    // Only update filters if it's a complete symbol (contains dot)
    if (value.includes('.')) {
      updateFilters({ symbol: value });
    }
  }, [updateFilters]);

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

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Market depth table data (keep your existing implementation)
  const displayData = useMemo(() => {
    if (!instance?.data || !instance.data.data) return [];

    const bids = instance.data.data.bid_levels || [];
    const asks = instance.data.data.ask_levels || [];

    const maxLen = Math.max(bids.length, asks.length);
    const rows: any[] = [];

    let cumBidQ = 0;
    let cumAskQ = 0;

    for (let i = 0; i < maxLen; i++) {
      const bid = bids[i];
      const ask = asks[i];

      cumBidQ += bid ? Number(bid.qty) : 0;
      cumAskQ += ask ? Number(ask.qty) : 0;

      rows.push({
        ord: bid ? i + 1 : "",
        cumQ: bid ? cumBidQ : "",
        bidQ: bid ? bid.qty : "",
        bid: bid ? Number(bid.price).toFixed(instance.data.data.price_decimals) : "",
        ask: ask ? Number(ask.price).toFixed(instance.data.data.price_decimals) : "",
        askQ: ask ? ask.qty : "",
        cumQ2: ask ? cumAskQ : "",
        ord2: ask ? i + 1 : "",
      });
    }

    return rows;
  }, [instance?.data]);

  // InfoData from Redux symbols (keep your existing implementation)
  const infoData = useMemo(() => {
    if (!symbols || !selectedSymbol) return [];

    const symbolInfo = symbols[selectedSymbol];
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

  // Column definitions (keep your existing implementation)
  const columnDefs = useMemo(() => [
    { headerName: "Ordr", field: "ord", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#01392e", fontWeight: "bold", color: "white" } : {background: "#035644", fontWeight: "bold", color: "white"} },
    { headerName: "CUM Q", field: "cumQ", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#01392e", fontWeight: "bold", color: "white" } : {background: "#035644", fontWeight: "bold", color: "white"} },
    { headerName: "BID Q", field: "bidQ", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#025242", fontWeight: "bold", color: "white" } : {background: "#047b62", fontWeight: "bold", color: "white"} },
    { headerName: "BID", field: "bid", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#025242", fontWeight: "bold", color: "white" } : {background: "#047b62", fontWeight: "bold", color: "white"} },
    { headerName: "ASK", field: "ask", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#7a1a34", fontWeight: "bold", color: "white" } : {background: "#ab2449", fontWeight: "bold", color: "white"} },
    { headerName: "ASK Q", field: "askQ", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#7a1a34", fontWeight: "bold", color: "white" } : {background: "#ab2449", fontWeight: "bold", color: "white"} },
    { headerName: "CUM Q", field: "cumQ2", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#551224", fontWeight: "bold", color: "white" } : {background: "#771933", fontWeight: "bold", color: "white"} },
    { headerName: "Ordr", field: "ord2", flex: 1, minWidth: 80, cellStyle: (params: any) => params.node.rowIndex % 2 !== 0 ? { background: "#551224", fontWeight: "bold", color: "white" } : {background: "#771933", fontWeight: "bold", color: "white"} },
  ], []);

  if (!instance) {
    return <div className="text-center p-3">Loading Market Depth...</div>;
  }

  return (
    <div className="container-fluid text-light rounded py-2">

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 d-flex gap-3 align-items-center">
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            value={instance.filters.exchange}
            onChange={handleExchangeChange}
            style={{ 
              width: '120px',
              borderRadius: '8px',
              border: '1px solid #6c757d'
            }}
          >
            <option value="DSE">DSE</option>
            <option value="CSE">CSE</option>
          </select>
          
          <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
            <AutoComplete
              value={searchQuery}
              suggestions={suggestions}
              completeMethod={searchSymbols}
              onChange={handleSymbolChange}
              placeholder="Search symbol (min 3 chars)..."
              className="w-100"
              minChars={3}
            />
          </div>
        </div>

        <div className="col-12 col-md-6 d-flex gap-2 justify-content-md-end">
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            value={instance.filters.sortBy}
            onChange={handleSortByChange}
            style={{ 
              width: '140px',
              borderRadius: '8px',
              border: '1px solid #6c757d'
            }}
          >
            <option value="price">By Price</option>
            <option value="quantity">By Quantity</option>
          </select>
          <button className="btn btn-success btn-sm fw-bold px-3">
            <i className="fas fa-arrow-up me-1"></i>
            BUY
          </button>
          <button className="btn btn-danger btn-sm fw-bold px-3">
            <i className="fas fa-arrow-down me-1"></i>
            SELL
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="row g-2 mb-4">
        <div className="col-12">
          <div className="bg-dark rounded p-3">
            <div className="row g-3 text-center">
              {infoData.map(([label, value, cls], idx) => (
                <div className="col-6 col-md-3 col-lg-2 col-xl-1" key={idx}>
                  <div className="small text-white mb-1">{label}</div>
                  <div className={`fw-bold ${cls}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {instance.loading && (
        <div className="text-center mb-3 py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2 text-muted">Loading market data...</div>
        </div>
      )}
      
      {instance.error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {instance.error}
        </div>
      )}

      {/* Market Depth Table */}
      {instance.data && (
        <div
          className={
            theme === "dark"
              ? "ag-theme-alpine-dark ag-container"
              : "ag-theme-alpine ag-container"
          }
          style={{ 
            width: "100%", 
            overflow: "hidden",
            borderRadius: '8px'
          }}
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
      )}
    </div>
  );
};

export default MarketDepth;