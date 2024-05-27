import { baseUrl } from "./baseUrl";
import { BulbStateType } from "./types";

const setState = async (id: string, state: BulbStateType) => {
    const url = `${baseUrl}/api/wizlight-bulb/${id}`;
    fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ state }),
    })
    .then(response => response.json())
    .then(data => {
        return data;
    });
};

export default setState;