// useMarketDepth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { RootState } from '../store';
import { 
  updateInstance,
  setInstanceLoading,
  setInstanceError,
  setInstanceData,
  MarketDepthFilters 
} from '../slices/marketDepthSlice';
import { fetchMarketDepthData } from '../utilities/apiRequest/marketDepthAPI';

const MARKET_DEPTH_STORAGE_KEY = "marketDepth_instances";

export const useMarketDepth = (instanceId: string) => {
  const dispatch = useDispatch();
  const marketDepth = useSelector((state: RootState) => state.marketDepth);
  
  // Get current instance - create default if doesn't exist
  const currentInstance = useMemo(() => {
    if (!marketDepth.instances[instanceId]) {
      // Create default instance with filters from localStorage or defaults
      const savedInstances = localStorage.getItem(MARKET_DEPTH_STORAGE_KEY);
      let initialFilters: MarketDepthFilters = {
        exchange: "DSE", 
        symbol: "1JANATAMF.PUBLIC", 
        sortBy: "price"
      };
      
      if (savedInstances) {
        try {
          const instancesData = JSON.parse(savedInstances);
          if (instancesData[instanceId]) {
            initialFilters = instancesData[instanceId];
          }
        } catch (error) {
          console.error("Failed to load instance filters from localStorage:", error);
        }
      }
      
      dispatch(updateInstance({ 
        id: instanceId, 
        filters: initialFilters,
        loading: false,
        error: null
      }));
    }
    
    return marketDepth.instances[instanceId];
  }, [marketDepth.instances, instanceId, dispatch]);

  // Save instances to localStorage whenever instances change
  useEffect(() => {
    if (Object.keys(marketDepth.instances).length > 0) {
      const instancesToSave: Record<string, MarketDepthFilters> = {};
      Object.entries(marketDepth.instances).forEach(([id, instance]) => {
        instancesToSave[id] = instance.filters;
      });
      
      localStorage.setItem(MARKET_DEPTH_STORAGE_KEY, JSON.stringify(instancesToSave));
    }
  }, [marketDepth.instances]);

  // Fetch data for specific instance
  const fetchData = useCallback(async () => {
    if (!currentInstance) return;

    dispatch(setInstanceLoading({ instanceId, loading: true }));
    try {
      const data = await fetchMarketDepthData(currentInstance.filters);
      dispatch(setInstanceData({ instanceId, data }));
    } catch (error) {
      dispatch(setInstanceError({ 
        instanceId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [dispatch, instanceId, currentInstance]);

  // Update filters for specific instance
  const updateFilters = useCallback((filters: Partial<MarketDepthFilters>) => {
    const updatedFilters = { ...currentInstance.filters, ...filters };
    dispatch(updateInstance({ 
      id: instanceId, 
      filters: updatedFilters,
      loading: true, // Set loading when filters change
      data: currentInstance.data,
      error: currentInstance.error
    }));
  }, [dispatch, instanceId, currentInstance]);

  // Auto-fetch data when filters change
  useEffect(() => {
    if (currentInstance && currentInstance.loading) {
      fetchData();
    }
  }, [currentInstance?.filters, fetchData]);

  return {
    instance: currentInstance,
    updateFilters,
    fetchData,
  };
};