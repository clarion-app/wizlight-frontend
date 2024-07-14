import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, TagDescription } from '@reduxjs/toolkit/query/react';
import { backend } from '.';

const rawBaseQuery = (baseUrl: string) => fetchBaseQuery({ baseUrl: baseUrl });
function baseQuery(): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
    return async (args, api, extraOptions) => {
        let result = await rawBaseQuery((await backend).url + '/api/clarion-app/wizlight')(args, api, extraOptions);
        return result;
    };
}

export const wizlightApi = (() => {
    const api = createApi({
    reducerPath: 'wizlightApi',
    baseQuery: baseQuery(),
    tagTypes: ['WizlightBulb', 'WizlightRoom'],
    endpoints: (builder) => ({
        getBulbs: builder.query({
        query: () => 'bulb',
        providesTags: ['WizlightBulb'],
        }),
        getBulb: builder.query({
        query: (id) => `bulb/${id}`,
        providesTags: ['WizlightBulb'],
        }),
        deleteBulb: builder.mutation({
        query: (id) => ({
            url: `bulb/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['WizlightBulb'],
        }),
        setBulb: builder.mutation({
        query: ({ id, state }) => ({
            url: `bulb/${id}`,
            method: 'PUT',
            body: { state },
        }),
        invalidatesTags: ['WizlightBulb'],
        }),
        getRooms: builder.query({
        query: () => 'room',
        providesTags: ['WizlightRoom'],
        }),
        getRoom: builder.query({
        query: (id) => `room/${id}`,
        providesTags: ['WizlightRoom'],
        }),
        deleteRoom: builder.mutation({
        query: (id) => ({
            url: `room/${id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['WizlightRoom'],
        }),
        setRoom: builder.mutation({
        query: ({ id, state }) => ({
            url: `room/${id}`,
            method: 'PUT',
            body: state,
        }),
        invalidatesTags: ['WizlightRoom'],
        }),
        createRoom: builder.mutation({
            query: (state) => ({
                url: 'room',
                method: 'POST',
                body: state,
            }),
            invalidatesTags: ['WizlightRoom'],  // Invalidate specific tag here
        }),
    }),
 });
 return api;
})();

export const invalidateTag = (tag: TagDescription<'WizlightBulb' | 'WizlightRoom'>) => {
    wizlightApi.util.invalidateTags([tag]);
};

export const {
    useGetBulbsQuery, 
    useGetBulbQuery,
    useDeleteBulbMutation,
    useSetBulbMutation,
    useGetRoomsQuery,
    useGetRoomQuery,
    useSetRoomMutation,
    useDeleteRoomMutation,
    useCreateRoomMutation
} = wizlightApi;