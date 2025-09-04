import React, { useRef, useState, useEffect } from "react";
import { DockviewReact, DockviewApi, DockviewComponentProps } from "dockview";
import { useTheme } from "../utilities/context/ThemeContext";
import { useOutletContext } from "react-router-dom";
import { DockviewHeaderControls } from "../components/docview/DockviewHeaderControls";
import { toast } from "react-toastify";

import Terminal from "../components/widgets/Terminal";
import Watchlist from "../components/widgets/Watchlist";
import MarketDepth from "../components/widgets/MarketDepth";
import MarketWatch from "../components/widgets/MarketWatch";

const LAYOUT_STORAGE_KEY = "tradeview_layout";

interface OutletContextType {
  addPanelName: string | null;
}

const componentMap: Record<string, string> = {
  "Watchlist": "watchlist",
  "Market Watch": "marketwatch",
  "Order Terminal": "terminal",
  "Market Depth": "marketdepth",
};

const initialPanels = [
  { id: "watchlist", component: "watchlist", title: "Watchlist" },
  { id: "terminal", component: "terminal", title: "Terminal" },
];

const TradeView = (): JSX.Element => {
  const { addPanelName } = useOutletContext<OutletContextType>();
  const { theme } = useTheme();

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

  /** Find existing panel by id, component, or title */
  const findExistingPanel = (apiInstance: DockviewApi, componentKey: string, title?: string) => {
    const panels: any[] = typeof (apiInstance as any).getPanels === "function"
      ? (apiInstance as any).getPanels()
      : (apiInstance as any).panels ?? [];

    return panels.find(p => {
      const pid = p?.id ?? p?.panelId ?? "";
      const pcomp = p?.component ?? p?.descriptor ?? p?.componentId ?? "";
      const ptitle = p?.title ?? p?.label ?? "";

      return [pid, pcomp, ptitle].includes(componentKey) || ptitle === title || String(pcomp).includes(componentKey);
    });
  };

  /** Add or focus a panel */
  const addOrFocusPanel = (apiInstance: DockviewApi, panelName: string) => {
    const componentKey = componentMap[panelName];
    if (!componentKey) return toast.error(`"${panelName}" is not available`);

    const existing = findExistingPanel(apiInstance, componentKey, panelName);
    if (existing) {
      existing.setActive?.();
      return toast.info(`${panelName} is already open`, { toastId: `already-open-${componentKey}` });
    }

    try {
      apiInstance.addPanel({ id: componentKey, component: componentKey, title: panelName });
      toast.success(`${panelName} added`, { toastId: `added-${componentKey}` });
    } catch (err) {
      console.error("addPanel failed", err);
      toast.error(`Failed to add ${panelName}`);
    }
  };

  /** Handle addPanelName changes */
  useEffect(() => {
    if (!addPanelName) return;
    if (dockviewRef.current) {
      addOrFocusPanel(dockviewRef.current, addPanelName);
      pendingAddRef.current = null;
    } else {
      pendingAddRef.current = componentMap[addPanelName] ?? null;
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
    if (!restored) initialPanels.forEach(panel => api.addPanel(panel));

    // Process pending add panel
    const pending = pendingAddRef.current;
    if (pending) {
      setTimeout(() => {
        const panelName = Object.entries(componentMap).find(([, v]) => v === pending)?.[0] || pending;
        addOrFocusPanel(api, panelName);
        pendingAddRef.current = null;
      }, 50);
    }
  };

  const dockviewTheme = theme === "dark" ? "dockview-theme-dark" : "dockview-theme-light";

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
