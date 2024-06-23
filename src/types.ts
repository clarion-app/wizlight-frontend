export interface LaravelModelType {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

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