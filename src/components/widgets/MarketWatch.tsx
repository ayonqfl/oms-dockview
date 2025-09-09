import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { useTheme } from "../../utilities/context/ThemeContext";
 
interface SymbolItem {
  symbol: string;
  company_name: string;
  ltp: number;
  change: number;
  change_per: number;
  volume: number;
  value: number;
  last_vol: number;
  close: number;
}

interface BBOItem {
  bid: number;
  bidqty: number;
  ask: number;
  askqty: number;
}

const MarketWatch: React.FC = () => {
  const { theme } = useTheme(); 
  // --- Get data from Redux ---
  const symbols = useSelector((state: any) => state.symbols.symbols);
  console.log("MarketWatch - symbols:", symbols);
  const bbos = useSelector((state: any) => state.symbols.bbo_symbols);

  // Convert symbols object to array and merge with BBO
  const rowData = useMemo(() => {
    return Object.values(symbols || {}).map((item: SymbolItem) => ({
      ...item,
      bid: bbos[item.symbol]?.bid || 0,
      bidqty: bbos[item.symbol]?.bidqty || 0,
      ask: bbos[item.symbol]?.ask || 0,
      askqty: bbos[item.symbol]?.askqty || 0,
    }));
  }, [symbols, bbos]);

  // Column definitions
  const columnDefs: ColDef[] = useMemo(() => [
    { field: 'symbol', headerName: 'Symbol', sortable: true, filter: true, resizable: true },
    { field: 'company_name', headerName: 'Name', sortable: true, filter: true, resizable: true },
    { field: 'ltp', headerName: 'Price', sortable: true, filter: true, resizable: true },
    {
      field: 'change',
      headerName: 'Change',
      sortable: true,
      filter: true,
      cellClass: (params) => (params.value >= 0 ? 'text-success' : 'text-danger'),
    },
    {
      field: 'change_per',
      headerName: 'Change %',
      sortable: true,
      filter: true,
      cellClass: (params) => (params.value >= 0 ? 'text-success' : 'text-danger'),
    },
    { field: 'bid', headerName: 'Bid', cellClass: 'bg-success' },
    { field: 'bidqty', headerName: 'Bid Qty', cellClass: 'bg-success' },
    { field: 'ask', headerName: 'Ask', cellClass: 'bg-danger' },
    { field: 'askqty', headerName: 'Ask Qty', cellClass: 'bg-danger' },
    { field: 'volume', headerName: 'Vol' },
    { field: 'value', headerName: 'TK' },
    { field: 'last_vol', headerName: 'Last Q' },
    { field: 'close', headerName: 'CP' },
  ], []);

  return (
    <div  className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"} style={{ height: '750px', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        rowSelection="single"
        animateRows={true}
        defaultColDef={{ flex: 1, minWidth: 80 }}
      />
    </div>
  );
};

export default MarketWatch;
