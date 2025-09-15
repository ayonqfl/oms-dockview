// src/workers/ws_worker_fix.ts

import MD5 from "crypto-js/md5";
import { io, Socket } from "socket.io-client";

// ✅ Generate auth token
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

// ✅ Field Definitions
const inbound_fields = ["oid", "em", "os", "et", "ap", "or", "sym", "lq", "q", "dq", "ot", "rid", "cq", "tif", "ac", "td", "cc", "uid", "cid"];
const broker_dealer_trade_field = ["did", "tv", "bv", "sv", "nv", "tvl", "bt", "st", "tt", "bo", "so", "to"];
const outbond_order_chache_field = ["ex", "oid", "otm", "cid", "os", "osd", "cc", "oin", "tid", "lr", "q", "dq", "ot", "uid", "rid", "cq", "et", "ac", "td"];
const cln_trades_field = ["did", "cid", "uid", "tv", "bv", "sv", "nv", "tvl", "bt", "st", "tt", "bo", "so", "to"];
const limit_request_field = ["id", "rd", "rb", "cc", "cn", "amt", "st", "fd", "ur", "ra"];
const notification_sync = ["id", "t", "d", "st"];
const temp_dealer_assign_request = ["id", "rd", "rb", "cc", "cd", "st"];
const announcement_field = ["tt", "tx", "ca"];

// ✅ State variables
let user_data: Record<string, any> = {};
let dealer_group_members: string[] = [];
let current_system_user_name: string | null = null;
let subscribed_channel: string[] = [];

// ✅ Channel definitions
interface ChannelConfig {
  fields?: string[];
  active: boolean;
}

const channel_and_fields: Record<string, ChannelConfig> = {
  broker_inbound_reject: { active: true },
  broker_order_reject: { active: true },
  broker_order_success: { active: true },
  broker_fix_status: { active: true },
  ordr_in: { active: true },
  ordr_out: { fields: outbond_order_chache_field, active: true },
  rms_update: { fields: ["update_type", "msg"], active: false },
  logout_all: { fields: ["device"], active: true },
  notification_sync: { fields: notification_sync, active: true },
  announcement: { fields: announcement_field, active: true },
};

// ✅ Socket
const node_socket_host = "https://ws-fix.quantbd.com/";

const socket: Socket = io(node_socket_host, {
  autoConnect: false,
  auth: { token },
});

// ✅ Connect / Disconnect
function connectToSocket() {
  if (socket.connected) {
    console.log("Socket is already connected");
    return;
  }
  socket.connect();
}

socket.on("connect", () => {
  console.log("Connected to Fix server " + node_socket_host);
  subscribed_channel = [];
  listen_active_channels();
});

// ✅ Channel Helpers
function activeInactiveChannel(channels: string | string[], status: boolean) {
  if (channels) {
    if (Array.isArray(channels)) {
      channels.forEach((channel) => {
        if (channel_and_fields.hasOwnProperty(channel)) {
          channel_and_fields[channel].active = status;
        }
      });
    } else {
      if (channel_and_fields.hasOwnProperty(channels)) {
        channel_and_fields[channels].active = status;
      }
    }

    if (!status) {
      unsubscribeToAllInactiveChannel();
    }
  }
}

function unsubscribeToAllInactiveChannel() {
  for (const channel in channel_and_fields) {
    const target_channel = channel_and_fields[channel];
    if (!target_channel.active) {
      if (subscribed_channel.includes(channel)) {
        socket.emit("unsubscribe", channel);
        socket.off(channel);
      }
      subscribed_channel = subscribed_channel.filter((ch) => ch !== channel);

      // ⚠️ Removed channel from channel_and_fields
      delete channel_and_fields[channel];
    }
  }
}

function listen_active_channels() {
  for (const channel in channel_and_fields) {
    const target_channel = channel_and_fields[channel];
    if (target_channel.active) {
      if (!subscribed_channel.includes(channel)) {
        socket.emit("subscribe", channel);
      }
      subscribed_channel.push(channel);
    }
  }
}

// ✅ Handle incoming data
socket.onAny((channel, msg) => {
  sendDataToMainTread(channel, msg);
});

// ✅ Worker Messages
onmessage = (msg: MessageEvent) => {
  const msg_type = msg.data[0];
  if (msg_type === "connect") {
    connectToSocket();
    console.log("WS FIX Channels Subscribed");
  }

  if (msg_type === "disconnect") {
    socket.disconnect();
    console.log("WS fix disconnected");
  }

  if (msg_type === "subscribe_custom_user_channel") {
    const current_user_data = msg.data[1];
    subscribeUserChannels(current_user_data);
  }
};

