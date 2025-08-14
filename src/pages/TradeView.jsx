// default modules imports
import { DockviewReact } from 'dockview';
import { useRef, useState, useEffect } from 'react';

// custom modules imports
import Terminal from '../components/widgets/Terminal';
import Editor from '../components/widgets/Editor';
import Logs from '../components/widgets/Logs';

// default styles imports
import 'dockview/dist/styles/dockview.css';

const LAYOUT_STORAGE_KEY = 'tradeview_layout';

const TradeView = () => {
    const dockviewRef = useRef(null);
    const [api, setApi] = useState(null);

    // Save layout changes to localStorage
    useEffect(() => {
        if (!api) return;

        const disposable = api.onDidLayoutChange(() => {
            const layout = api.toJSON();
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
        });

        return () => disposable.dispose();
    }, [api]);

     // Load layout on startup
    const onReady = (event) => {
        dockviewRef.current = event.api;
        setApi(event.api);

        let success = false;
        const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);

        if (savedLayout) {
            try {
                const layout = JSON.parse(savedLayout);
                event.api.fromJSON(layout);
                success = true;
            } catch (err) {
                console.error('Failed to load saved layout:', err);
            }
        }

        if (!success) {
            // Load default layout if no saved state
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
        }
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