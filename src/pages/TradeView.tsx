import { DockviewReact, DockviewApi, DockviewComponentProps } from "dockview";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "../utilities/context/ThemeContext";
import { useOutletContext } from "react-router-dom";
import { DockviewHeaderControls } from "../components/docview/DockviewHeaderControls";

import Terminal from "../components/widgets/Terminal";
import Watchlist from "../components/widgets/Watchlist";
import Logs from "../components/widgets/Logs";

const LAYOUT_STORAGE_KEY = "tradeview_layout";

interface OutletContextType {
  addLogsTrigger: number; // adjust type if your trigger is different
}

const TradeView = (): JSX.Element => {
  const { addLogsTrigger } = useOutletContext<OutletContextType>();
  const { theme } = useTheme();

  const dockviewRef = useRef<DockviewApi | null>(null);
  const [api, setApi] = useState<DockviewApi | null>(null);

  // Save layout changes
  useEffect(() => {
    if (!api) return;

    const disposable = api.onDidLayoutChange(() => {
      const layout = api.toJSON();
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    });

    return () => disposable.dispose();
  }, [api]);

  // Add logs panel whenever trigger changes
  useEffect(() => {
    if (!dockviewRef.current) return;

    const id = `logs-${Date.now()}`;
    dockviewRef.current.addPanel({
      id,
      component: "logs",
      title: `Logs (${id.slice(-4)})`,
    });
  }, [addLogsTrigger]);

  const dockviewTheme = theme === "dark" ? "dockview-theme-dark" : "dockview-theme-light";

  const onReady = (event: { api: DockviewApi }) => {
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
        console.error("Failed to load saved layout:", err);
      }
    }

    if (!success) {
      event.api.addPanel({ id: "watchlist", component: "watchlist", title: "Watchlist" });
      event.api.addPanel({ id: "terminal", component: "terminal", title: "Terminal" });
    }
  };

  return (
    <div style={{ height: "899px", marginTop: "103px", marginLeft: "60px" }} data-theme={theme}>
      <DockviewReact
        onReady={onReady}
        className={dockviewTheme}
        components={{
          watchlist: (props: DockviewComponentProps) => <Watchlist {...props} />,
          terminal: (props: DockviewComponentProps) => <Terminal {...props} />,
          logs: (props: DockviewComponentProps) => <Logs {...props} />,
        }}
        rightHeaderActionsComponent={DockviewHeaderControls}
      />
    </div>
  );
};

export default TradeView;
