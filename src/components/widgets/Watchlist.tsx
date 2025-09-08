import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { useTheme } from "../../utilities/context/ThemeContext";

// ✅ Register all Community modules once
ModuleRegistry.registerModules([AllCommunityModule]);

const Watchlist: React.FC = () => {
  const gridApi = useRef<any>(null);
  const [rowData, setRowData] = useState<any[]>([]); 
  const { theme } = useTheme(); 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Column definitions (20+)
  const columnDefs = useMemo(() => [
    { headerName: 'Symbol', field: 'symbol', pinned: 'left', checkboxSelection: true, minWidth: 110 },
    { headerName: 'Name', field: 'name', minWidth: 160 },
    { headerName: 'Open', field: 'open', filter: 'agNumberColumnFilter', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'High', field: 'high', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Low', field: 'low', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Last Price', field: 'price', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Change', field: 'change', valueFormatter: p => p.value.toFixed(2),
      cellClass: p => p.value > 0 ? 'cell-up' : p.value < 0 ? 'cell-down' : '' },
    { headerName: '% Change', field: 'pctChange', valueFormatter: p => p.value ? `${p.value.toFixed(2)}%` : '' },
    { headerName: 'Volume', field: 'volume', valueFormatter: p => p.value.toLocaleString() },
    { headerName: 'Avg Volume', field: 'avgVolume', valueFormatter: p => p.value.toLocaleString() },
    { headerName: 'Market Cap', field: 'marketCap' },
    { headerName: 'P/E Ratio', field: 'pe', valueFormatter: p => p.value.toFixed(1) },
    { headerName: 'EPS', field: 'eps', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Dividend', field: 'dividend', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Yield %', field: 'yieldPct', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Beta', field: 'beta', valueFormatter: p => p.value.toFixed(2) },
    { headerName: 'Sector', field: 'sector' },
    { headerName: 'Exchange', field: 'exchange' },
    { headerName: 'Country', field: 'country' },
    { headerName: 'Currency', field: 'currency' },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  }), []);

  // Function to generate random stock data
  const generateStockData = () => {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Goods', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Entertainment', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial Services', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Goods', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'INTC', name: 'Intel Corp.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Goods', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'ACN', name: 'Accenture PLC', sector: 'Technology', exchange: 'NYSE', country: 'Ireland', currency: 'USD' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'TXN', name: 'Texas Instruments Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'DHR', name: 'Danaher Corp.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'LLY', name: 'Eli Lilly and Co.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Telecommunications', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'CMCSA', name: 'Comcast Corp.', sector: 'Telecommunications', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Goods', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'MDT', name: 'Medtronic PLC', sector: 'Healthcare', exchange: 'NYSE', country: 'Ireland', currency: 'USD' },
      { symbol: 'PM', name: 'Philip Morris International Inc.', sector: 'Consumer Goods', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'BMY', name: 'Bristol-Myers Squibb Co.', sector: 'Healthcare', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'HON', name: 'Honeywell International Inc.', sector: 'Industrial', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'RTX', name: 'Raytheon Technologies Corp.', sector: 'Aerospace & Defense', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'UPS', name: 'United Parcel Service Inc.', sector: 'Logistics', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'SBUX', name: 'Starbucks Corp.', sector: 'Consumer Services', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'T', name: 'AT&T Inc.', sector: 'Telecommunications', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'AXP', name: 'American Express Co.', sector: 'Financial Services', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Retail', exchange: 'NASDAQ', country: 'USA', currency: 'USD' },
      { symbol: 'BA', name: 'Boeing Co.', sector: 'Aerospace & Defense', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'IBM', name: 'International Business Machines Corp.', sector: 'Technology', exchange: 'NYSE', country: 'USA', currency: 'USD' },
      { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Financial Services', exchange: 'NYSE', country: 'USA', currency: 'USD' }
    ];

    return stocks.map(stock => {
      const basePrice = Math.random() * 500 + 10;
      const change = (Math.random() - 0.5) * 10;
      const price = basePrice + change;
      const pctChange = (change / basePrice) * 100;
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      return {
        ...stock,
        open: basePrice,
        high: basePrice + Math.random() * 5,
        low: basePrice - Math.random() * 5,
        price: price,
        change: change,
        pctChange: pctChange,
        volume: volume,
        avgVolume: Math.floor(volume * (0.8 + Math.random() * 0.4)),
        marketCap: `${(Math.random() * 500 + 10).toFixed(1)}B`,
        pe: Math.random() * 50 + 10,
        eps: Math.random() * 10,
        dividend: Math.random() * 3,
        yieldPct: Math.random() * 5,
        beta: Math.random() * 2
      };
    });
  };

  // Function to update prices dynamically
  const updatePrices = useCallback(() => {
    if (!gridApi.current) return;

    const updatedData = rowData.map(stock => {
      const change = (Math.random() - 0.5) * 2;
      const newPrice = stock.price + change;
      const pctChange = (change / stock.price) * 100;
      
      // Update high/low if needed
      const high = Math.max(stock.high, newPrice);
      const low = Math.min(stock.low, newPrice);
      
      return {
        ...stock,
        price: newPrice,
        change: change,
        pctChange: pctChange,
        high: high,
        low: low,
        volume: Math.floor(stock.volume * (1 + Math.random() * 0.1))
      };
    });

    // Batch update for better performance
    const transactions = {
      update: updatedData
    };
    
    gridApi.current.applyTransaction(transactions);
  }, [rowData]);

  const onGridReady = useCallback((params: any) => {
    gridApi.current = params.api;
    const initialData = generateStockData();
    setRowData(initialData);
  }, []);

  // Set up interval for dynamic updates
  useEffect(() => {
    if (rowData.length > 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set up new interval for price updates
      intervalRef.current = setInterval(updatePrices, 2000);
    }
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [rowData, updatePrices]);

  return (
    <div style={{ width: '100%' }}>
      <div
         className={theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
         style={{ width: "100%", overflow: "hidden" }}
      >
        <AgGridReact
          onGridReady={onGridReady}
          rowData={rowData}
          headerHeight={32}
          rowHeight={30}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}  
          rowSelection="multiple"
          getRowId={params => params.data.symbol}
          suppressHorizontalScroll={true}  
          enableCellChangeFlash={true}
          domLayout="autoHeight"   
        />
      </div>

      {/* Custom cell styles */}
      <style>{`
        .cell-up { color: #0f9d58; font-weight: 600; }
        .cell-down { color: #d93025; font-weight: 600; }
        .ag-cell-highlight {
          background-color: rgba(76, 175, 80, 0.2) !important;
          transition: background-color 0.5s;
        }
        .ag-cell-highlight-red {
          background-color: rgba(244, 67, 54, 0.2) !important;
          transition: background-color 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Watchlist;