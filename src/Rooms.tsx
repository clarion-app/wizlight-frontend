import { useCreateRoomMutation, useGetRoomsQuery, useSetRoomMutation } from "./wizlightApi"
import { RoomType } from "./types";
import { useState } from "react";

const Rooms = () => {
    const { data, error, isLoading, isSuccess, isError } = useGetRoomsQuery(null);
    const [newRoomName, setNewRoomName] = useState<string>("");
    const [setRoom, { isLoading: setRoomIsLoading, isSuccess: setRoomIsSuccess, isError: setRoomIsError }] = useSetRoomMutation();
    const [createRoom, { isLoading: createRoomIsLoading, isSuccess: createRoomIsSuccess, isError: createRoomIsError }] = useCreateRoomMutation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error: {error.toString()}</div>;
    }

    if (isSuccess) {
        return (
            <div className="fixed-grid has-1-cols">
              <h1 className="title">Wizlight - Rooms</h1>
                <ul>
                    {data.map((room: RoomType) => (
                        <a href={"/clarion-app/wizlights/rooms/" + room.name} key={room.id}>
                            {room.name}
                        </a>
                    ))}
                </ul>
                <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                <button onClick={() => {
                    console.log('newRoomName', newRoomName);
                    createRoom({ name: newRoomName });
                    setNewRoomName("");
                  }
                }>Add room</button>
            </div>
        );
    }

    return <div>Unknown error</div>;
}

export default Rooms;
