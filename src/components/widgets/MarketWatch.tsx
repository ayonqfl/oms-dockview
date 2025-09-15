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

// ✅ Number formatters
const formatNumber = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return num.toFixed(decimals);
};

const formatLargeNumber = (value: any): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString();
};

const MarketWatch: React.FC = () => {
  const { theme } = useTheme();
  const gridApi = useRef<GridApi | null>(null);
  const gridColumnApi = useRef<ColumnApi | null>(null);
  const isUserInteractingRef = useRef(false);

  // ✅ now only one source of truth
  const symbols: Record<string, SymbolItem> = useSelector( (state: any) => state.symbols.symbols);

  // Check if user is interacting with grid headers
  const isUserInteracting = useCallback((): boolean => {
    const resizeHandles = document.querySelectorAll(".ag-header-cell-resize");
    const isResizing = Array.from(resizeHandles).some((handle) =>
      handle.classList.contains("ag-active")
    );

    const headerCells = document.querySelectorAll(".ag-header-cell");
    const isDragging = Array.from(headerCells).some((cell) =>
      cell.classList.contains("ag-column-moving")
    );

    return isResizing || isDragging || isUserInteractingRef.current;
  }, []);

  
  // 🔹 Update only changed rows
  useEffect(() => {
    if (!gridApi.current) return;
    if (isUserInteracting()) return;

    const updatedRows: SymbolItem[] = [];

    gridApi.current.forEachNode((node) => {
      const symbol = node.data.symbol;
      const newData = symbols[symbol];
      if (!newData) return;

      // compare shallowly – update only if some field has changed
      const hasChanged = Object.keys(newData).some(
        (key) => newData[key as keyof SymbolItem] !== node.data[key as keyof SymbolItem]
      );

      if (hasChanged) {
        updatedRows.push(newData);
      }
    });

    if (updatedRows.length > 0) {
      gridApi.current.applyTransactionAsync({ update: updatedRows });
    }
  }, [symbols, isUserInteracting]);


  // Column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "symbol",
        headerName: "Symbol",
        checkboxSelection: true,
        width: 130,
        pinned: "left",
        lockPinned: true,
        lockVisible: true,
      },
      { field: "company_name", headerName: "Company Name", width: 200, tooltipField: "company_name" },
      { field: "sector", headerName: "Sector", width: 120 },
      { field: "category", headerName: "Category", width: 120 },
      { field: "coup_rate", headerName: "Coup. Rate", width: 100, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "yield", headerName: "Yield", width: 80, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "ltp", headerName: "LTP", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "close", headerName: "CP", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "ycp", headerName: "YCP", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "volume", headerName: "Vol", width: 100, type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
      { field: "change", headerName: "Chg", width: 80, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2), cellClass: (p) => (p.value >= 0 ? "text-success" : "text-danger") },
      { field: "change_per", headerName: "% Chg", width: 80, type: "numericColumn", valueFormatter: (p) => (formatNumber(p.value, 2) ? `${formatNumber(p.value, 2)}%` : ""), cellClass: (p) => (p.value >= 0 ? "text-success" : "text-danger") },
      { field: "bidqty", headerName: "B.Qty", width: 80, cellClass: "bg-success", type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
      { field: "bid", headerName: "BID", width: 90, cellClass: "bg-success", type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "ask", headerName: "ASK", width: 90, cellClass: "bg-danger", type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "askqty", headerName: "A.Qty", width: 80, cellClass: "bg-danger", type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
      { field: "trades", headerName: "Trades", width: 90, type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
      { field: "turnover", headerName: "Turnover", width: 110, type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
      { field: "open", headerName: "Open", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "high", headerName: "High", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "low", headerName: "Low", width: 90, type: "numericColumn", valueFormatter: (p) => formatNumber(p.value, 2) },
      { field: "last_vol", headerName: "L.VOL", width: 80, type: "numericColumn", valueFormatter: (p) => formatLargeNumber(p.value) },
    ],
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApi.current = params.api;
    gridColumnApi.current = params.columnApi;
    params.api.sizeColumnsToFit();
  }, []);

  const onColumnResized = useCallback(() => {
    isUserInteractingRef.current = true;
    setTimeout(() => (isUserInteractingRef.current = false), 100);
  }, []);

  const onColumnMoved = useCallback(() => {
    isUserInteractingRef.current = true;
    setTimeout(() => (isUserInteractingRef.current = false), 100);
  }, []);

  const onSortChanged = useCallback(() => {
    isUserInteractingRef.current = true;
    setTimeout(() => (isUserInteractingRef.current = false), 100);
  }, []);

  return (
    <div
      className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
      style={{ height: "800px", width: "100%" }}
    >
      <AgGridReact
        rowData={Object.values(symbols)} // initial load
        getRowId={(params) => params.data.symbol}
        headerHeight={32}
        rowHeight={30}
        deltaRowDataMode={true}
        immutableData={true}
        animateRows={true}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onColumnResized={onColumnResized}
        onColumnMoved={onColumnMoved}
        onSortChanged={onSortChanged}
        defaultColDef={{
          flex: 1,
          minWidth: 80,
          sortable: true,
          filter: true,
          resizable: true,
          suppressSizeToFit: false,
          enableCellChangeFlash: true,
        }}
      />
    </div>
  );
};

export default MarketWatch;
