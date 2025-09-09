import { createSlice } from '@reduxjs/toolkit';

interface TimeSaleItem {
  ltp: number;
  symbol: string;
  board: string;
  exchange: string;
  qty: number;
  time: string | number;
  change: number;
  change_per: number;
  side: string;
}

interface TimeAndSalesState {
  time_and_sales: TimeSaleItem[];
}

const initialState: TimeAndSalesState = {
  time_and_sales: [],
};

const timeAndSalesSlice = createSlice({
  name: 'timeAndSales',
  initialState,
  reducers: {
    updateTimeSales(state, action) {
      const msg = action.payload;

      const latestLtp: TimeSaleItem = {
        ltp: msg.p,
        symbol: msg.s,
        board: msg.g,
        exchange: msg.xc,
        qty: msg.eq,
        time: msg.t,
        change: msg.ch,
        change_per: msg.chp,
        side: msg.sd,
      };

      // keep max 50
      if (state.time_and_sales.length >= 50) {
        state.time_and_sales.pop();
      }

      // add new item to beginning
      state.time_and_sales.unshift(latestLtp);
    },
  },
});

export const { updateTimeSales } = timeAndSalesSlice.actions;
export default timeAndSalesSlice.reducer;
