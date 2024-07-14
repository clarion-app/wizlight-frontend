import Bulbs from "./Bulbs";
import Room from "./Room";
import Rooms from "./Rooms";
import { wizlightApi as wizlightFrontendApi, invalidateTag } from "./wizlightApi";
import { BackendType, WindowWS } from "@clarion-app/types";

export const backend: BackendType = { url: "http://localhost:8000" };

const initializeWizlightFrontend = (setBackendUrl: string) => {
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

export { Bulbs, Room, Rooms, initializeWizlightFrontend, wizlightFrontendApi };
export { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } from "./wizlightApi";
