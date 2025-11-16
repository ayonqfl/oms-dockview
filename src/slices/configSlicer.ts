// src/store/configSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConfig } from "@/config"; // adjust path

interface ConfigState {
  data: AppConfig | null;
  loaded: boolean;
}

const initialState: ConfigState = {
  data: null,
  loaded: false,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig(state, action: PayloadAction<AppConfig>) {
      state.data = action.payload;
      state.loaded = true;
      // Update adminServer baseURL when config changes
      // adminServer.reset();
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
