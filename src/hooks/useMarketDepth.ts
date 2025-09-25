import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState } from '../store';
import { 
  updateFilters, 
  setLoading, 
  setError, 
  setMarketDepthData,
  clearData,
  MarketDepthFilters 
} from '../slices/marketDepthSlice';
import { fetchMarketDepthData } from '../utilities/apiRequest/marketDepthAPI';

export const useMarketDepth = () => {
  const dispatch = useDispatch();
  const marketDepth = useSelector((state: RootState) => state.marketDepth);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await fetchMarketDepthData(marketDepth.filters);
      dispatch(setMarketDepthData(data));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [dispatch, marketDepth.filters]);

  // Update filters
  const updateMarketDepthFilters = useCallback((filters: Partial<MarketDepthFilters>) => {
    dispatch(updateFilters(filters));
  }, [dispatch]);

  // Clear data
  const clearMarketDepthData = useCallback(() => {
    dispatch(clearData());
  }, [dispatch]);

  // Auto-fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...marketDepth,
    updateFilters: updateMarketDepthFilters,
    fetchData,
    clearData: clearMarketDepthData
  };
};