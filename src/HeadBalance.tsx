import React from 'react';

interface HeadBalanceProps {
    /**
     * The stored dual-head capability fact. `null` means the fixture has never
     * been probed and reads as single-head — the same conservative fallback the
     * backend applies.
     */
    dualHead: boolean | null;
    /**
     * The mode currently driving the light. Head balance is orthogonal to it:
     * the prop is here so the control can label itself, never to gate it.
     */
    activeMode: string;
    value: number;
    onChange: (ratio: number) => void;
}

export default function HeadBalance({ dualHead, activeMode, value, onChange }: HeadBalanceProps) {
    // Self-gating: a single-head (or never-probed) fixture has no balance to
    // set, so the control renders nothing at all rather than rendering disabled.
    if (dualHead !== true) {
        return null;
    }

    return (
        <div data-testid="head-balance" className="field mt-4">
            <label className="label">Head Balance</label>
            <div className="control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className="input"
                />
                <p className="help">
                    {value}% ({activeMode} mode)
                </p>
            </div>
        </div>
    );
}
