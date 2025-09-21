import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Winbox from 'react-winbox';

import 'winbox/dist/css/winbox.min.css';
import 'winbox/dist/css/themes/modern.min.css';
import 'winbox/dist/css/themes/white.min.css';

interface WinboxState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  width: number;
  height: number;
  id: string;
  icon?: string;
  noMin: boolean;
  noMax: boolean;
  noFull: boolean;
  noClose: boolean;
  noHeader: boolean;
  noMove: boolean;
  noResize: boolean;
  hide: boolean;
  theme?: string;
  customControls?: Array<{
    class: string;
    image: string;
    click: () => void;
  }>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface WinboxContextType {
  openWinbox: (config: {
    title: string;
    content: React.ReactNode;
    width?: number;
    height?: number;
    id?: string;
    icon?: string;
    noMin?: boolean;
    noMax?: boolean;
    noFull?: boolean;
    noClose?: boolean;
    noHeader?: boolean;
    noMove?: boolean;
    noResize?: boolean;
    hide?: boolean;
    theme?: string;
    customControls?: Array<{
      class: string;
      image: string;
      click: () => void;
    }>;
  }) => void;
  closeWinbox: (id?: string) => void;
  updateWinboxContent: (content: React.ReactNode, id?: string) => void;
  getWinboxState: (id?: string) => WinboxState | undefined;
  minimizeWinbox: (id?: string) => void;
  maximizeWinbox: (id?: string) => void;
  restoreWinbox: (id?: string) => void;
  winboxStates: Map<string, WinboxState>;
}

const WinboxContext = createContext<WinboxContextType | undefined>(undefined);

// Default icons for custom controls
const DefaultIcons = [{
  class: 'wb-info',
  image: 'data:image/svg+xml;base64,PHN2Zy xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  click: () => alert('Symbol Information')
}];

export const WinboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [winboxStates, setWinboxStates] = useState<Map<string, WinboxState>>(new Map());
  const winboxRefs = useRef<Map<string, any>>(new Map());

  const openWinbox = useCallback((config: {
    title: string;
    content: React.ReactNode;
    width?: number;
    height?: number;
    id?: string;
    icon?: string;
    noMin?: boolean;
    noMax?: boolean;
    noFull?: boolean;
    noClose?: boolean;
    noHeader?: boolean;
    noMove?: boolean;
    noResize?: boolean;
    hide?: boolean;
    theme?: string;
    customControls?: Array<{
      class: string;
      image: string;
      click: () => void;
    }>;
  }) => {
    const id = config.id || `winbox-${Date.now()}`;
    
    setWinboxStates(prev => {
      const newStates = new Map(prev);
      newStates.set(id, {
        isOpen: true,
        title: config.title,
        content: config.content,
        width: config.width || 600,
        height: config.height || 400,
        id,
        icon: config.icon,
        noMin: config.noMin || false,
        noMax: config.noMax || false,
        noFull: config.noFull || false,
        noClose: config.noClose || false,
        noHeader: config.noHeader || false,
        noMove: config.noMove || false,
        noResize: config.noResize || false,
        hide: config.hide || false,
        theme: config.theme,
        customControls: config.customControls || DefaultIcons,
      });
      return newStates;
    });
  }, []);

  const closeWinbox = useCallback((id: string = 'default') => {
    setWinboxStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(id);
      winboxRefs.current.delete(id);
      return newStates;
    });
  }, []);

  const updateWinboxContent = useCallback((content: React.ReactNode, id: string = 'default') => {
    setWinboxStates(prev => {
      const newStates = new Map(prev);
      const existingState = newStates.get(id);
      if (existingState) {
        newStates.set(id, { ...existingState, content });
      }
      return newStates;
    });
  }, []);

  const getWinboxState = useCallback((id: string = 'default') => {
    return winboxStates.get(id);
  }, [winboxStates]);

  const minimizeWinbox = useCallback((id: string = 'default') => {
    const winbox = winboxRefs.current.get(id);
    if (winbox) {
      winbox.minimize();
    }
  }, []);

  const maximizeWinbox = useCallback((id: string = 'default') => {
    const winbox = winboxRefs.current.get(id);
    if (winbox) {
      winbox.maximize();
    }
  }, []);

  const restoreWinbox = useCallback((id: string = 'default') => {
    const winbox = winboxRefs.current.get(id);
    if (winbox) {
      winbox.restore();
    }
  }, []);

  const registerWinboxRef = useCallback((id: string, ref: any) => {
    winboxRefs.current.set(id, ref);
  }, []);

  const unregisterWinboxRef = useCallback((id: string) => {
    winboxRefs.current.delete(id);
  }, []);

  return (
    <WinboxContext.Provider value={{ 
      openWinbox, 
      closeWinbox, 
      updateWinboxContent, 
      getWinboxState,
      minimizeWinbox,
      maximizeWinbox,
      restoreWinbox,
      winboxStates 
    }}>
      {children}
      <GlobalWinbox 
        winboxStates={winboxStates} 
        onClose={closeWinbox}
        registerRef={registerWinboxRef}
        unregisterRef={unregisterWinboxRef}
      />
    </WinboxContext.Provider>
  );
};

interface GlobalWinboxProps {
  winboxStates: Map<string, WinboxState>;
  onClose: (id: string) => void;
  registerRef: (id: string, ref: any) => void;
  unregisterRef: (id: string) => void;
}

const GlobalWinbox: React.FC<GlobalWinboxProps> = ({ 
  winboxStates, 
  onClose, 
  registerRef, 
  unregisterRef 
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.id = 'winbox-portal';
    document.body.appendChild(portalDiv);
    setPortalElement(portalDiv);

    return () => {
      if (document.getElementById('winbox-portal')) {
        document.body.removeChild(portalDiv);
      }
    };
  }, []);

  if (!portalElement) return null;

  const handleRef = (id: string) => (ref: any) => {
    if (ref) {
      registerRef(id, ref);
    } else {
      unregisterRef(id);
    }
  };

  const handleClose = (id: string) => () => {
    onClose(id);
  };

  return ReactDOM.createPortal(
    <>
      {Array.from(winboxStates.entries()).map(([id, state]) => (
        state.isOpen && (
          <Winbox
            key={id}
            ref={handleRef(id)}
            title={state.title}
            icon={state.icon}
            noMin={state.noMin}
            noMax={state.noMax}
            noFull={state.noFull}
            noClose={state.noClose}
            noHeader={state.noHeader}
            noMove={state.noMove}
            noResize={state.noResize}
            width={state.width}
            height={state.height}
            x="center"
            y="center"
            hide={state.hide}
            className={state.theme || ''}
            customControls={state.customControls}
            onclose={handleClose(id)}
            onfocus={() => console.log(`Winbox ${id} focused`)}
            onblur={() => console.log(`Winbox ${id} blurred`)}
            onMaximize={() => console.log(`Winbox ${id} maximized`)}
            onMinimize={() => console.log(`Winbox ${id} minimized`)}
            onRestore={() => console.log(`Winbox ${id} restored`)}
          >
            {state.content}
          </Winbox>
        )
      ))}
    </>,
    portalElement
  );
};

export const useWinbox = () => {
  const context = useContext(WinboxContext);
  if (context === undefined) {
    throw new Error('useWinbox must be used within a WinboxProvider');
  }
  return context;
};