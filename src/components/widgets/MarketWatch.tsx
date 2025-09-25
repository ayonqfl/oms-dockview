import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from "ag-grid-community";
import { useTheme } from "../../utilities/context/ThemeContext";

interface SymbolItem {
  symbol: string;
  company_name: string;
  sector?: string;
  category?: string;
  coup_rate?: number;
  yield?: number;
  ltp: number;
  close: number;
  ycp?: number;
  volume: number;
  change: number;
  change_per: number;
  bid?: number;
  bidqty?: number;
  ask?: number;
  askqty?: number;
  trades?: number;
  turnover?: number;
  open?: number;
  high?: number;
  low?: number;
  last_vol: number;
}

// ✅ Stable formatters defined outside component
const formatNumber = (params: any) => {
  try {
    if (params?.value === null || params?.value === undefined || params?.value === "") return "";
    const num = typeof params.value === "string" ? parseFloat(params.value) : params.value;
    if (isNaN(num)) return "";
    return num;
  } catch (error) {
    return "";
  }
};

const formatLargeNumber = (params: any) => {
  try {
    if (params?.value === null || params?.value === undefined || params?.value === "") return "";
    const num = typeof params.value === "string" ? parseFloat(params.value) : params.value;
    if (isNaN(num)) return "";
    return num.toLocaleString();
  } catch (error) {
    return "";
  }
};

const formatPercentage = (params: any) => {
  try {
    if (params?.value === null || params?.value === undefined || params?.value === "") return "";
    const num = typeof params.value === "string" ? parseFloat(params.value) : params.value;
    if (isNaN(num)) return "";
    return `${num.toFixed(2)}%`;
  } catch (error) {
    return "";
  }
};

const getCellClass = (params: any) => {
  try {
    return params?.value >= 0 ? "text-success" : "text-danger";
  } catch (error) {
    return "";
  }
};

const MarketWatch: React.FC = () => {
  const { theme } = useTheme();
  const gridApi = useRef<GridApi | null>(null);
  const gridColumnApi = useRef<ColumnApi | null>(null);
  const isUserInteractingRef = useRef(false);
  const updateThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const prevSymbolsRef = useRef<Record<string, SymbolItem>>({});

  // ✅ Get symbols from Redux with optimized selector
  const symbols: Record<string, SymbolItem> = useSelector(
    (state: any) => state.symbols.symbols || {},
    (left, right) => {
      if (left === right) return true;
      
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);
      
      if (leftKeys.length !== rightKeys.length) return false;
      
      return leftKeys.every(key => {
        const leftItem = left[key];
        const rightItem = right[key];
        
        if (!leftItem || !rightItem) return leftItem === rightItem;
        
        // Compare key fields that affect display
        return (
          leftItem.ltp === rightItem.ltp &&
          leftItem.change === rightItem.change &&
          leftItem.change_per === rightItem.change_per &&
          leftItem.volume === rightItem.volume &&
          leftItem.bid === rightItem.bid &&
          leftItem.ask === rightItem.ask
        );
      });
    }
  );
