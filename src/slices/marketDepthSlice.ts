import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define types inline here
export interface MarketDepthLevel {
  price: string;
  qty: number;
  hawala: string;
}

export interface MarketDepthResponse {
  data: {
    bid_levels: MarketDepthLevel[];
    ask_levels: MarketDepthLevel[];
    board: string;
    id: number;
    isin: string;
    last_update: string;
    price_decimals: number;
    sector: string;
    symbol: string;
  };
}

export interface MarketDepthFilters {
  exchange: string;
  symbol: string;
  sortBy: "price" | "quantity";
}

interface MarketDepthState {
  filters: MarketDepthFilters;
  data: MarketDepthResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: MarketDepthState = {
  filters: { exchange: "DSE", symbol: "1JANATAMF.PUBLIC", sortBy: "price" },
  data: null,
  loading: false,
  error: null,
};

const marketDepthSlice = createSlice({
  name: "marketDepth",
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<MarketDepthFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMarketDepthData: (state, action: PayloadAction<MarketDepthResponse>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
});

export const {
  updateFilters,
  setLoading,
  setError,
  setMarketDepthData,
  clearData,
} = marketDepthSlice.actions;

export default marketDepthSlice.reducer;
