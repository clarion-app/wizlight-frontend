import { useParams } from "react-router-dom";
import {
  useGetBulbsQuery,
  useGetRoomsQuery,
  useSetBulbMutation,
  useSetRoomMutation,
} from "./wizlightApi";
import { BulbStateType, RoomType } from "./types";
import Bulb from "./Bulb";
import Wheel from "@uiw/react-color-wheel";
import { hexToHsva } from "@uiw/color-convert";
import React, { useState } from "react";

const Room = () => {
  const { name } = useParams();
  const {
    data: rooms,
    error: roomsError,
    isLoading: roomsLoading,
    isSuccess: roomsSuccess,
    isError: roomsIsError,
  } = useGetRoomsQuery(null);
  const {
    data: bulbs,
    error: bulbsError,
    isLoading: bulbsLoading,
    isSuccess: bulbsSuccess,
    isError: bulbsIsError,
  } = useGetBulbsQuery(null);
  const [
    setBulb,
    {
      isLoading: setBulbIsLoading,
      isSuccess: setBulbIsSuccess,
      isError: setBulbIsError,
    },
  ] = useSetBulbMutation();
  const [setRoom] = useSetRoomMutation();

  const room: RoomType = rooms?.find((room: RoomType) => room.name === name);

  const [roomState, setRoomState] = useState(room?.state || 0);

  // Room color state
  const [red, setRed] = useState(room?.red || 0);
  const [green, setGreen] = useState(room?.green || 0);
  const [blue, setBlue] = useState(room?.blue || 0);
  const [dimming, setDimming] = useState(room?.dimming || 100);
  const [editName, setEditName] = useState(false);
  const [roomName, setRoomName] = useState(room?.name || "");

  // Hex color for Wheel
  const hexValue = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
  const [hexColor, setHexColor] = useState(hexValue);

  React.useEffect(() => {
    if (room) {
      setRed(room.red || 0);
      setGreen(room.green || 0);
      setBlue(room.blue || 0);
      setDimming(room.dimming || 100);
      setRoomName(room.name || "");
      setHexColor(
        `#${(room.red || 0).toString(16).padStart(2, "0")}${(room.green || 0)
          .toString(16)
          .padStart(2, "0")}${(room.blue || 0).toString(16).padStart(2, "0")}`
      );
      setRoomState(room.state || 0);
    }
  }, [room]);

  if (roomsLoading || bulbsLoading) {
    return <div>Loading...</div>;
  }

  if (roomsIsError || bulbsIsError) {
    return <div>Error: {roomsError?.toString() || bulbsError?.toString()}</div>;
  }

  const roomBulbs = bulbs.filter((b: BulbStateType) => b.room_id === room.id);
  const unassignedBulbs = bulbs.filter(
    (b: BulbStateType) => b.room_id === null
  );

  const handleAssign = (bulb: BulbStateType) => {
    setBulb({ ...bulb, room_id: room.id });
  };

  const handleRoomColorChange = (color: any) => {
    const r = parseInt(color.hex.slice(1, 3), 16);
    const g = parseInt(color.hex.slice(3, 5), 16);
    const b = parseInt(color.hex.slice(5, 7), 16);
    setHexColor(color.hex);
    setRed(r);
    setGreen(g);
    setBlue(b);
    if (room) {
      const newValue = {
        ...room,
        name: roomName,
        red,
        green,
        blue,
        dimming,
        state: roomState,
      };
      console.log("Saving room: ", newValue);
      setRoom({
        id: room.id,
        state: newValue,
      });
    }
  };

  const handleDimmingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDimming(value);
    if (room) {
      setRoom({
        id: room.id,
        state: {
          ...room,
          name: roomName,
          red,
          green,
          blue,
          dimming: value,
        },
      });
    }
  };

  const handleRoomSave = () => {
    if (!room) return;
    const newValue = {
      ...room,
      name: roomName,
      red,
      green,
      blue,
      dimming,
      state: roomState,
    };
    console.log("Saving room: ", newValue);
    setRoom({ id: room.id, state: newValue });
    setEditName(false);
  };

  return (
    <div className="fixed-grid has-2-cols">
      <h1 className="title">Wizlight - {name}</h1>

      {/* Room Color/Name Edit Interface */}
      <div
        style={{
          marginBottom: "1em",
          background: "#f8f8f8",
          padding: "1em",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <Wheel
            color={hexToHsva(hexColor)}
            onChange={handleRoomColorChange}
            width={100}
            height={100}
          />
          <div>
            {editName ? (
              <>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  autoFocus
                />
                <button onClick={handleRoomSave} className="button">
                  Save
                </button>
                <button onClick={() => setEditName(false)} className="button">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2>{roomName}</h2>
                <button onClick={() => setEditName(true)} className="button">
                  Edit
                </button>
                <button
                  onClick={() => {
                    const newState = roomState ? 0 : 1;
                    console.log("Current state: ", roomState);
                    console.log("Changing state to: ", newState);
                    setRoomState(newState);
                    if (room) {
                      setRoom({
                        id: room.id,
                        state: {
                          ...room,
                          name: roomName,
                          red,
                          green,
                          blue,
                          dimming,
                          state: newState,
                        },
                      });
                    }
                  }}
                  className="button"
                >
                  Turn {roomState ? "off" : "on"}
                </button>
              </>
            )}
            <div>
              <label>
                Dimming:
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={dimming}
                  onChange={handleDimmingChange}
                  style={{ width: "100px", marginLeft: "0.5em" }}
                />
                <span style={{ marginLeft: "0.5em" }}>{dimming}%</span>
              </label>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Room;
