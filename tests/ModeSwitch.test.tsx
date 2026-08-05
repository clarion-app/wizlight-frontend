import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';

// Mock the index module
vi.mock('../src', () => ({
  backend: {
    url: 'http://localhost:8000',
    token: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  },
}));

// Mock RTK Query hooks
vi.mock('../src/wizlightApi', () => {
  const setBulbFn = vi.fn();
  return {
    useGetBulbsQuery: () => ({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    }),
    useSetBulbMutation: () => [setBulbFn, { isLoading: false, isSuccess: false, isError: false }],
    useDeleteBulbMutation: () => [vi.fn(), { isLoading: false }],
    useGetScenesQuery: () => ({
      data: [],
      isLoading: false,
    }),
    __exportSetBulbFn: () => setBulbFn,
  };
});

// Mock @clarion-app/frontend-base
vi.mock('@clarion-app/frontend-base', () => ({
  createBackendConfig: () => ({
    backend: { url: 'http://localhost:8000', user: { id: '', name: '', email: '' } },
    updateFrontend: () => {},
  }),
  createBaseQuery: () => async () => ({ data: [] }),
}));

const { default: ModeSwitch } = await import('../src/ModeSwitch');

describe('ModeSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders four segments (Colour, Warmth, White, Scene) for full_colour', () => {
    const { container } = render(
      <ModeSwitch
        capabilityClass="full_colour"
        activeMode="rgb"
        onChange={() => {}}
      />,
    );

    const segments = container.querySelectorAll('button, [role="button"]');
    const labels = Array.from(segments).map((s) => s.textContent?.trim() ?? '');

    expect(labels).toContain('Colour');
    expect(labels).toContain('Warmth');
    expect(labels).toContain('White');
    expect(labels).toContain('Scene');
    expect(segments).toHaveLength(4);
  });

  it('renders two segments (Warmth, Scene) for tunable_white', () => {
    const { container } = render(
      <ModeSwitch
        capabilityClass="tunable_white"
        activeMode="warmth"
        onChange={() => {}}
      />,
    );

    const segments = container.querySelectorAll('button, [role="button"]');
    const labels = Array.from(segments).map((s) => s.textContent?.trim() ?? '');

    expect(labels).toContain('Warmth');
    expect(labels).toContain('Scene');
    expect(segments).toHaveLength(2);
  });

  it('renders no segments for dim_only', () => {
    const { container } = render(
      <ModeSwitch
        capabilityClass="dim_only"
        activeMode={null}
        onChange={() => {}}
      />,
    );

    const segments = container.querySelectorAll('button, [role="button"]');
    expect(segments).toHaveLength(0);
  });

  it('renders no segments for null capability_class', () => {
    const { container } = render(
      <ModeSwitch
        capabilityClass={null}
        activeMode={null}
        onChange={() => {}}
      />,
    );

    const segments = container.querySelectorAll('button, [role="button"]');
    expect(segments).toHaveLength(0);
  });

  it('selecting a segment sends only active_mode in the mutation payload', () => {
    const onChange = vi.fn();

    render(
      <ModeSwitch
        capabilityClass="full_colour"
        activeMode="rgb"
        onChange={onChange}
      />,
    );

    // Fallback: find by text content among all buttons
    // (jsdom does not support :has-text() pseudo-class)
    const allButtons = Array.from(
      document.querySelectorAll('button, [role="button"]'),
    );
    const warmthSegment = allButtons.find(
      (b) => b.textContent?.trim() === 'Warmth',
    );

    if (warmthSegment) {
      fireEvent.click(warmthSegment);
    }

    expect(onChange).toHaveBeenCalledTimes(1);
    const payload = onChange.mock.calls[0][0];
    expect(payload).toHaveProperty('active_mode', 'warmth');
    // The payload should only contain active_mode — no scene_id, no red/green/blue, etc.
    expect(Object.keys(payload)).toEqual(['active_mode']);
  });
});
