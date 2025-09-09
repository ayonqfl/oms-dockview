import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ Define index entry type
interface IndexEntry {
  index_value?: number;
  index_change?: number;
  index_changeper?: number;
  [key: string]: any; // allow flexibility if backend sends extra fields
}

// ✅ Define state type
interface IndexState {
  indexes: Record<string, IndexEntry>; // keyed by index name (DSE)
  cse_indexes: Record<string, IndexEntry>; // keyed by index name (CSE)
}

// ✅ Define payload for updateIndex
interface UpdateIndexPayload {
  in: string; // index name
  xc: "DSE" | "CSE"; // exchange code
  v: number; // index value
  ch: number; // index change
  chp: number; // index change percentage
}

// ✅ Initial state
const initialState: IndexState = {
  indexes: {},
  cse_indexes: {},
};

const indexSlicer = createSlice({
  name: "indexes",
  initialState,
  reducers: {
    setIndex(state, action: PayloadAction<Record<string, IndexEntry>>) {
      state.indexes = action.payload;
    },
    setCseIndex(state, action: PayloadAction<Record<string, IndexEntry>>) {
      state.cse_indexes = action.payload;
    },
    updateIndex(state, action: PayloadAction<UpdateIndexPayload>) {
      const key = action.payload.in;

      if (action.payload.xc === "DSE") {
        if (state.indexes[key]) {
          state.indexes[key].index_value = action.payload.v;
          state.indexes[key].index_change = action.payload.ch;
          state.indexes[key].index_changeper = action.payload.chp;
        }
      } else if (action.payload.xc === "CSE") {
        if (state.cse_indexes[key]) {
          state.cse_indexes[key].index_value = action.payload.v;
          state.cse_indexes[key].index_change = action.payload.ch;
          state.cse_indexes[key].index_changeper = action.payload.chp;
        }
      }
    },
  },
});

// ✅ Export actions
export const { setIndex, setCseIndex, updateIndex } = indexSlicer.actions;

// ✅ Export reducer
export default indexSlicer.reducer;
