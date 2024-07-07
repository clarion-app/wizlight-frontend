import Bulbs from "./Bulbs";
import { bulbApi as wizlightFrontendApi } from "./bulbApi";
import { BackendType } from "@clarion-app/types";

export const backend: BackendType = { url: "http://localhost:8000" };

const initializeWizlightFrontend = (setBackendUrl: string) => {
  backend.url = setBackendUrl;
};

export { Bulbs, initializeWizlightFrontend, wizlightFrontendApi };
export { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } from "./bulbApi";
