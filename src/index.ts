import Bulbs from "./Bulbs";
import Room from "./Room";
import Rooms from "./Rooms";
import { wizlightApi as wizlightFrontendApi } from "./wizlightApi";
import { BackendType } from "@clarion-app/types";

export const backend: BackendType = { url: "http://localhost:8000" };

const initializeWizlightFrontend = (setBackendUrl: string) => {
  backend.url = setBackendUrl;
};

export { Bulbs, Room, Rooms, initializeWizlightFrontend, wizlightFrontendApi };
export { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } from "./wizlightApi";
