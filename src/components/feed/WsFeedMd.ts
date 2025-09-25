import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

// Redux slices
import { updateLtp, updateBBO} from "../../slices/symbolsSlicer";

// Type for the message received from worker
interface WorkerMessage {
  channel: string;
  msg: any;
}

const WsFeedMd: React.FC = () => {
  const dispatch = useDispatch();
  const workerRef = useRef<Worker | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create web worker
    workerRef.current = new Worker(
      new URL("../../workers/ws_worker_md.ts", import.meta.url),
      { type: "module" }
    );

    const handleWorkerMessage = (e: MessageEvent<WorkerMessage>) => {
      const { channel, msg } = e.data;

      // Dispatch directly without batching
      switch (channel) {
        case "ltp": 
          dispatch(updateLtp(msg));
          break;
        case "bbo":
          dispatch(updateBBO(msg));
          break;
        // case "dse_md_mktdepth_custom":
          
        //   break;
         
      }
    };

    workerRef.current.postMessage(["init"]);
    workerRef.current.onmessage = handleWorkerMessage;

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      initializedRef.current = false;
    };
  }, [dispatch]);

  return null;
};

export default WsFeedMd;
