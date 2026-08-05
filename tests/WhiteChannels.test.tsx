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

const { default: WhiteChannels } = await import('../src/WhiteChannels');

describe('WhiteChannels', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders two sliders (white_warm and white_cool) with range 0-255', () => {
    const { container } = render(
      <WhiteChannels
        whiteWarm={200}
        whiteCool={40}
        onChange={mockOnChange}
      />,
    );

    // WhiteChannels should render two range inputs.
    const inputs = container.querySelectorAll('input[type="range"]');
    expect(inputs).toHaveLength(2);

    // Both sliders should have min=0 and max=255.
    for (const input of inputs) {
      expect(input.getAttribute('min')).toBe('0');
      expect(input.getAttribute('max')).toBe('255');
    }
  });

  it('calls onChange with updated white_warm value on first slider change', () => {
    const { container } = render(
      <WhiteChannels
        whiteWarm={200}
        whiteCool={40}
        onChange={mockOnChange}
      />,
    );

    const inputs = container.querySelectorAll('input[type="range"]');
    const warmSlider = inputs[0];

    fireEvent.change(warmSlider, { target: { value: '128' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ whiteWarm: 128 }),
    );
  });

  it('calls onChange with updated white_cool value on second slider change', () => {
    const { container } = render(
      <WhiteChannels
        whiteWarm={200}
        whiteCool={40}
        onChange={mockOnChange}
      />,
    );

    const inputs = container.querySelectorAll('input[type="range"]');
    const coolSlider = inputs[1];

    fireEvent.change(coolSlider, { target: { value: '100' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ whiteCool: 100 }),
    );
  });

  it('renders with data-testid="white-channels" for outer container', () => {
    const { container } = render(
      <WhiteChannels
        whiteWarm={200}
        whiteCool={40}
        onChange={mockOnChange}
      />,
    );

    const wrapper = container.querySelector('[data-testid="white-channels"]');
    expect(wrapper).not.toBeNull();
  });
});
