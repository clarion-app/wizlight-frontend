import { LaravelModelType } from "@clarion-app/types";

export interface BulbStateType extends LaravelModelType {
    local_node_id: string;
    mac: string;
    ip: string;
    name: string;
    mode: string;
    group: string;
    dimming: number;
    state: number;
    temperature?: number;
    red: number;
    green: number;
    blue: number;
    signal: string;
}