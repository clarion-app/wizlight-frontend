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

// A shared last-seen shape reused by every fixture bulb below.
const makeLastSeen = (bulbId: number) => ({
  id: bulbId,
  bulb_id: bulbId,
  last_seen_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
});

// Capability-class fixtures for control-visibility gating. red/green/blue are
// deliberately non-zero on all four so the *current* colorType-toggle
// behavior (which shows the colour wheel whenever red||green||blue is set,
// regardless of capability_class) picks the RGB branch uniformly — this is
// what makes the capability-gating assertions below fail against the
// unmodified component rather than passing by accident of fixture data.
const dimOnlyBulb = {
  id: 'bulb-dim-only',
  name: 'Dim Only Bulb',
  state: 1,
  dimming: 60,
  red: 10,
  green: 20,
  blue: 30,
  temperature: 2700,
  capability_class: 'dim_only',
  ip: '192.168.1.11',
  mac: 'aa:bb:cc:dd:ee:01',
  room_id: null,
  signal: '-50',
  local_node_id: 'test-node',
  group: '',
  mode: '',
  last_seen: makeLastSeen(2),
};

const tunableWhiteBulb = {
  ...dimOnlyBulb,
  id: 'bulb-tunable-white',
  name: 'Tunable White Bulb',
  capability_class: 'tunable_white',
  mac: 'aa:bb:cc:dd:ee:02',
  last_seen: makeLastSeen(3),
};

const fullColourBulb = {
  ...dimOnlyBulb,
  id: 'bulb-full-colour',
  name: 'Full Colour Bulb',
  capability_class: 'full_colour',
  mac: 'aa:bb:cc:dd:ee:03',
  last_seen: makeLastSeen(4),
};

const unprobedBulb = {
  ...dimOnlyBulb,
  id: 'bulb-unprobed',
  name: 'Unprobed Bulb',
  capability_class: null,
  mac: 'aa:bb:cc:dd:ee:04',
  last_seen: makeLastSeen(5),
};

// Mock RTK Query hooks to return data synchronously (avoids loading state crash)
vi.mock('../src/wizlightApi', () => ({
  useGetBulbsQuery: () => ({
    data: [
      {
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
      },
      dimOnlyBulb,
      tunableWhiteBulb,
      fullColourBulb,
      unprobedBulb,
    ],
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

describe('Bulb - capability-gated controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupEcho();
  });

  afterEach(() => {
    cleanup();
  });

  // A "brightness control" is the always-present dimming indicator — every
  // capability class supports it, so it renders unconditionally regardless
  // of capability_class.
  const expectBrightnessControl = (container: HTMLElement) => {
    expect(container.querySelector('.tag.is-info')?.textContent).toMatch(/%$/);
  };

  const hasColourWheel = (container: HTMLElement) =>
    container.querySelector('.color-wheel-container') !== null;

  const hasWarmthSlider = (container: HTMLElement) =>
    container.querySelector('.temperature-container') !== null;

  it('dim_only: shows only a brightness control — no colour picker, no warmth slider', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-dim-only']}>
        <Bulb id="bulb-dim-only" />
      </MemoryRouter>,
    );

    expectBrightnessControl(container);
    expect(hasColourWheel(container)).toBe(false);
    expect(hasWarmthSlider(container)).toBe(false);
  });

  it('tunable_white: shows brightness and warmth controls, but no colour picker', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-tunable-white']}>
        <Bulb id="bulb-tunable-white" />
      </MemoryRouter>,
    );

    expectBrightnessControl(container);
    expect(hasColourWheel(container)).toBe(false);
    expect(hasWarmthSlider(container)).toBe(true);
  });

  it('full_colour: shows brightness, warmth, and colour controls', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-full-colour']}>
        <Bulb id="bulb-full-colour" />
      </MemoryRouter>,
    );

    expectBrightnessControl(container);
    expect(hasColourWheel(container)).toBe(true);
    expect(hasWarmthSlider(container)).toBe(true);
  });

  it('capability_class null (unprobed): renders identically to dim_only — brightness only', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/bulbs/bulb-unprobed']}>
        <Bulb id="bulb-unprobed" />
      </MemoryRouter>,
    );

    expectBrightnessControl(container);
    expect(hasColourWheel(container)).toBe(false);
    expect(hasWarmthSlider(container)).toBe(false);
  });
});
