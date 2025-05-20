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
    dimming: number;
    green: number;
    group: string;
    ip: string;
    last_seen: BulbLastSeenType;
    local_node_id: string;
    mac: string;
    mode: string;
    name: string;
    red: number;
    room_id: string;
    signal: string;
    state: number;
    temperature?: number;

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