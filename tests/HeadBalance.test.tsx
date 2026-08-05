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

const { default: HeadBalance } = await import('../src/HeadBalance');

const ALL_MODES = ['scene', 'rgb', 'warmth', 'white_channels'];

describe('HeadBalance', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a 0-100 slider on a dual-head fixture', () => {
    const { container } = render(
      <HeadBalance
        dualHead={true}
        activeMode="rgb"
        value={75}
        onChange={mockOnChange}
      />,
    );

    const inputs = container.querySelectorAll('input[type="range"]');
    expect(inputs).toHaveLength(1);
    expect(inputs[0].getAttribute('min')).toBe('0');
    expect(inputs[0].getAttribute('max')).toBe('100');
    expect((inputs[0] as HTMLInputElement).value).toBe('75');
  });

  it('renders nothing when the fixture is single-head', () => {
    const { container } = render(
      <HeadBalance
        dualHead={false}
        activeMode="rgb"
        value={50}
        onChange={mockOnChange}
      />,
    );

    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(0);
    expect(container.querySelector('[data-testid="head-balance"]')).toBeNull();
  });

  it('renders nothing when dual_head has never been probed', () => {
    // NULL reads as false everywhere — the conservative fallback.
    const { container } = render(
      <HeadBalance
        dualHead={null}
        activeMode="rgb"
        value={50}
        onChange={mockOnChange}
      />,
    );

    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(0);
    expect(container.querySelector('[data-testid="head-balance"]')).toBeNull();
  });

  it.each(ALL_MODES)('stays visible on a dual-head fixture in %s mode', (mode) => {
    const { container } = render(
      <HeadBalance
        dualHead={true}
        activeMode={mode}
        value={40}
        onChange={mockOnChange}
      />,
    );

    // Head balance is orthogonal to mode: it applies alongside whichever mode
    // is driving the light, so no mode may hide it.
    expect(container.querySelector('[data-testid="head-balance"]')).not.toBeNull();
    expect(container.querySelectorAll('input[type="range"]')).toHaveLength(1);
  });

  it.each(ALL_MODES)('stays hidden on a single-head fixture in %s mode', (mode) => {
    const { container } = render(
      <HeadBalance
        dualHead={false}
        activeMode={mode}
        value={40}
        onChange={mockOnChange}
      />,
    );

    expect(container.querySelector('[data-testid="head-balance"]')).toBeNull();
  });

  it('reports the new balance as a number when the slider moves', () => {
    const { container } = render(
      <HeadBalance
        dualHead={true}
        activeMode="scene"
        value={50}
        onChange={mockOnChange}
      />,
    );

    const slider = container.querySelectorAll('input[type="range"]')[0];
    fireEvent.change(slider, { target: { value: '80' } });

    expect(mockOnChange).toHaveBeenCalledWith(80);
  });
});
