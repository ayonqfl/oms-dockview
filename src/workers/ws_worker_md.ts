// src/workers/ws_worker_md.ts
import MD5 from "crypto-js/md5";
import { io, Socket } from "socket.io-client";

interface ChannelConfig {
  fields: string[];
  active: boolean;
}

// ✅ Generate daily token
const generateToken = (): string => {
  const offset = 6; // UTC+6
  const date = new Date();
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const localDate = new Date(utcDate.getTime() + offset * 3600000);
  const formattedDate = localDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const tokenString = "QUANT+" + formattedDate;
  return MD5(tokenString).toString();
};

const token = generateToken();
const node_socket_md_host = "https://ws-md.uftcl.com"; // <-- Replace with your actual host

let channel_and_fields: Record<string, ChannelConfig> = {
  bbo: { fields: ["bbo"], active: true },
  cse_bbo: { fields: ["bbo"], active: true },
  dse_md_suspended: { fields: ["isin", "symbol", "group"], active: true },
  cp: { fields: [], active: true },
  ltp: { fields: ["ltp"], active: true },
  cse_ltp: { fields: ["ltp"], active: true },
  news: { fields: ["nd", "nr", "nt", "ntx", "ntp"], active: true },
  index: { fields: ["index"], active: true },
  cse_index: { fields: ["index"], active: true },
  mktevent: { fields: ["s", "g", "e", "et", "st"], active: true },
  cse_mktevent: { fields: ["s", "g", "e", "et", "st"], active: true },
  dse_md_news_status: { fields: ["engine_name", "status"], active: true },
  dse_md_index_status: { fields: ["engine_name", "status"], active: true },
  mkt_status: { fields: ["mkt_status"], active: true },
  mkt_status_cse: { fields: ["mkt_status"], active: true },
  adv_dcl: { fields: ["adv_dcl"], active: true },
  cse_adv_dcl: { fields: ["adv_dcl"], active: true },
  index_chart: { fields: ["index"], active: true },
  dse_md_mktdepth_custom: { fields: ["symbol", "data"], active: true },
//   cse_health: { fields: ["adv_dcl"], active: true },
//   dse_health: { fields: ["index"], active: true },
};

let subscribed_channel: string[] = [];

const socket: Socket = io(node_socket_md_host, {
  autoConnect: false,
  auth: { token },
});

// -------------------- SOCKET CONNECTION --------------------
function connectToSocket() {
  if (socket.connected) {
    console.log("Socket already connected");
    return;
  }
  socket.connect();
}

socket.on("connect", () => {
  console.log("Connected to MD server " + node_socket_md_host);
  subscribed_channel = [];
  listen_active_channels();
});

socket.on("disconnect", () => {
  console.log("Disconnected from MD server " + node_socket_md_host);
});

socket.onAny((channel, msg) => {
  sendDataToMainThread(channel, msg);
});

// -------------------- CHANNEL HANDLING --------------------
function activeInactiveChannel(channels: string | string[], status: boolean) {
  const arr = Array.isArray(channels) ? channels : [channels];
  arr.forEach((channel) => {
    if (channel_and_fields[channel]) {
      channel_and_fields[channel].active = status;
    }
  });
  if (!status) unsubscribeToAllInactiveChannel();
}

function listen_active_channels() {
  for (const channel in channel_and_fields) {
    const target = channel_and_fields[channel];
    if (target.active && !subscribed_channel.includes(channel)) {
      socket.emit("subscribe", channel);
      subscribed_channel.push(channel);
    }
  }
}

function unsubscribeToAllInactiveChannel() {
  for (const channel in channel_and_fields) {
    const target = channel_and_fields[channel];
    if (!target.active && subscribed_channel.includes(channel)) {
      socket.emit("unsubscribe", channel);
      socket.off(channel);
      subscribed_channel = subscribed_channel.filter((ch) => ch !== channel);
      delete channel_and_fields[channel];
    }
  }
}

// -------------------- MESSAGE FROM MAIN THREAD --------------------
onmessage = (e: MessageEvent) => {
  const [msg_type, ...args] = e.data;

  switch (msg_type) {
    case "init":
      console.log("Worker initialized");
      connectToSocket();
      break;

    case "subscribe_to_mkt_depth_channel":
      subscribeMarketDepthChannels(args[0]);
      break;

    case "subscribe_unsubscribe_ticker_channel":
      subUnsubTickerChannel(args[0], args[1]);
      break;

    case "subscribe_time_sales_symbol_channel":
      subscribeTimeSalesCh(args[0]);
      break;

    case "unsubscribe_time_sales_symbol_channel":
      unsubscribeTimeSalesCh();
      break;

    case "sub_unsub_channel":
      subcribeUnsubscribeCustomChannel(args[0], args[1]);
      break;
  }
};

