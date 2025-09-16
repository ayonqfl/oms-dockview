import { useRef, useState, useEffect } from "react";
import {
  DockviewReact,
  DockviewApi,
  DockviewComponentProps,
} from "dockview";
import { useTheme } from "../utilities/context/ThemeContext";
import { useOutletContext } from "react-router-dom";
import { DockviewHeaderControls } from "../components/docview/DockviewHeaderControls";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import Terminal from "../components/widgets/Terminal";
import Watchlist from "../components/widgets/Watchlist";
import MarketDepth from "../components/widgets/MarketDepth";
import MarketWatch from "../components/widgets/MarketWatch";
import Portfolio from "../components/widgets/Portfolio";

const LAYOUT_STORAGE_KEY = "tradeview_layout";

interface OutletContextType {
  addPanelName: string | null;
}

interface RootState {
  user: any; // 🔑 replace with your UserSlice type
}

const componentMap: Record<string, string> = {
  "Watchlist": "watchlist",
  "Market Watch": "marketwatch",
  "Order Terminal": "terminal",
  "Market Depth": "marketdepth",
  "Portfolio": "portfolio",
};

const initialPanels = [
  { id: "watchlist-1", component: "watchlist", title: "Watchlist 1" },
  { id: "terminal-1", component: "terminal", title: "Order Terminal 1" },
];

const TradeView = (): JSX.Element => {
  const { addPanelName } = useOutletContext<OutletContextType>();
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.user);

  const clientCode =
    user?.userData?.users_roles === "client"
      ? user?.userData?.username
      : null;

  const dockviewRef = useRef<DockviewApi | null>(null);
  const [api, setApi] = useState<DockviewApi | null>(null);
  const pendingAddRef = useRef<string | null>(null);

  /** Persist layout changes */
  useEffect(() => {
    if (!api) return;
    const disposable = api.onDidLayoutChange(() => {
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(api.toJSON()));
      } catch (e) {
        console.error("Saving layout failed", e);
      }
    });
    return () => disposable.dispose();
  }, [api]);

  /** Generate unique panel ID and title */
  const generateUniquePanel = (
    apiInstance: DockviewApi,
    panelName: string
  ) => {
    const baseKey = componentMap[panelName];
    if (!baseKey) return null;

    const panels: any[] =
      typeof (apiInstance as any).getPanels === "function"
        ? (apiInstance as any).getPanels()
        : (apiInstance as any).panels ?? [];

    // Special case: Market Watch & Portfolio are single instance
    if (panelName === "Market Watch" || panelName === "Portfolio") {
      const existing = panels.find(
        (p) => p.title === panelName
      );
      if (existing) return null;

      return {
        newTitle: panelName,
        newId: `${baseKey}-1`,
      };
    }

    // For other panels, allow multiple numbered instances
    const existingTitles = panels
      .map((p) => p.title)
      .filter((t) => t.startsWith(panelName));

    let nextNum = 1;
    while (existingTitles.includes(`${panelName} ${nextNum}`)) {
      nextNum++;
    }

    const newTitle = `${panelName} ${nextNum}`;
    const newId = `${baseKey}-${nextNum}`;
    return { newTitle, newId };
  };

  /** Add a new panel with unique title */
  const addOrFocusPanel = (apiInstance: DockviewApi, panelName: string) => {
    const uniquePanel = generateUniquePanel(apiInstance, panelName);
    if (!uniquePanel) {
      if (panelName === "Market Watch") {
        return toast.info(`Market Watch is already open`, {
          toastId: `already-open-marketwatch`,
        });
      }
      if (panelName === "Portfolio") {
        return toast.info(`Portfolio is already open`, {
          toastId: `already-open-portfolio`,
        });
      }
      return toast.error(`"${panelName}" cannot be added`);
    }

    const { newId, newTitle } = uniquePanel;

    try {
      apiInstance.addPanel({
        id: newId,
        component: componentMap[panelName],
        title: newTitle,
      });
      toast.success(`${newTitle} added`, { toastId: `added-${newId}` });
    } catch (err) {
      console.error("addPanel failed", err);
      toast.error(`Failed to add ${newTitle}`);
    }
  };

  /** Handle addPanelName changes */
  useEffect(() => {
    if (!addPanelName) return;
    if (dockviewRef.current) {
      addOrFocusPanel(dockviewRef.current, addPanelName);
      pendingAddRef.current = null;
    } else {
      pendingAddRef.current = addPanelName;
    }
  }, [addPanelName]);

  /** Dockview onReady handler */
  const onReady = ({ api }: { api: DockviewApi }) => {
    dockviewRef.current = api;
    setApi(api);

    // Restore saved layout or add initial panels
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    let restored = false;
    if (saved) {
      try {
        api.fromJSON(JSON.parse(saved));
        restored = true;
      } catch (e) {
        console.warn("Failed to restore layout", e);
      }
    }
    if (!restored) initialPanels.forEach((panel) => api.addPanel(panel));

    // Process pending add panel
    const pending = pendingAddRef.current;
    if (pending) {
      setTimeout(() => {
        addOrFocusPanel(api, pending);
        pendingAddRef.current = null;
      }, 50);
    }
  };

  const dockviewTheme =
    theme === "dark" ? "dockview-theme-dark" : "dockview-theme-light";

  return (
    <div
      style={{ height: "899px", marginTop: "80px", marginLeft: "50px" }}
      data-theme={theme}
    >
      <DockviewReact
        onReady={onReady}
        className={dockviewTheme}
        components={{
          watchlist: (props: DockviewComponentProps) => (
            <div style={{ height: "100%", overflow: "auto" }}>
              <Watchlist {...props} />
            </div>
          ),
          terminal: (props: DockviewComponentProps) => (
            <div style={{ height: "100%", overflow: "auto" }}>
              <Terminal {...props} />
            </div>
          ),
          marketdepth: (props: DockviewComponentProps) => (
            <div style={{ height: "100%", overflow: "auto" }}>
              <MarketDepth {...props} />
            </div>
          ),
          marketwatch: (props: DockviewComponentProps) => (
            <div style={{ height: "100%", overflow: "auto" }}>
              <MarketWatch {...props} />
            </div>
          ),
          portfolio: (props: DockviewComponentProps) => (
            <div style={{ height: "100%", overflow: "auto" }}>
              {clientCode ? (
                <Portfolio {...props} clientCode={clientCode} />
              ) : (
                <div className="p-3 text-muted">No client selected</div>
              )}
            </div>
          ),
        }}
        rightHeaderActionsComponent={DockviewHeaderControls}
      />
    </div>
  );
};

export default TradeView;
