import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { backend } from '.';

const rawBaseQuery = (baseUrl: string) => fetchBaseQuery({ baseUrl: baseUrl });
function baseQuery(): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
    return async (args, api, extraOptions) => {
        let result = await rawBaseQuery((await backend).url)(args, api, extraOptions);
        return result;
    };
}

export const bulbApi = (() => {
    const api = createApi({
    reducerPath: 'bulbApi',
    baseQuery: baseQuery(),
    tagTypes: ['WizlightBulb'],
    endpoints: (builder) => ({
        getBulbs: builder.query({
        query: () => 'api/wizlight-bulb',
        }),
        getBulb: builder.query({
        query: (id) => `api/wizlight-bulb/${id}`,
        }),
        deleteBulb: builder.mutation({
        query: (id) => ({
            url: `api/wizlight-bulb/${id}`,
            method: 'DELETE',
        }),
        }),
        setBulb: builder.mutation({
        query: ({ id, state }) => ({
            url: `api/wizlight-bulb/${id}`,
            method: 'PUT',
            body: { state },
        }),
        }),
    }),
 });
 return api;
})();

export const { useGetBulbsQuery, useGetBulbQuery, useDeleteBulbMutation, useSetBulbMutation } = bulbApi;