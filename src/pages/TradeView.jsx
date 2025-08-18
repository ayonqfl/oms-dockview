import { DockviewReact } from 'dockview';
import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../utilities/context/ThemeContext';
import { useOutletContext } from "react-router-dom";

import Terminal from '../components/widgets/Terminal';
import Watchlist from '../components/widgets/Watchlist';
import Logs from '../components/widgets/Logs';

const LAYOUT_STORAGE_KEY = 'tradeview_layout';

const TradeView = () => {
    const { addLogsTrigger } = useOutletContext(); // <-- get trigger from DashboardLayout
    const { theme } = useTheme();
    const dockviewRef = useRef(null);
    const [api, setApi] = useState(null);

    // Save layout changes
    useEffect(() => {
        if (!api) return;

        const disposable = api.onDidLayoutChange(() => {
            const layout = api.toJSON();
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
        });

        return () => disposable.dispose();
    }, [api]);

    useEffect(() => {
        if (!dockviewRef.current) return;

        const id = `logs-${Date.now()}`;
        dockviewRef.current.addPanel({
        id,
        component: 'logs',
        title: `Logs (${id.slice(-4)})`,
        });
    }, [addLogsTrigger]); // Add logs panel whenever trigger changes

    const dockviewTheme = theme === 'dark'? 'dockview-theme-dark' : 'dockview-theme-light';

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
            event.api.addPanel({ id: 'watchlist', component: 'watchlist', title: 'Watchlist' });
            event.api.addPanel({ id: 'terminal', component: 'terminal', title: 'Terminal' });
        }
    };

    return (
        <div style={{ height: "899px", marginTop: "103px", marginLeft: "60px" }} data-theme={theme}>
            <DockviewReact
                onReady={onReady}
                className={dockviewTheme}
                components={{
                    watchlist: () => <Watchlist />,
                    terminal: () => <Terminal />,
                    logs: () => <Logs />,
                }}
            />
        </div>
    );
};

export default TradeView;