// ✅ Feed / Message Handling
function feed_throttle(msg: any, throttle_ms: number) {
  postMessage(msg);
}

function sendDataToMainTread(channel: string, msg: any) {
  let data_channel = channel;

  if (dealer_group_members.length > 0 && current_system_user_name) {
    if (channel.includes("ordr_in_")) {
      data_channel = "ordr_in_" + current_system_user_name;
    } else if (channel.includes("ordr_out_")) {
      data_channel = "ordr_out_" + current_system_user_name;
    } else if (channel.includes("dlr_trades_")) {
      data_channel = "dlr_trades_" + current_system_user_name;
    } else if (channel.includes("cln_trades_")) {
      data_channel = "cln_trades_" + current_system_user_name;
    }
  }

  if (channel.includes("announcement")) data_channel = "announcement";
  if (channel.includes("notification_sync")) data_channel = "notification_sync";

  const json_data = { channel: data_channel, msg: { value: msg } };
  feed_throttle(json_data, 0);
}

// ✅ Subscription Helpers
function subscribeUserChannels(u_data: any) {
  dealer_group_members = u_data.trader_group_members || [];
  current_system_user_name = u_data.system_username;

  activeInactiveChannel("broker_order_reject", false);

  const user_role = u_data.system_user_role;
  const system_username = u_data.system_username;

  addNewChannel(`announcement_${user_role}`, announcement_field, true);
  addNewChannel(`notification_sync_${user_role}`, notification_sync, true);

  if (user_role === "brokertrader") {
    activeInactiveChannel(["ordr_in", "ordr_out"], false);
    addTraderChannel(system_username, dealer_group_members);
  } else if (user_role === "associate") {
    activeInactiveChannel(["ordr_in", "ordr_out"], false);
    addAssociateChannel(system_username);
  } else if (user_role === "client") {
    activeInactiveChannel(["ordr_in", "ordr_out"], false);
    addClientsUsernameChannel(system_username);
  }

  if (["brokeradmin", "administrator", "brokerexec", "brokerccd", "brokerit"].includes(user_role)) {
    addNewChannel("send_limit", limit_request_field, true);
    addNewChannel("rms_update", ["update_type", "msg"], true);
    addNewChannel("update_limit", ["id", "status"], true);
    addNewChannel("temp_dealer_assign_req", temp_dealer_assign_request, true);
    addNewChannel("temp_dealer_update", ["id", "st"], true);
  }

  addCommonChannel(system_username);
  listen_active_channels();
}

function addCommonChannel(user_name: string) {
  addNewChannel("logout_user_" + user_name, ["user_name", "logout", "device"], true);
  addNewChannel("notification_sync_" + user_name, notification_sync, true);
  addNewChannel("broker_order_reject_" + user_name, ["username", "msg"], true);
  addNewChannel("broker_order_success_" + user_name, ["username", "msg"], true);
  addNewChannel("rms_update_limit_" + user_name, ["update_type", "msg"], true);
  addNewChannel("announcement_" + user_name, announcement_field, true);
}

function addClientsUsernameChannel(username: string) {
  addNewChannel("ordr_out_" + username, outbond_order_chache_field, true);
  addNewChannel("ordr_in_" + username, inbound_fields, true);
  addNewChannel("cln_trades_" + username, cln_trades_field, true);
}

function addTraderChannel(dealer_id: string, trader_group_members: string[]) {
  addNewChannel("ordr_in_" + dealer_id, inbound_fields, true);
  addNewChannel("dlr_trades_" + dealer_id, broker_dealer_trade_field, true);
  addNewChannel("cln_trades_" + dealer_id, cln_trades_field, true);
  addNewChannel("ordr_out_" + dealer_id, outbond_order_chache_field, true);

  trader_group_members.forEach((team_dealer_id) => {
    addNewChannel("ordr_in_" + team_dealer_id, inbound_fields, true);
    addNewChannel("ordr_out_" + team_dealer_id, outbond_order_chache_field, true);
  });
}

function addAssociateChannel(associate_id: string) {
  addNewChannel("ordr_in_" + associate_id, inbound_fields, true);
  addNewChannel("ordr_out_" + associate_id, outbond_order_chache_field, true);
  addNewChannel("cln_trades_" + associate_id, cln_trades_field, true);
}

function addNewChannel(key: string, fields: string[], status = true) {
  if (!channel_and_fields.hasOwnProperty(key)) {
    channel_and_fields[key] = { fields, active: status };
  }
}
