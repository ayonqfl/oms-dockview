import adminServer from '../server/adminServer';
import { ALL_SYMBOL } from '../apiRequest/watchlist';
import {
  setSymbols,
  setGlobalBBO,
} from '../../slices/symbolsSlice';
import {
  setIndex,
  setCseIndex,
} from '../../slices/indexSlicer';
import {
  setDseMktHealth,
  setCseMktHealth,
} from '../../slices/GlobalMarketSlicer';
import errorHandler from '../errorHandler';

/**
 * Load all symbols from exchange and dispatch updates
 */
export const loadAllSymbols = async (dispatch, exchange = 'DSE') => {
  try {
    const res = await adminServer.get(`${ALL_SYMBOL}?exchange=${exchange}`);
    let symbols = {};
    let bbo = {};

    res.data.data.forEach(item => {
      symbols[item.symbol] = {
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
      };

      bbo[item.symbol] = {
        ...item,
        bid: null,
        ask: null,
        bidqty: null,
        askqty: null,
      };
    });

    dispatch(setSymbols(symbols));
    dispatch(setGlobalBBO(bbo));
  } catch (err) {
    errorHandler(err);
  }
};


/**
 * Load index data for DSE or CSE
 */
export const loadIndexes = async (dispatch, exchange) => {
  try {
    const res = await adminServer.get(`market-data/index-value?exchange=${exchange}`);
    let indexes = {};
    res.data.data.forEach(item => {
      indexes[item.index_name] = item;
    });

    if (exchange === 'DSE') dispatch(setIndex(indexes));
    else dispatch(setCseIndex(indexes));
  } catch (err) {
    errorHandler(err);
  }
};


/**
 * Load market health for a given exchange
 */
export const loadMarketHealth = async (dispatch, exchange) => {
  try {
    const res = await adminServer.get(`/market-data/trade-info?exchange=${exchange}`);
    const data = res.data.data;

    if (exchange === 'DSE') dispatch(setDseMktHealth(data));
    else dispatch(setCseMktHealth(data));
  } catch (err) {
    errorHandler(err);
  }
};