console.log("MarketWatch symbols count:", Object.keys(symbols));
  // ✅ Check user interaction
  const isUserInteracting = useCallback((): boolean => {
    if (isUserInteractingRef.current) return true;
    
    try {
      const activeElements = document.querySelectorAll(".ag-active, .ag-column-moving");
      return activeElements.length > 0;
    } catch {
      return false;
    }
  }, []);

  // ✅ Efficient row updates
  const updateChangedRows = useCallback(() => {
    if (!gridApi.current || isUserInteracting()) return;

    try {
      const prevSymbols = prevSymbolsRef.current;
      const changedRows: SymbolItem[] = [];

      for (const symbol in symbols) {
        const currentData = symbols[symbol];
        const prevData = prevSymbols[symbol];

        if (!prevData) {
          changedRows.push(currentData);
          continue;
        }

        // Compare important fields
        const hasChanged = (
          currentData.ltp !== prevData.ltp ||
          currentData.change !== prevData.change ||
          currentData.change_per !== prevData.change_per ||
          currentData.volume !== prevData.volume ||
          currentData.bid !== prevData.bid ||
          currentData.ask !== prevData.ask ||
          currentData.bidqty !== prevData.bidqty ||
          currentData.askqty !== prevData.askqty ||
          currentData.high !== prevData.high ||
          currentData.low !== prevData.low ||
          currentData.trades !== prevData.trades ||
          currentData.last_vol !== prevData.last_vol
        );

        if (hasChanged) {
          changedRows.push(currentData);
        }
      }

      if (changedRows.length > 0) {
        gridApi.current.applyTransaction({ update: changedRows });
      }

      prevSymbolsRef.current = { ...symbols };
    } catch (error) {
      console.warn('Error updating rows:', error);
    }
  }, [symbols, isUserInteracting]);

  // ✅ Throttled updates
  useEffect(() => {
    if (updateThrottleRef.current) {
      clearTimeout(updateThrottleRef.current);
    }

    updateThrottleRef.current = setTimeout(() => {
      updateChangedRows();
    }, 16); // ~60fps

    return () => {
      if (updateThrottleRef.current) {
        clearTimeout(updateThrottleRef.current);
      }
    };
  }, [updateChangedRows]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (updateThrottleRef.current) {
        clearTimeout(updateThrottleRef.current);
      }
    };
  }, []);

  // ✅ Column definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      field: "symbol",
      headerName: "Symbol",
      checkboxSelection: true,
      width: 120,
      pinned: "left",
      lockPinned: true,
      lockVisible: true,
    },
    { 
      field: "company_name", 
      headerName: "Company Name", 
      width: 200, 
      tooltipField: "company_name",
    },
    { field: "sector", headerName: "Sector", width: 120 },
    { field: "category", headerName: "Category", width: 120 },
    { 
      field: "coup_rate", 
      headerName: "Coup. Rate", 
      width: 100, 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "yield", 
      headerName: "Yield", 
      width: 80, 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "ltp", 
      headerName: "LTP", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber,
      enableCellChangeFlash: true,
    },
    { 
      field: "close", 
      headerName: "CP", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "ycp", 
      headerName: "YCP", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "volume", 
      headerName: "Vol", 
      width: 100, 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber,
      enableCellChangeFlash: true,
    },
    { 
      field: "change", 
      headerName: "Chg", 
      width: 80, 
      type: "numericColumn", 
      valueFormatter: formatNumber, 
      cellClass: getCellClass,
      enableCellChangeFlash: true,
    },
    { 
      field: "change_per", 
      headerName: "% Chg", 
      width: 80, 
      type: "numericColumn", 
      valueFormatter: formatPercentage, 
      cellClass: getCellClass,
      enableCellChangeFlash: true,
    },
    { 
      field: "bidqty", 
      headerName: "B.Qty", 
      width: 80, 
      cellClass: "bid-bg", 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber,
    },
    { 
      field: "bid", 
      headerName: "BID", 
      width: 90, 
      cellClass: "bid-bg", 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "ask", 
      headerName: "ASK", 
      width: 90, 
      cellClass: "ask-bg", 
      type: "numericColumn", 
      valueFormatter: formatNumber,
    },
    { 
      field: "askqty", 
      headerName: "A.Qty", 
      width: 80, 
      cellClass: "ask-bg", 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber,
    },
    { 
      field: "trades", 
      headerName: "Trades", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber 
    },
    { 
      field: "turnover", 
      headerName: "Turnover", 
      width: 110, 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber 
    },
    { 
      field: "open", 
      headerName: "Open", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber 
    },
    { 
      field: "high", 
      headerName: "High", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber 
    },
    { 
      field: "low", 
      headerName: "Low", 
      width: 90, 
      type: "numericColumn", 
      valueFormatter: formatNumber 
    },
    { 
      field: "last_vol", 
      headerName: "L.VOL", 
      width: 80, 
      type: "numericColumn", 
      valueFormatter: formatLargeNumber 
    },
  ], []);

  // ✅ Grid ready handler
  const onGridReady = useCallback((params: GridReadyEvent) => {
    try {
      gridApi.current = params.api;
      gridColumnApi.current = params.columnApi;
      
      // Set initial data
      prevSymbolsRef.current = { ...symbols };
      
      // Auto-size columns
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 100);
    } catch (error) {
      console.warn('Error in onGridReady:', error);
    }
  }, [symbols]);

  // ✅ Interaction handlers
  const handleUserInteraction = useCallback((duration: number = 100) => {
    isUserInteractingRef.current = true;
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, duration);
  }, []);

  const onColumnResized = useCallback(() => handleUserInteraction(200), [handleUserInteraction]);
  const onColumnMoved = useCallback(() => handleUserInteraction(200), [handleUserInteraction]);
  const onSortChanged = useCallback(() => handleUserInteraction(300), [handleUserInteraction]);

  // ✅ Default column definition
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 80,
    sortable: true,
    filter: true,
    resizable: true,
    suppressSizeToFit: false,
    enableCellChangeFlash: false,
  }), []);

  return (
    <div
      className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
      style={{ height: "800px", width: "100%" }}
    >
      <AgGridReact
        rowData={Object.values(symbols)}
        getRowId={(params) => params.data.symbol}
        headerHeight={32}
        rowHeight={30}
        deltaRowDataMode={true}
        immutableData={true}
        animateRows={false}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onColumnResized={onColumnResized}
        onColumnMoved={onColumnMoved}
        onSortChanged={onSortChanged}
        suppressRowClickSelection={true}
        suppressCellSelection={true}
        enableRangeSelection={false}
        suppressMenuHide={true}
        suppressLoadingOverlay={true}
        suppressNoRowsOverlay={true}
      />
    </div>
  );
};

export default React.memo(MarketWatch);