// custom styles imports
import "../styles/dashboard.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import adminServer from "../utilities/server/serverAdmin";
import { ALL_SYMBOL } from "../utilities/apiRequest/watchlist";
import { setSymbols } from "../slices/symbolsSlicer";
import errorHandler from "../utilities/errorHandler/errorHandler";

function Dashboard(): JSX.Element {
  const dispatch = useDispatch();

  useEffect(() => {
    getAllSymbols();
  }, []);

  // 🔹 Get All Symbols
  const getAllSymbols = () => {
    adminServer
      .get(ALL_SYMBOL + "?exchange=DSE")
      .then((response) => {
        let new_array: Record<string, any> = {};

        response.data.data.forEach((item: any) => {
          new_array[item.symbol] = {
            ...item,
            ltp: 0,
            change: null,
            change_per: null,
            volume: null,
            value: null,
            open: null,
            high: null,
            low: null,
            close: null,
            last_vol: null,
            dh: null,
            dl: null,
            cu: null,
            cd: null,
            bid: null,
            ask: null,
            bidqty: null,
            askqty: null,
          };
        });

        // Single dispatch, contains both general + BBO data
        dispatch(setSymbols(new_array));
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  return (
    <div>
      <h1>Dashboard is coming soon.</h1>
    </div>
  );
}

export default Dashboard;
