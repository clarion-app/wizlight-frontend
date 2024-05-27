import { baseUrl } from "./baseUrl";
import { BulbStateType } from "./types";

const getState = async (id: string | null) => {
    const url = id ? `${baseUrl}/api/wizlight-bulb/${id}` : `${baseUrl}/api/wizlight-bulb`;
    return fetch(url)
    .then(response => response.json())
    .then((data: BulbStateType[]) => {
        return data;
    });
};

export default getState;