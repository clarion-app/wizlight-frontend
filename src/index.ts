import Bulbs from "./Bulbs";
import Room from "./Room";
import Rooms from "./Rooms";
import { wizlightApi, invalidateTag } from "./wizlightApi";
import { BackendType, WindowWS } from "@clarion-app/types";

export const backend: BackendType = { url: "http://localhost:8000", user: { id: "", name: "", email: ""} };

export const updateFrontend = (config: BackendType) => {
    backend.url = config.url;
    backend.user = config.user;
};

export { Bulbs, Room, Rooms, wizlightApi };
export { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } from "./wizlightApi";
