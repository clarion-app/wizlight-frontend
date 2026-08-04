import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// This double models the real laravel-echo Channel surface and nothing more:
// listen(event, callback) returns the channel, and unsubscription is
// stopListening(event, callback?). There is deliberately no stop() — the
// previous version of this file invented one, which is why four broken cleanup
// handlers shipped and only surfaced as a TypeError in the browser.
const mockListen = vi.fn(function (this: any) {
  return this;
});
const mockStopListening = vi.fn(function (this: any) {
  return this;
});

const makeChannelDouble = () => ({
  listen: mockListen,
  stopListening: mockStopListening,
});

const mockPrivate = vi.fn(makeChannelDouble);
const mockChannel = vi.fn(makeChannelDouble);

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

  it('subscribes to both the status and the command-failed event', () => {
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-1']}>
        <Bulb id="bulb-1" />
      </MemoryRouter>,
    );

    const events = mockListen.mock.calls.map((call) => call[0]);
    expect(events).toContain('.ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent');
    expect(events).toContain('.ClarionApp\\WizlightBackend\\Events\\BulbCommandFailedEvent');
  });

  it('unsubscribes on unmount using the real Echo API, passing the callback', () => {
    // The regression this guards: cleanup called handler.stop(), which does not
    // exist on an Echo channel, so unmounting threw
    // "TypeError: statusHandler.stop is not a function".
    const { unmount } = render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-1']}>
        <Bulb id="bulb-1" />
      </MemoryRouter>,
    );

    expect(mockStopListening).not.toHaveBeenCalled();

    unmount();

    const stopped = mockStopListening.mock.calls;
    expect(stopped.map((call) => call[0])).toEqual(
      expect.arrayContaining([
        '.ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent',
        '.ClarionApp\\WizlightBackend\\Events\\BulbCommandFailedEvent',
      ]),
    );

    // Every Bulb and Room shares this one channel. Dropping the callback
    // argument would remove the other components' listeners too.
    for (const call of stopped) {
      expect(typeof call[1]).toBe('function');
    }

    // And the callback handed to stopListening must be the one that was
    // registered, or the listener stays attached and leaks.
    const listened = new Map(mockListen.mock.calls.map((call) => [call[0], call[1]]));
    for (const [event, callback] of stopped) {
      expect(callback).toBe(listened.get(event));
    }
  });
});
