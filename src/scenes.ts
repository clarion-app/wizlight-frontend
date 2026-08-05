import { SceneType } from './types';

export function sortScenesByName(scenes: SceneType[]): SceneType[] {
    return [...scenes].sort((a, b) => a.name.localeCompare(b.name));
}

export function resolveSceneName(
    id: number | null,
    catalogue: SceneType[]
): string | null {
    if (id == null) return null;
    const scene = catalogue.find((s) => s.id === id);
    return scene?.name ?? `Scene ${id}`;
}
