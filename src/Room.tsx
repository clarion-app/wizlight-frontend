import { useParams } from "react-router-dom";
import { useGetBulbsQuery, useGetRoomsQuery, useSetBulbMutation } from './wizlightApi';
import { BulbStateType, RoomType } from "./types";
import Bulb from "./Bulb";


const Room = () => {
    const { name } = useParams();
    const { data: rooms, error: roomsError, isLoading: roomsLoading, isSuccess: roomsSuccess, isError: roomsIsError } = useGetRoomsQuery(null);
    const { data: bulbs, error: bulbsError, isLoading: bulbsLoading, isSuccess: bulbsSuccess, isError: bulbsIsError } = useGetBulbsQuery(null);
    const [setBulb, { isLoading: setBulbIsLoading, isSuccess: setBulbIsSuccess, isError: setBulbIsError }] = useSetBulbMutation();
    const room = rooms?.find((room: RoomType) => room.name === name);
    
    if (roomsLoading || bulbsLoading) {
        return <div>Loading...</div>;
    }

    if (roomsIsError || bulbsIsError) {
        return <div>Error: {roomsError?.toString() || bulbsError?.toString()}</div>;
    }

    const roomBulbs = bulbs.filter((b: BulbStateType) => b.room_id === room.id);
    const unassignedBulbs = bulbs.filter((b: BulbStateType) => b.room_id === null);

    const handleAssign = async (bulb: BulbStateType) => {
      await setBulb({ ...bulb, room_id: room.id });
    };

    return <div className="fixed-grid has-2-cols">
      <h1 className="title">Wizlight - {name}</h1>
      <div className="fixed-grid has-1-cols">
        {roomBulbs.map((bulb: BulbStateType) => (
          <div key={bulb.id} className="grid">
            <div className="cell">
              <Bulb {...bulb} />
              
            </div>
          </div>
        ))}
      </div>

      <h3>Unassigned Bulbs</h3>
      <ul>
        {unassignedBulbs.map((bulb: BulbStateType) => (
          <li key={bulb.id}>
            {bulb.name}
            <button onClick={() => handleAssign(bulb)}>Assign to {name}</button>
          </li>
        ))}
      </ul>

    </div>;
};

export default Room;