// -------------------- SUBSCRIBE HELPERS --------------------
function subscribeMarketDepthChannels(marketDepthChannels: string[]) {
  const existing = subscribed_channel.filter((ch) => ch.includes("md_mktdepth_"));
  const subscribedSet = new Set(existing);

  for (const ch of marketDepthChannels) {
    if (!subscribedSet.has(ch)) {
      subscribedSet.add(ch);
      addNewChannel(ch, [], true);
    }
  }
  const toUnsub = existing.filter((ch) => !marketDepthChannels.includes(ch));
  if (toUnsub.length) activeInactiveChannel(toUnsub, false);

  listen_active_channels();
}

function subUnsubTickerChannel(sub: boolean, ch: string) {
  if (sub && !subscribed_channel.includes(ch)) addNewChannel(ch, [], true);
  else if (!sub) activeInactiveChannel(ch, false);
  listen_active_channels();
}

function subscribeTimeSalesCh(channels: string[]) {
  const existing = subscribed_channel.filter((ch) => ch.includes("_tmsl_"));
  const subscribedSet = new Set(existing);

  for (const ch of channels) {
    if (!subscribedSet.has(ch)) {
      subscribedSet.add(ch);
      addNewChannel(ch, [], true);
    }
  }

  const toUnsub = existing.filter((ch) => !channels.includes(ch));
  if (toUnsub.length) activeInactiveChannel(toUnsub, false);

  listen_active_channels();
}

function unsubscribeTimeSalesCh() {
  const existing = subscribed_channel.filter((ch) => ch.includes("_tmsl_"));
  if (existing.length > 0) activeInactiveChannel(existing, false);
  listen_active_channels();
}

function subcribeUnsubscribeCustomChannel(channel: string, flag: boolean) {
  if (flag && !subscribed_channel.includes(channel)) {
    addNewChannel(channel, [], true);
  } else if (!flag && subscribed_channel.includes(channel)) {
    activeInactiveChannel(channel, false);
  }
  listen_active_channels();
}

// -------------------- DATA HANDLERS --------------------
function feed_throttle(msg: unknown) {
  postMessage(msg);
}

function sendDataToMainThread(channel: string, msg: any) {
  if (channel === "ltp" || channel === "cse_ltp") {
    parserObject(msg, "ltp", handle_ltp_data);
    return;
  }
  if (channel === "bbo" || channel === "cse_bbo") {
    parserObject(msg, "bbo", handle_bbo_data);
    return;
  }
  if (channel === "index" || channel === "cse_index") {
    parserObject(msg, "index", handle_index_data);
    return;
  }
  if (channel === "index_chart") {
    parserObject(msg, "index", handle_index_chart_data);
    return;
  }

  let data_channel = channel.includes("md_mktdepth_")
    ? "dse_md_mktdepth_custom"
    : channel.includes("_tmsl_")
    ? "time_sales_symbol_ticker"
    : channel;

  feed_throttle({ channel: data_channel, msg: { value: msg } });
}

function addNewChannel(key: string, fields: string[], status = true) {
  if (!channel_and_fields[key]) {
    channel_and_fields[key] = { fields, active: status };
  }
}

// -------------------- SPECIFIC DATA HANDLERS --------------------
function handle_ltp_data(msg: any) {
  feed_throttle({ channel: "ltp", msg });
  feed_throttle({
    channel: "market_health",
    msg: {
      exchange: msg.xc,
      market_turnover: msg.mtvr,
      market_buy_percent: parseFloat(msg.by),
      market_sell_percent: parseFloat(msg.sl),
      market_trade: parseFloat(msg.mt),
      market_volume: msg.mv,
    },
  });
  feed_throttle({ channel: "live_chart", msg });

  if (["PUBLIC", "SPUBLIC"].includes(msg.g)) {
    feed_throttle({
      channel: "protfolio_update_ltp",
      msg: { symbol: msg.s, board: msg.g, exchange: msg.xc, ltp: parseFloat(msg.p) },
    });
  }
}

function handle_bbo_data(msg: any) {
  feed_throttle({ channel: "bbo", msg });
}
function handle_index_data(msg: any) {
  feed_throttle({ channel: "index", msg });
}
function handle_index_chart_data(msg: any) {
  feed_throttle({ channel: "index_chart", msg });
}

function parserObject(msg: any, propertyName: string, parseFn: (data: any) => void) {
  let parsed;

  try {
    // Check if it's a string, then parse
    parsed = typeof msg[propertyName] === "string"
      ? JSON.parse(msg[propertyName])
      : msg[propertyName]; // already object
  } catch (err) {
    console.error("Failed to parse:", msg[propertyName], err);
    return;
  }

  if (parsed && Object.keys(parsed).length > 0) {
    Object.keys(parsed).forEach((key) => parseFn(parsed[key]));
  }
}
