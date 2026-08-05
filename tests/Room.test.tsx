import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the index module
vi.mock('../src', () => ({
  backend: {
    url: 'http://localhost:8000',
    token: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  },
}));

// Scene catalogue fixture — matches contracts/scene-catalogue.md
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

// Mixed-room fixture: 3 full_colour + 2 tunable_white bulbs (5 total).
// Ocean (1) is full_colour only, so it should skip the 2 tunable_white members.
const mixedRoomBulbs = [
  {
    id: 'bulb-fc-1',
    name: 'FC Bulb 1',
    state: 1,
    dimming: 80,
    red: 255,
    green: 0,
    blue: 0,
    temperature: 2700,
    capability_class: 'full_colour',
    ip: '192.168.1.10',
    mac: 'aa:bb:cc:dd:ee:10',
    room_id: 'room-mixed',
    signal: '-50',
    local_node_id: 'test-node',
    group: '',
    mode: '',
    active_mode: 'rgb',
    scene_id: null,
    scene_speed: null,
    white_warm: null,
    white_cool: null,
    head_ratio: null,
    dual_head: null,
    warmth_max_kelvin: 6500,
    warmth_min_kelvin: 2200,
    min_brightness_pct: 1,
    wiz_group_id: null,
    wiz_room_id: null,
    last_seen: {
      id: 1,
      bulb_id: 1,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  },
  {
    id: 'bulb-fc-2',
    name: 'FC Bulb 2',
    state: 1,
    dimming: 70,
    red: 0,
    green: 255,
    blue: 0,
    temperature: 2700,
    capability_class: 'full_colour',
    ip: '192.168.1.11',
    mac: 'aa:bb:cc:dd:ee:11',
    room_id: 'room-mixed',
    signal: '-50',
    local_node_id: 'test-node',
    group: '',
    mode: '',
    active_mode: 'rgb',
    scene_id: null,
    scene_speed: null,
    white_warm: null,
    white_cool: null,
    head_ratio: null,
    dual_head: null,
    warmth_max_kelvin: 6500,
    warmth_min_kelvin: 2200,
    min_brightness_pct: 1,
    wiz_group_id: null,
    wiz_room_id: null,
    last_seen: {
      id: 2,
      bulb_id: 2,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  },
  {
    id: 'bulb-fc-3',
    name: 'FC Bulb 3',
    state: 1,
    dimming: 60,
    red: 0,
    green: 0,
    blue: 255,
    temperature: 2700,
    capability_class: 'full_colour',
    ip: '192.168.1.12',
    mac: 'aa:bb:cc:dd:ee:12',
    room_id: 'room-mixed',
    signal: '-50',
    local_node_id: 'test-node',
    group: '',
    mode: '',
    active_mode: 'rgb',
    scene_id: null,
    scene_speed: null,
    white_warm: null,
    white_cool: null,
    head_ratio: null,
    dual_head: null,
    warmth_max_kelvin: 6500,
    warmth_min_kelvin: 2200,
    min_brightness_pct: 1,
    wiz_group_id: null,
    wiz_room_id: null,
    last_seen: {
      id: 3,
      bulb_id: 3,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  },
  {
    id: 'bulb-tw-1',
    name: 'TW Bulb 1',
    state: 1,
    dimming: 50,
    red: 0,
    green: 0,
    blue: 0,
    temperature: 3500,
    capability_class: 'tunable_white',
    ip: '192.168.1.20',
    mac: 'aa:bb:cc:dd:ee:20',
    room_id: 'room-mixed',
    signal: '-50',
    local_node_id: 'test-node',
    group: '',
    mode: '',
    active_mode: 'warmth',
    scene_id: null,
    scene_speed: null,
    white_warm: null,
    white_cool: null,
    head_ratio: null,
    dual_head: null,
    warmth_max_kelvin: 6500,
    warmth_min_kelvin: 2200,
    min_brightness_pct: 1,
    wiz_group_id: null,
    wiz_room_id: null,
    last_seen: {
      id: 4,
      bulb_id: 4,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  },
  {
    id: 'bulb-tw-2',
    name: 'TW Bulb 2',
    state: 1,
    dimming: 40,
    red: 0,
    green: 0,
    blue: 0,
    temperature: 4000,
    capability_class: 'tunable_white',
    ip: '192.168.1.21',
    mac: 'aa:bb:cc:dd:ee:21',
    room_id: 'room-mixed',
    signal: '-50',
    local_node_id: 'test-node',
    group: '',
    mode: '',
    active_mode: 'warmth',
    scene_id: null,
    scene_speed: null,
    white_warm: null,
    white_cool: null,
    head_ratio: null,
    dual_head: null,
    warmth_max_kelvin: 6500,
    warmth_min_kelvin: 2200,
    min_brightness_pct: 1,
    wiz_group_id: null,
    wiz_room_id: null,
    last_seen: {
      id: 5,
      bulb_id: 5,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  },
];

const mixedRoom = {
  id: 'room-mixed',
  name: 'Mixed Room',
  state: 1,
  red: 100,
  green: 100,
  blue: 100,
  dimming: 75,
  temperature: 3000,
  active_mode: null,
  scene_id: null,
  scene_speed: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock RTK Query hooks — setRoom returns capability_skips in the result
const mockSetRoom = vi.fn().mockResolvedValue({
  data: {
    ...mixedRoom,
    active_mode: 'scene',
    scene_id: 1,
    capability_skips: [
      {
        bulb_id: 'bulb-tw-1',
        field: 'scene_id',
        reason: "Scene 'Ocean' (1) is not supported by tunable_white device",
      },
      {
        bulb_id: 'bulb-tw-2',
        field: 'scene_id',
        reason: "Scene 'Ocean' (1) is not supported by tunable_white device",
      },
    ],
  },
});

// Drives the queries' loading state so a test can render the loading branch
// and then the resolved one, the way the real app does on first mount.
const queryState = { isLoading: false };

vi.mock('../src/wizlightApi', () => ({
  useGetBulbsQuery: () => ({
    data: queryState.isLoading ? undefined : mixedRoomBulbs,
    isLoading: queryState.isLoading,
    refetch: vi.fn(),
  }),
  useGetRoomsQuery: () => ({
    data: queryState.isLoading ? undefined : [mixedRoom],
    isLoading: queryState.isLoading,
    refetch: vi.fn(),
  }),
  useSetRoomMutation: () => [mockSetRoom, { isLoading: false, isSuccess: false, isError: false }],
  useSetBulbMutation: () => [vi.fn(), { isLoading: false, isSuccess: false, isError: false }],
  useDeleteRoomMutation: () => [vi.fn(), { isLoading: false }],
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

// Echo mock
vi.mock('../src/channels', () => ({
  WIZLIGHT_CHANNEL: 'wizlights',
  BULB_STATUS_EVENT: 'bulb.status',
  BULB_COMMAND_FAILED_EVENT: 'bulb.command.failed',
}));

// Channel double for Echo.private() — matches Bulb.test.tsx pattern
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

function setupEcho() {
  (window as any).Echo = {
    private: mockPrivate,
  };
}

const { default: Room } = await import('../src/Room');

describe('Room', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupEcho();
    queryState.isLoading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders room name', () => {
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/rooms/Mixed%20Room']}>
        <Routes>
          <Route path="/clarion-app/wizlights/rooms/:name" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Mixed Room')).toBeInTheDocument();
  });

  it('survives the loading-to-loaded transition without changing hook order', () => {
    // The scene-picker useMemo must be called on every render, including the
    // one that returns "Loading..." early. Placed after that return it is
    // skipped on the first render and appears on the second, which React
    // rejects with "Rendered more hooks than during the previous render".
    const renderTree = () => (
      <MemoryRouter initialEntries={['/clarion-app/wizlights/rooms/Mixed%20Room']}>
        <Routes>
          <Route path="/clarion-app/wizlights/rooms/:name" element={<Room />} />
        </Routes>
      </MemoryRouter>
    );

    queryState.isLoading = true;
    const { rerender } = render(renderTree());
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    queryState.isLoading = false;
    rerender(renderTree());

    expect(screen.getByText('Mixed Room')).toBeInTheDocument();
    expect(screen.getByTestId('room-scene-picker')).toBeInTheDocument();
  });

  // ------------------------------------------------------------------
  // Phase 6 (US3): Room scene picker — union of member-supported scenes
  // ------------------------------------------------------------------

  it('room scene picker offers union of member-supported scenes not intersection', () => {
    // The room has 3 full_colour + 2 tunable_white bulbs.
    // Union of supported scenes = full_colour scenes (36) + tunable_white-only scene (Dim-to-warm/40) = 37 total.
    // Intersection would only be the 17 tunable_white scenes.
    // The scene picker should offer the union (37 scenes), not the intersection (17).
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/rooms/Mixed%20Room']}>
        <Routes>
          <Route path="/clarion-app/wizlights/rooms/:name" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );

    // Find the ROOM-level scene picker select element.
    // The room-level picker should have data-testid="room-scene-picker" to
    // distinguish it from the per-bulb scene pickers.
    const sceneSelect = document.querySelector('select[data-testid="room-scene-picker"]');

    // The scene picker should exist and offer the union of all member-supported scenes.
    // Ocean (id=1) is full_colour only — it should be in the union.
    // Dim-to-warm (id=40) is tunable_white only — it should be in the union.
    // If the picker used intersection, Ocean would not appear.
    expect(sceneSelect).not.toBeNull();

    if (sceneSelect) {
      const options = sceneSelect.querySelectorAll('option');
      const values = Array.from(options).map((o) => (o as HTMLOptionElement).value);

      // Ocean (1) is full_colour only — must be in the union.
      expect(values).toContain('1');

      // Dim-to-warm (40) is tunable_white only — must be in the union.
      expect(values).toContain('40');

      // Total options should be 37 (the full catalogue, which is the union
      // of full_colour and tunable_white scene sets).
      // Filter out empty placeholder options.
      const sceneOptions = Array.from(options).filter(
        (o) => (o as HTMLOptionElement).value !== '0',
      );
      expect(sceneOptions).toHaveLength(37);
    }
  });

  // ------------------------------------------------------------------
  // Phase 6 (US3): "Applied to N of M bulbs" from capability_skips
  // ------------------------------------------------------------------

  it('shows applied-to-N-of-M message when some members skipped', async () => {
    // When a scene is applied and the backend returns capability_skips,
    // the room component should show "Applied to 3 of 5 bulbs" (3 applied,
    // 2 skipped out of 5 total members).
    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/rooms/Mixed%20Room']}>
        <Routes>
          <Route path="/clarion-app/wizlights/rooms/:name" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );

    // The setRoom mutation mock returns capability_skips with 2 tunable_white bulbs.
    // After the mutation resolves, the UI should show "Applied to 3 of 5 bulbs".
    // We trigger the scene selection which calls setRoom.
    const sceneSelect = document.querySelector('select[data-testid="room-scene-picker"]');
    expect(sceneSelect).not.toBeNull();

    fireEvent.change(sceneSelect!, { target: { value: '1' } });

    // After the mutation resolves, the "Applied to N of M" message should appear.
    // The message is derived from capability_skips:
    // applied = members - distinct bulb_ids in capability_skips where field === 'scene_id'
    // applied = 5 - 2 = 3 => "Applied to 3 of 5 bulbs"
    // We check for the message text in the DOM.
    await waitFor(() => {
      const message = document.body.textContent ?? '';
      expect(message).toMatch(/applied to \d+ of \d+ bulb/i);
    });
  });

  it('shows no applied-to message when nothing was skipped', async () => {
    // When a scene is applied and NO members are skipped (all support the scene),
    // the room component should NOT show an "Applied to N of M" message.
    // We test with a scene that all members support (e.g., Wake-up/9, which is
    // in all three classes: full_colour, tunable_white, dim_only).

    // Override the mock to return no capability_skips.
    mockSetRoom.mockResolvedValueOnce({
      data: {
        ...mixedRoom,
        active_mode: 'scene',
        scene_id: 9, // Wake-up — supported by all classes
        capability_skips: [],
      },
    });

    render(
      <MemoryRouter initialEntries={['/clarion-app/wizlights/rooms/Mixed%20Room']}>
        <Routes>
          <Route path="/clarion-app/wizlights/rooms/:name" element={<Room />} />
        </Routes>
      </MemoryRouter>,
    );

    const sceneSelect = document.querySelector('select[data-testid="room-scene-picker"]');
    expect(sceneSelect).not.toBeNull();

    fireEvent.change(sceneSelect!, { target: { value: '9' } });

    // When no members are skipped, no "Applied to N of M" message should appear.
    // Wait for the mutation to resolve and the component to re-render.
    await waitFor(() => {
      // After the mutation resolves, the scene picker should reflect the new scene_id.
      const select = document.querySelector('select[data-testid="room-scene-picker"]');
      expect(select).not.toBeNull();
    });
    const message = document.body.textContent ?? '';
    expect(message).not.toMatch(/applied to \d+ of \d+ bulb/i);
  });
});
