import { DockviewReact, DockviewApi, DockviewComponentProps } from "dockview";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "../utilities/context/ThemeContext";
import { useOutletContext } from "react-router-dom";
import { DockviewHeaderControls } from "../components/docview/DockviewHeaderControls";

import Terminal from "../components/widgets/Terminal";
import Watchlist from "../components/widgets/Watchlist";
import MarketDepth from "../components/widgets/MarketDepth";
import MarketWatch from "../components/widgets/MarketWatch";

const LAYOUT_STORAGE_KEY = "tradeview_layout";

interface OutletContextType {
  addPanelName: string | null;
}

const TradeView = (): JSX.Element => {
    const componentMap: Record<string, string> = {
    "Watchlist": "watchlist",
    "Market Watch": "marketwatch",
    "Order Terminal": "terminal", 
    "Market Depth": "marketdepth", 
  };

  const { addPanelName } = useOutletContext<OutletContextType>();
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

 
  // Add panel whenever dropdown selection changes
  useEffect(() => {
    if (!dockviewRef.current || !addPanelName) return;

    const componentKey = componentMap[addPanelName];
    if (!componentKey) {
      console.warn(`No component registered for panel: ${addPanelName}`);
      return;
    }

    const id = `${componentKey}-${Date.now()}`; // unique id
    dockviewRef.current.addPanel({
      id,
      component: componentKey,
      title: addPanelName,
    });
  }, [addPanelName]);


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
          marketdepth: (props: DockviewComponentProps) => <MarketDepth {...props} />, 
          marketwatch: (props: DockviewComponentProps) => <MarketWatch {...props} />,
        }}
        rightHeaderActionsComponent={DockviewHeaderControls}
      />
    </div>
  );
};

export default TradeView;
