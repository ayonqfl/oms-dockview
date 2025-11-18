// src/store/configSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChannelEntry {
  [key: string]: number;
}

interface ConfigState {
  active_md_channels: ChannelEntry;
  total_md_channels: number;
  active_fix_channels: ChannelEntry;
  total_fix_channels: number;
}

const initialState: ConfigState = {
  active_md_channels: {},
  active_fix_channels: {},
  total_md_channels: 0,
  total_fix_channels: 0
};

const channelSlicer = createSlice({
  name: "channels",
  initialState,
  reducers: {
    setInitialMdChannels(state, action: PayloadAction<{ active: ChannelEntry }>) {
      state.active_md_channels = action.payload.active;
      // total counter will be from key count 
      state.total_md_channels = Object.keys(action.payload.active).length;
    },
    setInitialFixChannels(state, action: PayloadAction<{ active: ChannelEntry }>) {
      state.active_fix_channels = action.payload.active;
      // total counter will be from key count 
      state.total_fix_channels = Object.keys(action.payload.active).length;
    },
    subscribeMdChannel(state, action: PayloadAction<{ channel: string }>) {
      const { channel } = action.payload;
      if (!state.active_md_channels[channel]) {
        state.active_md_channels[channel] = 1;
        state.total_md_channels += 1;
      }
      else
      {
        state.active_md_channels[channel] += 1;
      }
    },
    unsubscribeMdChannel(state, action: PayloadAction<{ channel: string }>) {
      const { channel } = action.payload; 
      if (state.active_md_channels[channel]) {
        state.active_md_channels[channel] -= 1;
        if (state.active_md_channels[channel] <= 0) {
          delete state.active_md_channels[channel];
          state.total_md_channels -= 1;
        }
      }
    },
    subscribeFixChannel(state, action: PayloadAction<{ channel: string }>) {
      const { channel } = action.payload;
      if (!state.active_fix_channels[channel]) {
        state.active_fix_channels[channel] = 1;
        state.total_fix_channels += 1;
      }
      else
      {
        state.active_fix_channels[channel] += 1;
      }
    },
    unsubscribeFixChannel(state, action: PayloadAction<{ channel: string }>) {
      const { channel } = action.payload; 
      if (state.active_fix_channels[channel]) {
        state.active_fix_channels[channel] -= 1;
        if (state.active_fix_channels[channel] <= 0) {
          delete state.active_fix_channels[channel];
          state.total_fix_channels -= 1;
        }
      }
    }

  },
});
export type { ChannelEntry };
export const { setInitialMdChannels, setInitialFixChannels, subscribeMdChannel, unsubscribeMdChannel, subscribeFixChannel, unsubscribeFixChannel } = channelSlicer.actions;
export default channelSlicer.reducer;
