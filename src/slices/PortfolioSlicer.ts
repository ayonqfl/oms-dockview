import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define portfolio entry type
interface PortfolioEntry {
  ltp?: number; // last traded price
  cp?: number;  // cost price (or closing price?)
  [key: string]: any; // allow extra fields if backend sends more
}

// ✅ Define state type
interface PortfolioState {
  portfolio: Record<string, PortfolioEntry>; // keyed by "symbol.group"
}

// ✅ Payloads
interface UpdateLtpPayload {
  xc: "DSE" | "CSE";
  s: string; // symbol
  g: string; // group
  p: number; // last traded price
}

interface UpdateCpPayload {
  xc: "DSE" | "CSE";
  s: string;
  g: string;
  c: number; // cost price (or closing price)
}

// ✅ Initial state
const initialState: PortfolioState = {
  portfolio: {},
};

const PortfolioSlicer = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setPortfolio(state, action: PayloadAction<Record<string, PortfolioEntry>>) {
      state.portfolio = action.payload;
    },

    updatePortfolioLtp(state, action: PayloadAction<UpdateLtpPayload>) {
      const { xc, s, g, p } = action.payload;
      const symbolKey = `${s}.${g}`;
      if (xc === "DSE" && state.portfolio[symbolKey]) {
        state.portfolio[symbolKey].ltp = p;
      }
    },

    updatePortfolioCp(state, action: PayloadAction<UpdateCpPayload>) {
      const { xc, s, g, c } = action.payload;
      const symbolKey = `${s}.${g}`;
      if (xc === "DSE" && state.portfolio[symbolKey]) {
        state.portfolio[symbolKey].cp = c;
      }
    },

    clearPortfolio(state) {
      state.portfolio = {};
    },
  },
});

export const {
  setPortfolio,
  clearPortfolio,
  updatePortfolioLtp,
  updatePortfolioCp,
} = PortfolioSlicer.actions;

export default PortfolioSlicer.reducer;
