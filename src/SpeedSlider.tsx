import React from 'react';
import type { SceneType } from './types';

interface SpeedSliderProps {
    sceneId: number | null;
    sceneSpeed: number | null;
    animated: boolean;
    onChange: (speed: number) => void;
    scenes: SceneType[];
}

export default function SpeedSlider({ sceneId, sceneSpeed, animated, onChange }: SpeedSliderProps) {
    // Do not render for static scenes or when no scene is active.
    if (!animated || sceneId == null) {
        return null;
    }

    return (
        <div className="field">
            <label className="label">Scene Speed</label>
            <div className="field body">
                <div className="control has-icons-left">
                    <input
                        type="range"
                        min={10}
                        max={200}
                        value={sceneSpeed ?? 100}
                        onChange={(e) => onChange(parseInt(e.target.value, 10))}
                        className="input"
                    />
                </div>
            </div>
            <p className="help">
                {sceneSpeed ?? 100} (10–200)
            </p>
        </div>
    );
}
