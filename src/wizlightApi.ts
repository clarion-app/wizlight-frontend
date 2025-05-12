import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, TagDescription } from '@reduxjs/toolkit/query/react';
import { backend } from '.';
import { BulbStateType } from './types';

const rawBaseQuery = (baseUrl: string) => fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        headers.set('Authorization', 'Bearer ' + backend.token);
        return headers;
    }
});

function baseQuery(): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
    return async (args, api, extraOptions) => {
        let result = await rawBaseQuery((await backend).url + '/api/clarion-app/wizlights')(args, api, extraOptions);
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
                query: (state) => ({
                    url: `bulb/${state.id}`,
                    method: 'PUT',
                    body: state,
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
            updateBulbLocally: builder.mutation({
                queryFn: (bulb) => {
                    // Return a dummy result – this won't contact the backend
                    return { data: bulb };
                },
                onQueryStarted: (bulb, { dispatch }) => {
                    console.log(bulb);
                    try {
                        dispatch(
                            api.util.updateQueryData('getBulb', bulb.id, (draft) => {
                                Object.assign(draft, bulb);
                            })
                        );
                    } catch {
                        // Fail silently — this is local-only
                    }
                },
            }),
        }),
    });
    return api;
})();

export const invalidateTag = () => {
    console.log('invalidateTag');
    wizlightApi.util.invalidateTags(['WizlightBulb', 'WizlightRoom']);
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
    useCreateRoomMutation,
    useUpdateBulbLocallyMutation
} = wizlightApi;
