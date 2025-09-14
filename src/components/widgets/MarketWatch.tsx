import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
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

interface BBOData {
  [symbol: string]: {
    bid: number;
    bidqty: number;
    ask: number;
    askqty: number;
  };
}

// Helper function to safely format numbers
const formatNumber = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return num.toFixed(decimals);
};

// Helper function to format large numbers with commas
const formatLargeNumber = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return num.toLocaleString();
};

const MarketWatch: React.FC = () => {
  const { theme } = useTheme();
  const gridApi = useRef<GridApi | null>(null);
  const gridColumnApi = useRef<ColumnApi | null>(null);
  const [rowDataState, setRowDataState] = useState<SymbolItem[]>([]);
  const isUserInteractingRef = useRef(false);

  const symbols: Record<string, SymbolItem> = useSelector(
    (state: any) => state.symbols.symbols
  );
  const bbos: BBOData = useSelector((state: any) => state.symbols.bbo_symbols);

  // Merge symbols + BBO and update state
  useEffect(() => {
    const newRowData = (Object.values(symbols || {}) as SymbolItem[]).map((item) => ({
      ...item,
      bid: bbos[item.symbol]?.bid || 0,
      bidqty: bbos[item.symbol]?.bidqty || 0,
      ask: bbos[item.symbol]?.ask || 0,
      askqty: bbos[item.symbol]?.askqty || 0,
    }));
    setRowDataState(newRowData);
  }, [symbols, bbos]);

  // Check if user is currently interacting with columns
  const isUserInteracting = useCallback((): boolean => {
    // Check for resize handles
    const resizeHandles = document.querySelectorAll('.ag-header-cell-resize');
    const isResizing = Array.from(resizeHandles).some(handle => 
      handle.classList.contains('ag-active')
    );
    
    // Check for column dragging
    const headerCells = document.querySelectorAll('.ag-header-cell');
    const isDragging = Array.from(headerCells).some(cell => 
      cell.classList.contains('ag-column-moving')
    );
    
    return isResizing || isDragging || isUserInteractingRef.current;
  }, []);

  // Update only visible rows without interfering with column operations
  useEffect(() => {
    if (!gridApi.current) return;

    // Don't update if user is interacting with columns
    if (isUserInteracting()) {
      return;
    }

    const api = gridApi.current;
    const visibleNodes = api.getRenderedNodes();

    const updatedRows: SymbolItem[] = [];

    visibleNodes.forEach((node) => {
      const newData = rowDataState.find((row) => row.symbol === node.data.symbol);
      if (newData) {
        let changed = false;
        for (const key in newData) {
          if (newData[key as keyof SymbolItem] !== node.data[key as keyof SymbolItem]) {
            changed = true;
            break;
          }
        }
        if (changed) {
          updatedRows.push(newData);
        }
      }
    });

    if (updatedRows.length > 0) {
      api.applyTransactionAsync({ update: updatedRows });
    }
  }, [rowDataState, isUserInteracting]);

  // Column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      { 
        field: "symbol", 
        headerName: "Symbol", 
        checkboxSelection: true, 
        width: 120,
        pinned: 'left',
        lockPinned: true,
        lockVisible: true
      },
      { 
        field: "company_name", 
        headerName: "Company Name", 
        width: 200,
        tooltipField: 'company_name'
      },
      { field: "sector", headerName: "Sector", width: 120 },
      { field: "category", headerName: "Category", width: 120 },
      { 
        field: "coup_rate", 
        headerName: "Coup. Rate", 
        width: 100,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "yield", 
        headerName: "Yield", 
        width: 80,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "ltp", 
        headerName: "LTP", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "close", 
        headerName: "CP", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "ycp", 
        headerName: "YCP", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "volume", 
        headerName: "Vol", 
        width: 100, 
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
      {
        field: "change",
        headerName: "Chg",
        width: 80,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2),
        cellClass: (params) =>
          params.value >= 0 ? "text-success" : "text-danger",
      },
      {
        field: "change_per",
        headerName: "% Chg",
        width: 80,
        type: "numericColumn",
        valueFormatter: (params) => {
          const formatted = formatNumber(params.value, 2);
          return formatted ? `${formatted}%` : '';
        },
        cellClass: (params) =>
          params.value >= 0 ? "text-success" : "text-danger",
      },
      {
        field: "bidqty",
        headerName: "B.Qty",
        width: 80,
        cellClass: "bg-success",
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
      {
        field: "bid",
        headerName: "BID",
        width: 90,
        cellClass: "bg-success",
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      {
        field: "ask",
        headerName: "ASK",
        width: 90,
        cellClass: "bg-danger",
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      {
        field: "askqty",
        headerName: "A.Qty",
        width: 80,
        cellClass: "bg-danger",
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
      { 
        field: "trades", 
        headerName: "Trades", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
      {
        field: "turnover",
        headerName: "Turnover",
        width: 110,
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
      { 
        field: "open", 
        headerName: "Open", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "high", 
        headerName: "High", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "low", 
        headerName: "Low", 
        width: 90, 
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value, 2)
      },
      { 
        field: "last_vol", 
        headerName: "L.VOL", 
        width: 80, 
        type: "numericColumn",
        valueFormatter: (params) => formatLargeNumber(params.value)
      },
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
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  }, []);

  const onColumnMoved = useCallback(() => {
    isUserInteractingRef.current = true;
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  }, []);

  const onSortChanged = useCallback(() => {
    isUserInteractingRef.current = true;
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  }, []);

  return (
    <div
      className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
      style={{ height: "500px", width: "100%" }}
    >
      <AgGridReact
        rowData={rowDataState}
        getRowId={(params) => params.data.symbol}
        deltaRowDataMode={true}
        headerHeight={32}
        rowHeight={30}
        columnDefs={columnDefs}
        animateRows={true}
        immutableData={true}
        rowSelection="multiple"
        suppressHorizontalScroll={false}
        enableCellChangeFlash={true}
        domLayout="normal"
        defaultColDef={{
          flex: 1,
          minWidth: 80,
          sortable: true,
          filter: true,
          resizable: true,
          suppressSizeToFit: false,
          enableCellChangeFlash: true,
        }}
        onGridReady={onGridReady}
        onColumnResized={onColumnResized}
        onColumnMoved={onColumnMoved}
        onSortChanged={onSortChanged}
        suppressColumnVirtualisation={true}
        suppressRowClickSelection={true}
        stopEditingWhenCellsLoseFocus={true}
      />
    </div>
  );
};

export default MarketWatch;