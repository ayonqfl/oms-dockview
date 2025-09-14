import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { unstable_batchedUpdates } from 'react-dom';

// Redux slices
import { updateLtp, updateBBO, updateCp } from '../../slices/symbolsSlicer';
import { updateTimeSales } from '../../slices/timeAndSalesSlicer';
import { updateIndex } from '../../slices/indexSlicer';
import { updateDseMktHealth, updateCseMktHealth } from '../../slices/GlobalMarketSlicer';

// Type for the message received from worker
interface WorkerMessage {
  channel: string;
  msg: any;
}

const WsFeedMd: React.FC = () => {
  const dispatch = useDispatch();
  const workerRef = useRef<Worker | null>(null);
  const initializedRef = useRef(false);
  const batchedUpdatesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  // Batch multiple updates together to reduce the number of dispatches
  const batchUpdate = (channel: string, msg: any) => {
    pendingUpdatesRef.current.set(channel, msg);

    if (batchedUpdatesTimeoutRef.current) {
      clearTimeout(batchedUpdatesTimeoutRef.current);
    }

    batchedUpdatesTimeoutRef.current = setTimeout(() => {
      const updates = Array.from(pendingUpdatesRef.current.entries());
      pendingUpdatesRef.current.clear();

      if (updates.length > 0) {
        unstable_batchedUpdates(() => {
          updates.forEach(([channel, msg]) => {
            switch (channel) {
              case 'ltp':
                dispatch(updateLtp(msg));
                break;
              case 'bbo':
                dispatch(updateBBO(msg));
                break;
              // case 'cp':
              //   dispatch(updateCp(msg));
              //   break;
              // case 'timeSales':
              //   dispatch(updateTimeSales(msg));
              //   break;
              // case 'index':
              //   dispatch(updateIndex(msg));
              //   break;
              // case 'dseMktHealth':
              //   dispatch(updateDseMktHealth(msg));
              //   break;
              // case 'cseMktHealth':
              //   dispatch(updateCseMktHealth(msg));
              //   break;
            }
          });
        });
      }
    }, 16); // ~60fps batching
  };

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;

    // Create web worker
    workerRef.current = new Worker(
      new URL('../../workers/ws_worker_md.ts', import.meta.url),
      { type: 'module' }
    );

    const handleWorkerMessage = (e: MessageEvent<WorkerMessage>) => {
      const { channel, msg } = e.data;
      
      // Use batched updates to prevent excessive re-renders
      batchUpdate(channel, msg);
    };

    workerRef.current.postMessage(['init']);
    workerRef.current.onmessage = handleWorkerMessage;

    return () => {
      // Cleanup
      if (batchedUpdatesTimeoutRef.current) {
        clearTimeout(batchedUpdatesTimeoutRef.current);
      }
      
      workerRef.current?.terminate();
      workerRef.current = null;
      initializedRef.current = false;
      pendingUpdatesRef.current.clear();
    };
  }, []); // Empty dependency array - runs only once

  return null;
};

export default WsFeedMd;