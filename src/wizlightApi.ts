import { createApi, TagDescription } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '@clarion-app/frontend-base';
import { backend } from './config';
import { BulbStateType } from './types';

export const wizlightApi = (() => {
    const api = createApi({
        reducerPath: 'wizlightApi',
        baseQuery: createBaseQuery({ routePrefix: '/api/clarion-app/wizlights', backendConfig: backend }),
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
