import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

// Mock the index module
vi.mock('../src', () => ({
  backend: {
    url: 'http://localhost:8000',
    token: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  },
}));

// Scene catalogue fixture — matches contracts/scene-catalogue.md exactly
const sceneCatalogue = [
  { id: 1, name: 'Ocean', animated: true, classes: ['full_colour'] },
  { id: 2, name: 'Romance', animated: true, classes: ['full_colour'] },
  { id: 3, name: 'Sunset', animated: true, classes: ['full_colour'] },
  { id: 4, name: 'Party', animated: true, classes: ['full_colour'] },
  { id: 5, name: 'Fireplace', animated: true, classes: ['full_colour'] },
  { id: 6, name: 'Cozy', animated: true, classes: ['full_colour', 'tunable_white'] },
  { id: 7, name: 'Forest', animated: true, classes: ['full_colour'] },
  { id: 8, name: 'Pastel colors', animated: true, classes: ['full_colour'] },
  { id: 9, name: 'Wake-up', animated: true, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 10, name: 'Bedtime', animated: true, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 11, name: 'Warm white', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 12, name: 'Daylight', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 13, name: 'Cool white', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 14, name: 'Night light', animated: false, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 15, name: 'Focus', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 16, name: 'Relax', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 17, name: 'True colors', animated: false, classes: ['full_colour'] },
  { id: 18, name: 'TV time', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 19, name: 'Plantgrowth', animated: false, classes: ['full_colour'] },
  { id: 20, name: 'Spring', animated: true, classes: ['full_colour'] },
  { id: 21, name: 'Summer', animated: true, classes: ['full_colour'] },
  { id: 22, name: 'Fall', animated: true, classes: ['full_colour'] },
  { id: 23, name: 'Deep dive', animated: true, classes: ['full_colour'] },
  { id: 24, name: 'Jungle', animated: true, classes: ['full_colour'] },
  { id: 25, name: 'Mojito', animated: false, classes: ['full_colour'] },
  { id: 26, name: 'Club', animated: true, classes: ['full_colour'] },
  { id: 27, name: 'Christmas', animated: false, classes: ['full_colour'] },
  { id: 28, name: 'Halloween', animated: false, classes: ['full_colour'] },
  { id: 29, name: 'Candlelight', animated: false, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 30, name: 'Golden white', animated: false, classes: ['full_colour', 'tunable_white'] },
  { id: 31, name: 'Pulse', animated: true, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 32, name: 'Steampunk', animated: true, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 33, name: 'Diwali', animated: true, classes: ['full_colour', 'tunable_white'] },
  { id: 34, name: 'White', animated: false, classes: ['full_colour', 'dim_only'] },
  { id: 35, name: 'Alarm', animated: false, classes: ['full_colour', 'tunable_white', 'dim_only'] },
  { id: 36, name: 'Snowy sky', animated: true, classes: ['full_colour'] },
  { id: 40, name: 'Dim-to-warm', animated: false, classes: ['tunable_white'] },
];

// Mock RTK Query hooks
vi.mock('../src/wizlightApi', () => ({
  useGetBulbsQuery: () => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useSetBulbMutation: () => [vi.fn(), { isLoading: false, isSuccess: false, isError: false }],
  useDeleteBulbMutation: () => [vi.fn(), { isLoading: false }],
  useGetScenesQuery: () => ({
    data: sceneCatalogue,
    isLoading: false,
  }),
}));

// Mock @clarion-app/frontend-base
vi.mock('@clarion-app/frontend-base', () => ({
  createBackendConfig: () => ({
    backend: { url: 'http://localhost:8000', user: { id: '', name: '', email: '' } },
    updateFrontend: () => {},
  }),
  createBaseQuery: () => async () => ({ data: [] }),
}));

const { default: ScenePicker } = await import('../src/ScenePicker');

describe('ScenePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders 36 options for full_colour capability class', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="full_colour"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    // Filter out any "Select a scene" placeholder options.
    const sceneOptions = Array.from(options).filter(
      (opt) => opt.textContent && opt.textContent.trim() !== '',
    );
    expect(sceneOptions).toHaveLength(36);
  });

  it('renders 17 options for tunable_white capability class', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="tunable_white"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    const sceneOptions = Array.from(options).filter(
      (opt) => opt.textContent && opt.textContent.trim() !== '',
    );
    expect(sceneOptions).toHaveLength(17);
  });

  it('renders 8 options for dim_only capability class', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="dim_only"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    const sceneOptions = Array.from(options).filter(
      (opt) => opt.textContent && opt.textContent.trim() !== '',
    );
    expect(sceneOptions).toHaveLength(8);
  });

  it('does not offer any custom mode IDs 256-265', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="full_colour"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    for (const opt of options) {
      const value = (opt as HTMLOptionElement).value;
      const id = parseInt(value, 10);
      if (!isNaN(id)) {
        expect(id >= 256 && id <= 265).toBe(false);
      }
    }
  });

  it('does not offer rhythm ID 1000', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="full_colour"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    for (const opt of options) {
      const value = (opt as HTMLOptionElement).value;
      const id = parseInt(value, 10);
      if (!isNaN(id)) {
        expect(id).not.toBe(1000);
      }
    }
  });

  it('renders a stored scene_id not in the catalogue as "Scene 57"', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="full_colour"
        currentSceneId={57}
        onChange={() => {}}
      />,
    );

    // The component should render "Scene 57" for an unknown scene ID.
    expect(container.textContent).toContain('Scene 57');
  });

  it('renders options sorted by name', () => {
    const { container } = render(
      <ScenePicker
        capabilityClass="full_colour"
        currentSceneId={null}
        onChange={() => {}}
      />,
    );

    const options = container.querySelectorAll('select option, [role="option"]');
    const names = Array.from(options)
      .map((opt) => opt.textContent?.trim() ?? '')
      .filter((n) => n !== '');

    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});
