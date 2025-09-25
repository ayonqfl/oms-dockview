import adminServer from "../../utilities/server/serverAdmin";
import { MarketDepthResponse } from "../../slices/marketDepthSlice";

export interface MarketDepthAPIParams {
  exchange: string;
  symbol: string; // e.g. "ACI.PUBLIC"
  sortBy: "price" | "quantity";
}

export const fetchMarketDepthData = async (
  params: MarketDepthAPIParams
): Promise<MarketDepthResponse> => {
  console.log("Fetching market depth data with params:", params);

  try {
    // Split symbol into symbol and board (e.g., "ACI.PUBLIC" → "ACI", "PUBLIC")
    const [mktSymbol, mktGroup] = params.symbol.split(".");

    const response = await adminServer.post("/market-data/depth", {
      exchange: params.exchange,
      symbol: mktSymbol,
      board: mktGroup,
    });

    console.log("Market depth data fetched:", response.data);

    return response.data as MarketDepthResponse;
  } catch (error) {
    console.error("Error fetching market depth data:", error);
    throw error;
  }
};
