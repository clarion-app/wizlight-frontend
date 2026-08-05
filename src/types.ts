import { LaravelModelType } from "@clarion-app/types";

export interface BulbLastSeenType {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    bulb_id: number;
    last_seen_at: string;
}

export interface BulbStateType extends LaravelModelType {
    active_mode: string | null;
    blue: number;
    capability_class: string | null;
    dimming: number;
    dual_head: boolean | null;
    green: number;
    group: string;
    head_ratio: number | null;
    ip: string;
    last_seen: BulbLastSeenType;
    local_node_id: string;
    mac: string;
    min_brightness_pct: number | null;
    name: string;
    red: number;
    room_id: string;
    scene_id: number | null;
    scene_speed: number | null;
    signal: string;
    state: number;
    temperature?: number;
    white_cool: number | null;
    white_warm: number | null;
    warmth_max_kelvin: number | null;
    warmth_min_kelvin: number | null;
    wiz_group_id: number | null;
    wiz_room_id: number | null;
}

export interface SceneType {
    id: number;
    name: string;
    animated: boolean;
    classes: string[];
}

export interface RoomType extends LaravelModelType {
    active_mode: string | null;
    blue: number;
    dimming: number;
    green: number;
    name: string;
    red: number;
    scene_id: number | null;
    scene_speed: number | null;
    state: number;
    temperature?: number;
}