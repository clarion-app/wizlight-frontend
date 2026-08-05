import React from 'react';
import { useGetScenesQuery } from './wizlightApi';
import { sortScenesByName, resolveSceneName } from './scenes';
import type { SceneType } from './types';

interface ScenePickerProps {
    capabilityClass: string | null;
    currentSceneId: number | null;
    onChange: (sceneId: number) => void;
}

export default function ScenePicker({ capabilityClass, currentSceneId, onChange }: ScenePickerProps) {
    const { data: scenes = [] } = useGetScenesQuery();

    const filtered = scenes.filter((s) =>
        capabilityClass ? s.classes.includes(capabilityClass) : true
    );
    const sorted = sortScenesByName(filtered);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        if (!isNaN(id) && id > 0) {
            onChange(id);
        }
    };

    const displayName = resolveSceneName(currentSceneId, scenes);

    // Build options: sorted catalogue entries, plus unknown scene if currentSceneId is not in catalogue.
    const options: SceneType[] = [...sorted];
    if (currentSceneId != null && !scenes.some((s) => s.id === currentSceneId)) {
        options.push({ id: currentSceneId, name: displayName ?? `Scene ${currentSceneId}`, animated: false, classes: [] });
    }

    return (
        <select
            value={currentSceneId ?? 0}
            onChange={handleChange}
            disabled={!capabilityClass}
        >
            {options.map((scene) => (
                <option key={scene.id} value={scene.id}>
                    {scene.name}
                </option>
            ))}
        </select>
    );
}
