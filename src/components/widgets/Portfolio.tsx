import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from "ag-grid-community";
import { useTheme } from "../../utilities/context/ThemeContext";
import adminServer from "../../utilities/server/serverAdmin";
import errorHandler from "../../utilities/errorHandler/errorHandler";

// ✅ Redux state shape
interface SymbolEntry {
  ltp?: number;
  [key: string]: any;
}
interface RootState {
  symbols: {
    symbols: Record<string, SymbolEntry>;
  };
}

// ✅ Props
interface PortfolioProps {
  clientCode: string;
}

// ✅ Portfolio item from backend
interface PortfolioItem {
  symbol: string;
  board: string;
  total_qty: number;
  saleable_qty: number;
  avg_cost: number;
  total_cost: number;
}

// ✅ Extended portfolio with computed fields
interface CalculatedPortfolioItem extends PortfolioItem {
  id: string; // Unique identifier for AG Grid
  ltp: number;
  mktValue: number;
  gain: number;
  gainPercent: number;
}

// ✅ Stable formatters defined outside component
const formatCurrency = (params: any) => {
  if (params?.value == null || params.value === "") return "0.00";
  const num = Number(params.value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const formatPrice = (params: any) => {
  if (params?.value == null || params.value === "") return "0.0";
  const num = Number(params.value);
  return isNaN(num) ? "0.0" : num.toFixed(1);
};

const formatPercentage = (params: any) => {
  if (params?.value == null || params.value === "") return "0.00%";
  const num = Number(params.value);
  return isNaN(num) ? "0.00%" : `${num.toFixed(2)}%`;
};

const formatInteger = (params: any) => {
  if (params?.value == null || params.value === "") return "0";
  const num = Number(params.value);
  return isNaN(num) ? "0" : Math.trunc(num).toString();
};

const getCellClass = (params: any) => {
  return params?.value >= 0 ? "text-success" : "text-danger";
};

// ✅ Hash generator for rows (lightweight diffing)
function hashRow(item: CalculatedPortfolioItem): string {
  return [
    item.ltp,
    item.mktValue,
    item.gain,
    item.gainPercent,
    item.total_qty,
    item.saleable_qty,
    item.avg_cost,
    item.total_cost,
  ].join("|");
}

function Portfolio({ clientCode }: PortfolioProps) {
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [displayedSymbols, setDisplayedSymbols] = useState<Record<string, number>>({});

  // ✅ Get symbol keys for portfolio items
  const symbolKeys = useMemo(() => 
    portfolio.map(item => `${item.symbol}.${item.board}`), 
    [portfolio]
  );

  // ✅ Optimized Redux selector - only get relevant symbols
  const relevantSymbols = useSelector((state: RootState) => {
    const result: Record<string, number> = {};
    symbolKeys.forEach(key => {
      result[key] = state.symbols.symbols[key]?.ltp || 0;
    });
    return result;
  }, shallowEqual);

  // ✅ Debounce symbol updates to prevent rapid re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedSymbols(relevantSymbols);
    }, 100); // Update only every 100ms
    
    return () => clearTimeout(timer);
  }, [relevantSymbols]);

  const gridApi = useRef<GridApi | null>(null);
  const gridColumnApi = useRef<ColumnApi | null>(null);
  const isUserInteractingRef = useRef(false);
  const prevHashRef = useRef<Record<string, string>>({});
  const frameRef = useRef<number>();

  useEffect(() => {
    if (clientCode) {
      adminServer
        .get(`/portfolio/${clientCode}`)
        .then((response) => {
          const portfolioData: PortfolioItem[] = response.data.data || [];
          setPortfolio(portfolioData);
        })
        .catch((error) => {
          console.error("Error fetching portfolio data:", error);
          errorHandler(error);
        });
    }
  }, [clientCode]);

  // ✅ Derived portfolio with computed values - uses debounced symbols
  const calculatedPortfolio: CalculatedPortfolioItem[] = useMemo(() => {
    return portfolio.map((item) => {
      const key = `${item.symbol}.${item.board}`;
      const ltp = displayedSymbols[key] || 0;
      const mktValue = ltp * item.total_qty;
      const gain = mktValue - item.total_cost;
      const gainPercent = item.total_cost > 0 ? (gain / item.total_cost) * 100 : 0;

      return {
        ...item,
        id: key,
        ltp,
        mktValue,
        gain,
        gainPercent,
      };
    });
  }, [portfolio, displayedSymbols]);

  // ✅ Calculate totals with for-loop (faster than reduce)
  const totals = useMemo(() => {
    let totalCost = 0,
      totalMktValue = 0,
      totalGain = 0;
    for (const item of calculatedPortfolio) {
      totalCost += item.total_cost;
      totalMktValue += item.mktValue;
      totalGain += item.gain;
    }
    return { totalCost, totalMktValue, totalGain };
  }, [calculatedPortfolio]);

  const totalGainPercent = totals.totalCost > 0 ? (totals.totalGain / totals.totalCost) * 100 : 0;

  // ✅ Create totals row
  const rowDataWithTotals = useMemo(() => {
    const totalsRow: CalculatedPortfolioItem = {
      id: "totals-row",
      symbol: "TOTAL",
      board: "",
      total_qty: 0,
      saleable_qty: 0,
      avg_cost: 0,
      total_cost: totals.totalCost,
      ltp: 0,
      mktValue: totals.totalMktValue,
      gain: totals.totalGain,
      gainPercent: totalGainPercent,
    };
    return [...calculatedPortfolio, totalsRow];
  }, [calculatedPortfolio, totals, totalGainPercent]);

  // ✅ Efficient row updates with hashing
  const updateChangedRows = useCallback(() => {
    if (!gridApi.current || isUserInteractingRef.current || calculatedPortfolio.length === 0) return;

    const prevHashes = prevHashRef.current;
    const changedRows: CalculatedPortfolioItem[] = [];

    // Normal rows
    for (const item of calculatedPortfolio) {
      const rowHash = hashRow(item);
      if (prevHashes[item.id] !== rowHash) {
        changedRows.push(item);
        prevHashes[item.id] = rowHash;
      }
    }

    // Totals row
    const totalsRow: CalculatedPortfolioItem = {
      id: "totals-row",
      symbol: "TOTAL",
      board: "",
      total_qty: 0,
      saleable_qty: 0,
      avg_cost: 0,
      total_cost: totals.totalCost,
      ltp: 0,
      mktValue: totals.totalMktValue,
      gain: totals.totalGain,
      gainPercent: totalGainPercent,
    };
    const totalsHash = hashRow(totalsRow);
    if (prevHashes["totals-row"] !== totalsHash) {
      changedRows.push(totalsRow);
      prevHashes["totals-row"] = totalsHash;
    }

    if (changedRows.length > 0) {
      gridApi.current.applyTransactionAsync({ update: changedRows });
    }
  }, [calculatedPortfolio, totals, totalGainPercent]);

  // ✅ Continuous animation frame for smooth updates
  useEffect(() => {
    if (!gridApi.current) return;
    
    const updateLoop = () => {
      updateChangedRows();
      frameRef.current = requestAnimationFrame(updateLoop);
    };
    
    frameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []); // Empty dependency - runs continuously but efficiently

  // ✅ Grid ready handler
  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApi.current = params.api;
      gridColumnApi.current = params.columnApi;

      // Initialize hash ref
      for (const item of rowDataWithTotals) {
        prevHashRef.current[item.id] = hashRow(item);
      }

      setTimeout(() => {
        params.api.sizeColumnsToFit();
      }, 100);
    },
    [rowDataWithTotals]
  );

  // ✅ Interaction handler
  const handleUserInteraction = useCallback((duration: number = 200) => {
    isUserInteractingRef.current = true;
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, duration);
  }, []);

  const onColumnResized = useCallback(() => handleUserInteraction(200), [handleUserInteraction]);
  const onColumnMoved = useCallback(() => handleUserInteraction(200), [handleUserInteraction]);
  const onSortChanged = useCallback(() => handleUserInteraction(300), [handleUserInteraction]);

  // ✅ Column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "symbol",
        headerName: "Symbol",
        width: 120,
        pinned: "left",
        lockPinned: true,
        lockVisible: true,
        cellRenderer: (params: any) => `${params.value}${params.data.board}`,
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "total_qty",
        headerName: "Total Qty",
        width: 100,
        type: "numericColumn",
        valueFormatter: (params: any) => (params.data.id === "totals-row" ? "" : formatInteger(params)),
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "saleable_qty",
        headerName: "Saleable",
        width: 100,
        type: "numericColumn",
        valueFormatter: (params: any) => (params.data.id === "totals-row" ? "" : formatInteger(params)),
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "avg_cost",
        headerName: "Avg Cost",
        width: 100,
        type: "numericColumn",
        valueFormatter: (params: any) => (params.data.id === "totals-row" ? "" : formatCurrency(params)),
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "total_cost",
        headerName: "Total Cost",
        width: 110,
        type: "numericColumn",
        valueFormatter: formatCurrency,
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "ltp",
        headerName: "Mkt Price",
        width: 100,
        type: "numericColumn",
        valueFormatter: (params: any) => (params.data.id === "totals-row" ? "" : formatPrice(params)),
        enableCellChangeFlash: true,
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "mktValue",
        headerName: "Mkt Value",
        width: 110,
        type: "numericColumn",
        valueFormatter: formatCurrency, 
        cellClass: (params: any) => (params.data.id === "totals-row" ? "fw-bold" : ""),
      },
      {
        field: "gain",
        headerName: "Gain",
        width: 100,
        type: "numericColumn",
        valueFormatter: formatCurrency,
        cellClass: (params: any) => {
          let classes = params.data.id === "totals-row" ? "fw-bold " : "";
          classes += getCellClass(params);
          return classes.trim();
        } 
      },
      {
        field: "gainPercent",
        headerName: "Gain %",
        width: 100,
        type: "numericColumn",
        valueFormatter: formatPercentage,
        cellClass: (params: any) => {
          let classes = params.data.id === "totals-row" ? "fw-bold " : "";
          classes += getCellClass(params);
          return classes.trim();
        } 
      },
    ],
    []
  );

  // ✅ Default column definition
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 80,
      sortable: true,
      filter: true,
      resizable: true,
      suppressSizeToFit: false,
      enableCellChangeFlash: false,
    }),
    []
  );

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      gridApi.current = null;
      gridColumnApi.current = null;
    };
  }, []);

  return (
    <div className="portfolio">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Portfolio {clientCode}</h6>
      </div>

      <div
        className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
        style={{ height: "600px", width: "100%" }}
      >
        <AgGridReact
          rowData={rowDataWithTotals}
          getRowId={(params) => params.data.id}
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
          getRowStyle={(params) => {
            if (params.data.id === "totals-row") {
              return {
                backgroundColor: params.api.getDisplayedRowCount() === params.rowIndex + 1 ? "" : "transparent",
                borderTop: "2px solid #dee2e6",
              };
            }
            return {};
          }}
        />
      </div>
    </div>
  );
}
 
export default Portfolio;