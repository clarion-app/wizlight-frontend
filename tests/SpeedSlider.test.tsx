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

const { default: SpeedSlider } = await import('../src/SpeedSlider');

describe('SpeedSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders for animated scene', () => {
    const { container } = render(
      <SpeedSlider
        sceneId={1}
        sceneSpeed={100}
        animated={true}
        onChange={() => {}}
        scenes={[]}
      />,
    );

    // SpeedSlider should render an input element (range slider)
    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();
  });

  it('does not render for static scene', () => {
    const { container } = render(
      <SpeedSlider
        sceneId={11}
        sceneSpeed={100}
        animated={false}
        onChange={() => {}}
        scenes={[]}
      />,
    );

    // SpeedSlider should render nothing for static scenes
    const input = container.querySelector('input[type="range"]');
    expect(input).toBeNull();
  });

  it('does not render when no scene is active', () => {
    const { container } = render(
      <SpeedSlider
        sceneId={null}
        sceneSpeed={null}
        animated={false}
        onChange={() => {}}
        scenes={[]}
      />,
    );

    // SpeedSlider should render nothing when no scene is active
    const input = container.querySelector('input[type="range"]');
    expect(input).toBeNull();
  });

  it('respects minimum bound of 10', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SpeedSlider
        sceneId={1}
        sceneSpeed={100}
        animated={true}
        onChange={onChange}
        scenes={[]}
      />,
    );

    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();

    // Check min attribute is 10
    expect(input?.getAttribute('min')).toBe('10');
  });

  it('respects maximum bound of 200', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SpeedSlider
        sceneId={1}
        sceneSpeed={100}
        animated={true}
        onChange={onChange}
        scenes={[]}
      />,
    );

    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();

    // Check max attribute is 200
    expect(input?.getAttribute('max')).toBe('200');
  });

  it('calls onChange with new speed value on input change', () => {
    const onChange = vi.fn();
    const { container } = render(
      <SpeedSlider
        sceneId={1}
        sceneSpeed={100}
        animated={true}
        onChange={onChange}
        scenes={[]}
      />,
    );

    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();

    // Simulate changing the slider value
    fireEvent.change(input!, { target: { value: '150' } });

    expect(onChange).toHaveBeenCalledWith(150);
  });

  it('displays current speed value', () => {
    const { container } = render(
      <SpeedSlider
        sceneId={1}
        sceneSpeed={150}
        animated={true}
        onChange={() => {}}
        scenes={[]}
      />,
    );

    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('value')).toBe('150');
  });
});
