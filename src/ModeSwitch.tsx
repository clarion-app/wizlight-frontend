import React from 'react';

interface ModeSwitchProps {
    capabilityClass: string | null;
    activeMode: string | null;
    onChange: (payload: { active_mode: string }) => void;
}

const MODE_SEGMENTS: Record<string, { label: string; mode: string }[]> = {
    full_colour: [
        { label: 'Colour', mode: 'rgb' },
        { label: 'Warmth', mode: 'warmth' },
        { label: 'White', mode: 'white_channels' },
        { label: 'Scene', mode: 'scene' },
    ],
    tunable_white: [
        { label: 'Warmth', mode: 'warmth' },
        { label: 'Scene', mode: 'scene' },
    ],
};

export default function ModeSwitch({ capabilityClass, activeMode, onChange }: ModeSwitchProps) {
    const segments = MODE_SEGMENTS[capabilityClass ?? ''];
    if (!segments || segments.length === 0) return null;

    const handleClick = (mode: string) => {
        onChange({ active_mode: mode });
    };

    return (
        <div className="buttons has-addons is-small">
            {segments.map((seg) => (
                <button
                    key={seg.mode}
                    className={`button ${activeMode === seg.mode ? 'is-info' : 'is-light'}`}
                    onClick={() => handleClick(seg.mode)}
                >
                    {seg.label}
                </button>
            ))}
        </div>
    );
}
