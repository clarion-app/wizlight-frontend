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
    blue: number;
    capability_class: string | null;
    dimming: number;
    green: number;
    group: string;
    ip: string;
    last_seen: BulbLastSeenType;
    local_node_id: string;
    mac: string;
    min_brightness_pct: number | null;
    mode: string;
    name: string;
    red: number;
    room_id: string;
    signal: string;
    state: number;
    temperature?: number;
    warmth_max_kelvin: number | null;
    warmth_min_kelvin: number | null;
    wiz_group_id: number | null;
    wiz_room_id: number | null;

}

export interface RoomType extends LaravelModelType {
    blue: number;
    dimming: number;
    green: number;
    name: string;
    red: number;
    state: number;
    temperature?: number;

}