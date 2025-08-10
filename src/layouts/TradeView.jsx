import { DockviewReact } from 'dockview';
import { useRef } from 'react';

import Terminal from '../components/common/Terminal';
import Editor from '../components/common/Editor';
import Logs from '../components/common/Logs';

import 'dockview/dist/styles/dockview.css';

const TradeView = () => {
    const dockviewRef = useRef(null);

    const onReady = (event) => {
        dockviewRef.current = event.api;

        event.api.addPanel({
            id: 'editor',
            component: 'editor',
            title: 'Editor',
        });

        event.api.addPanel({
            id: 'terminal',
            component: 'terminal',
            title: 'Terminal',
        });
    };

    const addLogsPanel = () => {
        const id = `logs-${Date.now()}`;
        dockviewRef.current.addPanel({
            id,
            component: 'logs',
            title: `Logs (${id.slice(-4)})`,
        });
    };

    return (
        <div style={{height: "899px"}}>
            <button onClick={addLogsPanel} className='my-2'>
                Add Logs Panel
            </button>

            <DockviewReact
                onReady={onReady}
                className="dockview-theme-abyss"
                components={{
                    editor: () => <Editor />,
                    terminal: () => <Terminal />,
                    logs: () => <Logs />,
                }}
            />
        </div>
    );
};

export default TradeView;