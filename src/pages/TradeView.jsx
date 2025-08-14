// default modules imports
import { DockviewReact } from 'dockview';
import { useRef } from 'react';
import { useTheme } from '../utilities/context/ThemeContext';

//custom modules imports
import Terminal from '../components/widgets/Terminal';
import Editor from '../components/widgets/Editor';
import Logs from '../components/widgets/Logs';

// default styles imports
import 'dockview/dist/styles/dockview.css';

const TradeView = () => {
    const dockviewRef = useRef(null);
    const { theme } = useTheme();
    
    const dockviewTheme = theme === 'dark'? 'dockview-theme-abyss' : 'dockview-theme-light';

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
        <div style={{ height: "899px" }} data-theme={theme}>
            <button onClick={addLogsPanel} className='my-2'>
                Add Logs Panel
            </button>

            <DockviewReact
                onReady={onReady}
                className={dockviewTheme} 
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