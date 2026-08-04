import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockStop = vi.fn();
const mockListen = vi.fn().mockReturnValue({ stop: mockStop });
const mockPrivate = vi.fn().mockReturnValue({ listen: mockListen });
const mockChannel = vi.fn().mockReturnValue({ listen: mockListen });

// Mock the index module
vi.mock('../src', () => ({
  backend: {
    url: 'http://localhost:8000',
    token: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  },
}));

// Mock RTK Query hooks to return data synchronously (avoids loading state crash)
vi.mock('../src/wizlightApi', () => ({
  useGetBulbsQuery: () => ({
    data: [{
      id: 'bulb-1',
      name: 'Kitchen Light',
      state: 1,
      dimming: 100,
      red: 255,
      green: 255,
      blue: 255,
      temperature: 2700,
      ip: '192.168.1.10',
      mac: 'aa:bb:cc:dd:ee:ff',
      room_id: null,
      signal: '-50',
      local_node_id: 'test-node',
      group: '',
      mode: '',
      last_seen: {
        id: 1,
        bulb_id: 1,
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      },
    }],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useSetBulbMutation: () => [vi.fn(), { isLoading: false, isSuccess: false, isError: false }],
  useDeleteBulbMutation: () => [vi.fn(), { isLoading: false }],
}));

// Mock @clarion-app/frontend-base
vi.mock('@clarion-app/frontend-base', () => ({
  createBackendConfig: () => ({
    backend: { url: 'http://localhost:8000', user: { id: '', name: '', email: '' } },
    updateFrontend: () => {},
  }),
  createBaseQuery: () => async () => ({ data: [] }),
}));

// Mock @uiw/react-color-wheel
vi.mock('@uiw/react-color-wheel', () => ({
  default: () => null,
}));

// Mock @uiw/color-convert
vi.mock('@uiw/color-convert', () => ({
  hexToHsva: () => [0, 0, 1, 1],
}));

// Mock TemperatureSlide
vi.mock('../src/TemperatureSlide', () => ({
  TemperatureSlide: () => null,
}));

function setupEcho() {
  (window as any).Echo = {
    private: mockPrivate,
    channel: mockChannel,
  };
}

const { default: Bulb } = await import('../src/Bulb');

describe('Bulb - Private Channels', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setupEcho();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    cleanup();
  });

  it('uses Echo.private() instead of Echo.channel()', () => {
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-1']}>
        <Bulb id="bulb-1" />
      </MemoryRouter>,
    );

    expect(mockPrivate).toHaveBeenCalledWith('clarion-app-wizlights');
    expect(mockChannel).not.toHaveBeenCalled();
  });

  it('channel name matches backend broadcastOn return value', () => {
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-1']}>
        <Bulb id="bulb-1" />
      </MemoryRouter>,
    );

    // Backend BulbStatusEvent::broadcastOn() returns PrivateChannel('clarion-app-wizlights')
    // which serializes to 'private-clarion-app-wizlights'
    // Frontend Echo.private('clarion-app-wizlights') subscribes to the same channel
    expect(mockPrivate).toHaveBeenCalledWith('clarion-app-wizlights');
  });
});
