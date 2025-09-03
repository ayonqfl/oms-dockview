// DockviewHeaderControls.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IDockviewHeaderActionsProps } from 'dockview';

const Icon = (props: {
    icon?: string;
    title?: string;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
    color?: string;
}) => {
    return (
        <div
            title={props.title}
            className={`action ${props.className || ''}`}
            onClick={props.onClick}
            style={{
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {props.icon ? (
                <span
                    style={{ fontSize: '18px' }}
                    className="material-symbols-outlined"
                >
                    {props.icon}
                </span>
            ) : (
                <div
                    style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: props.color || '#999',
                    }}
                />
            )}
        </div>
    );
};

type ColorOption = {
    label: string;
    value: string | null; // null for No Link
    isNoLink?: boolean;
};

const colorOptions: ColorOption[] = [
    { label: 'No Link', value: null, isNoLink: true },
    { label: 'Red', value: '#ee341fff' },
    { label: 'Green', value: 'rgb(17 241 112)' },
    { label: 'Blue', value: 'rgb(33 166 255)' },
    { label: 'Orange', value: '#ff871fff' },
    { label: 'Purple', value: '#c946fdf6' },
];

// Prefix for storing per-panel colors in localStorage
const STORAGE_KEY_PREFIX = 'dockview-selected-color:';

export const DockviewHeaderControls = (props: IDockviewHeaderActionsProps) => {
    const panelId = props.api.id;

    const [isMaximized, setIsMaximized] = useState<boolean>(
        props.containerApi.hasMaximizedGroup()
    );
    const [isPopout, setIsPopout] = useState<boolean>(
        props.api.location.type === 'popout'
    );
    const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // 🔹 Load saved color for this panel
    useEffect(() => {
        if (!props.activePanel) return;

        const panelId = props.activePanel.api.id;
        const savedColor = localStorage.getItem(
            `${STORAGE_KEY_PREFIX}${panelId}`
        );
        if (savedColor) {
            const option = colorOptions.find((opt) => opt.value === savedColor);
            setSelectedColor(option || null);
        } else {
            setSelectedColor(colorOptions[0]); // default to No Link
        }
    }, [props.activePanel]);

    useEffect(() => {
        const disposable = props.containerApi.onDidMaximizedGroupChange(() => {
            setIsMaximized(props.containerApi.hasMaximizedGroup());
        });

        const disposable2 = props.api.onDidLocationChange(() => {
            setIsPopout(props.api.location.type === 'popout');
        });

        return () => {
            disposable.dispose();
            disposable2.dispose();
        };
    }, [props.containerApi, props.api]);

    const handleMaximizeClick = () => {
        if (props.containerApi.hasMaximizedGroup()) {
            props.containerApi.exitMaximizedGroup();
        } else {
            props.activePanel?.api.maximize();
        }
    };

    const handlePopoutClick = () => {
        if (props.api.location.type !== 'popout') {
            props.containerApi.addPopoutGroup(props.group);
        } else {
            props.api.moveTo({ position: 'right' });
        }
    };

    const handleCloseClick = () => {
        props.activePanel?.api.close();
    };

    const handleColorSelect = (option: ColorOption) => {
        if (!props.activePanel) return;

        const panelId = props.activePanel.api.id;

        setSelectedColor(option);
        setDropdownOpen(false);

        if (option.isNoLink) {
            // remove color
            localStorage.removeItem(`${STORAGE_KEY_PREFIX}${panelId}`);
        } else {
            // save color
            localStorage.setItem(
                `${STORAGE_KEY_PREFIX}${panelId}`,
                option.value as string
            );
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0px 8px',
                height: '100%',
                position: 'relative',
            }}
        >
            {/* Popout/Close Window Button */}
            <Icon
                title={isPopout ? 'Close Window' : 'Open In New Window'}
                icon={isPopout ? 'close_fullscreen' : 'open_in_new'}
                onClick={handlePopoutClick}
            />

            {/* Maximize/Minimize Button */}
            {!isPopout && (
                <Icon
                    title={isMaximized ? 'Minimize View' : 'Maximize View'}
                    icon={isMaximized ? 'fullscreen_exit' : 'fullscreen'}
                    onClick={handleMaximizeClick}
                />
            )}

            {/* Custom Dropdown Trigger (hover) */}
            <div
                ref={containerRef}
                style={{ position: 'relative' }}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
            >
                <Icon
                    title="Select Color"
                    icon={selectedColor?.isNoLink ? 'link_off' : undefined}
                    color={
                        selectedColor && !selectedColor.isNoLink
                            ? selectedColor.value || undefined
                            : undefined
                    }
                />

                {dropdownOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: '-90px',
                            background: '#fff',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            zIndex: 10,
                            minWidth: '140px',
                            padding: '4px 0',
                        }}
                    >
                        {colorOptions.map((opt) => (
                            <div
                                key={opt.label}
                                onClick={() => handleColorSelect(opt)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    gap: '8px',
                                    transition: 'background 0.2s',
                                    color: '#333',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = '#f5f5f5')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        'transparent')
                                }
                            >
                                {opt.isNoLink ? (
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: '16px' }}
                                    >
                                        link_off
                                    </span>
                                ) : (
                                    <div
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: opt.value as string,
                                            border: '1px solid #aaa',
                                        }}
                                    />
                                )}
                                <span style={{ fontSize: '13px' }}>
                                    {opt.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Close Button */}
            <Icon title="Close" icon="close" onClick={handleCloseClick} />
        </div>
    );
};
