// src/api/adminServer.ts
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

// ✅ Create Axios instance
const adminServer: AxiosInstance = axios.create({
  baseURL: window.APP_CONFIG.API_BASE_URL || "",
  headers: {
    Accept: "application/json",
  },
});

// ✅ Set Authorization token in headers
export const setAuthToken = (token: string | undefined) => {
  if (token) {
    adminServer.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete adminServer.defaults.headers.common["Authorization"];
  }
};

// ✅ Clear cookies function
export const clearCookies = () => {
  Cookies.remove("_jwtToken");
};

// ✅ Set cookies from auth response
export const setCookiesFromAuthResponse = (res: { access_token: string }) => {
  Cookies.set("_jwtToken", res.access_token);
  setAuthToken(res.access_token);
};

// ✅ Initialize token from cookie (on app start)
setAuthToken(Cookies.get("_jwtToken"));
export default adminServer;
