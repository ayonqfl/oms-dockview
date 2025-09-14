import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Symbol entry type
interface SymbolEntry {
  ltp?: number;
  change?: number;
  change_per?: number;
  last_vol?: number;
  volume?: number;
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  cu?: number;  // upper circuit?
  cd?: number;  // lower circuit?
  vwap?: number;
  dh?: number;  // day high?
  dl?: number;  // day low?
  bid?: number;
  bidqty?: number;
  ask?: number;
  askqty?: number;
  [key: string]: any; // flexible for future props
}

// ✅ State type
interface SymbolsState {
  symbols: Record<string, SymbolEntry>;
  bbo_symbols: Record<string, SymbolEntry>;
}

// ✅ Payloads
interface UpdateLtpPayload {
  xc: "DSE" | "CSE";
  s: string;
  g: string;
  p: number;
  eq: number;
  ch: number;
  chp: number;
  tvl: number;
  tq: number;
  o: number;
  h: number;
  l: number;
  cu: number;
  cd: number;
  vwap: number;
  dh: number;
  dl: number;
}

interface UpdateBboPayload {
  s: string;
  g: string;
  bp: number;
  bq: number;
  ap: number;
  aq: number;
}

interface UpdateCpPayload {
  xc: "DSE" | "CSE";
  s: string;
  g: string;
  ch: number;
  chp: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

const initialState: SymbolsState = {
  symbols: {},
  bbo_symbols: {},
};

const symbolsSlicer = createSlice({
  name: "symbols",
  initialState,
  reducers: {
    setSymbols(state, action: PayloadAction<Record<string, SymbolEntry>>) {
      state.symbols = action.payload;
    },

    setGlobalBBO(state, action: PayloadAction<Record<string, SymbolEntry>>) {
      state.bbo_symbols = action.payload;
    },

    updateLtp(state, action: PayloadAction<UpdateLtpPayload>) {
      const { xc, s, g, p, eq, ch, chp, tvl, tq, o, h, l, cu, cd, vwap, dh, dl } =
        action.payload;
      const symbolKey = `${s}.${g}`;
      if (xc === "DSE" && state.symbols[symbolKey]) {
        const symbol = state.symbols[symbolKey];
        symbol.ltp = p;
        symbol.change = ch;
        symbol.change_per = chp;
        symbol.last_vol = eq;
        symbol.volume = tq;
        symbol.value = tvl;
        symbol.open = o;
        symbol.high = h;
        symbol.low = l;
        symbol.cu = cu;
        symbol.cd = cd;
        symbol.dh = dh;
        symbol.dl = dl;
        symbol.vwap = vwap;
      }
    },
 
    updateBBO(state, action: PayloadAction<UpdateBboPayload>) {
      const { s, g, bp, bq, ap, aq } = action.payload;
      const symbolKey = `${s}.${g}`;
      if (state.bbo_symbols[symbolKey]) {
        const symbol = state.bbo_symbols[symbolKey];
        symbol.bid = bp;
        symbol.bidqty = bq;
        symbol.ask = ap;
        symbol.askqty = aq;
      }
    },

    updateCp(state, action: PayloadAction<UpdateCpPayload>) {
      const { xc, s, g, ch, chp, o, h, l, c } = action.payload;
      const symbolKey = `${s}.${g}`;
      if (xc === "DSE" && state.symbols[symbolKey]) {
        const symbol = state.symbols[symbolKey];
        symbol.change = ch;
        symbol.change_per = chp;
        symbol.open = o;
        symbol.high = h;
        symbol.low = l;
        symbol.close = c;
      }
    },

    clearSymbols(state) {
      state.symbols = {};
    },
  },
});

export const {
  setSymbols,
  clearSymbols,
  updateLtp,
  updateBBO,
  updateCp,
  setGlobalBBO,
} = symbolsSlicer.actions;

export default symbolsSlicer.reducer;
