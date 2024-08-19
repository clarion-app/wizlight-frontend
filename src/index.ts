import Bulbs from "./Bulbs";
import Room from "./Room";
import Rooms from "./Rooms";
import { wizlightApi, invalidateTag } from "./wizlightApi";
import { BackendType, WindowWS } from "@clarion-app/types";

export const backend: BackendType = { url: "http://localhost:8000", token: "" };

export const initializeFrontend = (setBackendUrl: string) => {
  backend.url = setBackendUrl;

  const win = window as unknown as WindowWS;
  if(win.Echo) {
    win.Echo.channel('clarion-app-wizlights')
      .listen('.ClarionApp\\WizlightBackend\\Events\\BulbStatusEvent', (e: any) => {
        console.log('BulbStatusEvent detected: ', e);
        invalidateTag();
      })
  }
};

export const setFrontendToken = (token: string) => {
  backend.token = token;
};

export { Bulbs, Room, Rooms, wizlightApi };
export { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } from "./wizlightApi";
