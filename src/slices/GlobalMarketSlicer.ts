import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define types for Market Health data
interface MarketHealth {
  total_turnover?: number;
  total_trade?: number;
  total_volume?: number;
  [key: string]: any; // allows additional dynamic keys if backend sends more
}

// ✅ Define state structure
interface GlobalMarketState {
  dse_mkt_health: MarketHealth;
  cse_mkt_health: MarketHealth;
}

// ✅ Initial state
const initialState: GlobalMarketState = {
  dse_mkt_health: {},
  cse_mkt_health: {},
};

const GlobalMarketSlice = createSlice({
  name: "mktHealth",
  initialState,
  reducers: {
    setDseMktHealth(state, action: PayloadAction<MarketHealth>) {
      state.dse_mkt_health = action.payload;
    },
    setCseMktHealth(state, action: PayloadAction<MarketHealth>) {
      state.cse_mkt_health = action.payload;
    },
    updateDseMktHealth(
      state,
      action: PayloadAction<{ mtvr: number; mt: number; mv: number }>
    ) {
      state.dse_mkt_health.total_turnover = action.payload.mtvr;
      state.dse_mkt_health.total_trade = action.payload.mt;
      state.dse_mkt_health.total_volume = action.payload.mv;
    },
    updateCseMktHealth(
      state,
      action: PayloadAction<{ mtvr: number; mt: number; mv: number }>
    ) {
      state.cse_mkt_health.total_turnover = action.payload.mtvr;
      state.cse_mkt_health.total_trade = action.payload.mt;
      state.cse_mkt_health.total_volume = action.payload.mv;
    },
  },
});

// ✅ Export actions
export const {
  setDseMktHealth,
  setCseMktHealth,
  updateDseMktHealth,
  updateCseMktHealth,
} = GlobalMarketSlice.actions;

// ✅ Export reducer
export default GlobalMarketSlice.reducer;
