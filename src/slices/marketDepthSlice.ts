// marketDepthSlice.ts
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
  instances: Record<string, MarketDepthInstance>;
}

const initialState: MarketDepthState = {
  instances: {},
};

const marketDepthSlice = createSlice({
  name: "marketDepth",
  initialState,
  reducers: {
    // Simple instance management - just create/update instances as needed
    updateInstance: (state, action: PayloadAction<{ 
      id: string; 
      filters: MarketDepthFilters;
      data?: MarketDepthResponse | null;
      loading?: boolean;
      error?: string | null;
    }>) => {
      const { id, filters, data = null, loading = false, error = null } = action.payload;
      
      if (!state.instances[id]) {
        // Create new instance if it doesn't exist
        state.instances[id] = {
          id,
          filters,
          data,
          loading,
          error,
        };
      } else {
        // Update existing instance
        state.instances[id].filters = filters;
        if (data !== undefined) state.instances[id].data = data;
        if (loading !== undefined) state.instances[id].loading = loading;
        if (error !== undefined) state.instances[id].error = error;
      }
    },
    
    setInstanceLoading: (state, action: PayloadAction<{ 
      instanceId: string; 
      loading: boolean 
    }>) => {
      const { instanceId, loading } = action.payload;
      if (state.instances[instanceId]) {
        state.instances[instanceId].loading = loading;
      }
    },
    
    setInstanceError: (state, action: PayloadAction<{ 
      instanceId: string; 
      error: string | null 
    }>) => {
      const { instanceId, error } = action.payload;
      if (state.instances[instanceId]) {
        state.instances[instanceId].error = error;
      }
    },
    
    setInstanceData: (state, action: PayloadAction<{ 
      instanceId: string; 
      data: MarketDepthResponse 
    }>) => {
      const { instanceId, data } = action.payload;
      if (state.instances[instanceId]) {
        state.instances[instanceId].data = data;
        state.instances[instanceId].loading = false;
        state.instances[instanceId].error = null;
      }
    },
  },
});

export const {
  updateInstance,
  setInstanceLoading,
  setInstanceError,
  setInstanceData,
} = marketDepthSlice.actions;

export default marketDepthSlice.reducer;