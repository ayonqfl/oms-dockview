import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../slices/userSlice";
import symbolsReducer from "../slices/symbolsSlicer";
import timeAndSalesReducer from "../slices/timeAndSalesSlicer";
import indexReducer from "../slices/indexSlicer";
import globalMarketReducer from "../slices/GlobalMarketSlicer";
import marketDepthReducer from "../slices/marketDepthSlice";  

// ✅ Create the store
const store = configureStore({
  reducer: {
    user: userReducer,
    symbols: symbolsReducer,
    timesales: timeAndSalesReducer,
    indexes: indexReducer,
    mktHealth: globalMarketReducer,
    marketDepth: marketDepthReducer,  
  },
});

// ✅ Infer types for RootState & AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
