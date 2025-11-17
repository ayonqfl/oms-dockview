// src/store/configSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfigState {
  data: null;
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
    setConfig(state, action: PayloadAction<any>) {
      state.data = action.payload;
      state.loaded = true;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;
